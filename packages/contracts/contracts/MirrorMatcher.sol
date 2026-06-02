// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MirrorMatcher
 * @notice Core matching and staged revelation contract.
 *         Controls all stage transitions for Mirror Protocol.
 *
 * @dev The agent wallet calls recordMatch() when it finds compatible vaults.
 *      Both parties must call confirmAdvance() to move to Stage 2.
 *      MirrorNDA calls onNDAComplete() to trigger Stage 3.
 *      Vault owner calls grantStage4() to unlock financials.
 *
 * SECURITY: No company names, financial data, or vault contents
 * appear in any event emitted by this contract.
 */

interface IStagedReadCondition {
    function registerVault(bytes32 vaultUUID, address vaultOwner) external;
    function upgradeStage(
        bytes32 vaultUUID,
        uint8 newStage,
        address counterpartyAgent,
        address counterpartyWallet
    ) external;
    function sealVault(bytes32 vaultUUID) external;
}

interface IMirrorNDA {
    function registerMatch(bytes32 matchId, address sellWallet, address buyWallet) external;
}

interface INegotiationRights {
    function mint(bytes32 matchId, address sellParty, address buyParty)
        external returns (uint256, uint256);
}

contract MirrorMatcher {
    IStagedReadCondition public immutable readCondition;
    IMirrorNDA public immutable mirrorNDA;
    INegotiationRights public immutable negotiationRights;
    address public immutable agentWallet;

    struct Match {
        bytes32 sellVaultUUID;
        bytes32 buyVaultUUID;
        address sellWallet;
        address buyWallet;
        uint8 score;
        uint8 stage;
        bool sellConfirmedStage2;
        bool buyConfirmedStage2;
        uint256 createdAt;
        uint256 lastAdvanced;
        bool active;
    }

    struct VaultRecord {
        address owner;
        string vaultType;    // "sell" or "buy"
        bool registered;
    }

    mapping(bytes32 => Match) public matches;
    mapping(bytes32 => VaultRecord) public vaultRecords;   // vaultUUID => record
    mapping(address => bytes32) public walletToVault;       // wallet => vaultUUID
    mapping(address => bytes32) public walletToMatch;       // wallet => current matchId

    uint256 public constant MATCH_EXPIRY = 7 days;
    uint8 public constant MATCH_THRESHOLD = 60;

    event MatchFound(bytes32 indexed matchId, uint8 score);
    event StageAdvanced(bytes32 indexed matchId, uint8 newStage);
    event MatchExpired(bytes32 indexed matchId);
    event VaultRegistered(bytes32 indexed vaultUUID, string vaultType);
    event MatchCancelled(bytes32 indexed matchId, address indexed cancelledBy);
    // NOTE: No company names, amounts, or vault contents in any event

    error NotAgent();
    error NotParty();
    error NotNDA();
    error AlreadyConfirmed();
    error MatchNotActive();
    error MatchExpiredError();
    error WrongStage();
    error VaultAlreadyRegistered();

    modifier onlyAgent() {
        if (msg.sender != agentWallet) revert NotAgent();
        _;
    }

    modifier onlyNDA() {
        if (msg.sender != address(mirrorNDA)) revert NotNDA();
        _;
    }

    constructor(
        address _readCondition,
        address _mirrorNDA,
        address _negotiationRights,
        address _agentWallet
    ) {
        readCondition = IStagedReadCondition(_readCondition);
        mirrorNDA = IMirrorNDA(_mirrorNDA);
        negotiationRights = INegotiationRights(_negotiationRights);
        agentWallet = _agentWallet;
    }

    /**
     * @notice Register a vault with the protocol.
     * @dev Called when a user creates a vault through the app.
     */
    function registerVault(
        bytes32 vaultUUID,
        address owner,
        string calldata vaultType
    ) external {
        if (vaultRecords[vaultUUID].registered) revert VaultAlreadyRegistered();

        vaultRecords[vaultUUID] = VaultRecord({
            owner: owner,
            vaultType: vaultType,
            registered: true
        });

        walletToVault[owner] = vaultUUID;

        // Register with read condition at Stage 0
        readCondition.registerVault(vaultUUID, owner);

        emit VaultRegistered(vaultUUID, vaultType);
    }

    /**
     * @notice Record a match found by the agent.
     * @dev Only callable by the agent wallet.
     *      Advances both vaults to Stage 1.
     */
    function recordMatch(
        bytes32 sellVaultUUID,
        bytes32 buyVaultUUID,
        uint8 score
    ) external onlyAgent returns (bytes32 matchId) {
        require(score >= MATCH_THRESHOLD, "Score below threshold");

        VaultRecord memory sellRecord = vaultRecords[sellVaultUUID];
        VaultRecord memory buyRecord = vaultRecords[buyVaultUUID];
        require(sellRecord.registered && buyRecord.registered, "Vault not registered");

        matchId = keccak256(abi.encodePacked(
            sellVaultUUID, buyVaultUUID, block.timestamp
        ));

        matches[matchId] = Match({
            sellVaultUUID: sellVaultUUID,
            buyVaultUUID: buyVaultUUID,
            sellWallet: sellRecord.owner,
            buyWallet: buyRecord.owner,
            score: score,
            stage: 1,
            sellConfirmedStage2: false,
            buyConfirmedStage2: false,
            createdAt: block.timestamp,
            lastAdvanced: block.timestamp,
            active: true
        });

        walletToMatch[sellRecord.owner] = matchId;
        walletToMatch[buyRecord.owner] = matchId;

        // Advance both vaults to Stage 1 (agent can now access for notification)
        readCondition.upgradeStage(sellVaultUUID, 1, agentWallet, address(0));
        readCondition.upgradeStage(buyVaultUUID, 1, agentWallet, address(0));

        emit MatchFound(matchId, score);
    }

    /**
     * @notice Both parties call this to advance from Stage 1 to Stage 2.
     * @dev When both have confirmed, thin profiles unlock.
     */
    function confirmAdvanceToStage2(bytes32 matchId) external {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        if (m.stage != 1) revert WrongStage();
        if (block.timestamp > m.createdAt + MATCH_EXPIRY) revert MatchExpiredError();

        if (msg.sender == m.sellWallet) {
            if (m.sellConfirmedStage2) revert AlreadyConfirmed();
            m.sellConfirmedStage2 = true;
        } else if (msg.sender == m.buyWallet) {
            if (m.buyConfirmedStage2) revert AlreadyConfirmed();
            m.buyConfirmedStage2 = true;
        } else {
            revert NotParty();
        }

        // Both confirmed — advance to Stage 2
        if (m.sellConfirmedStage2 && m.buyConfirmedStage2) {
            m.stage = 2;
            m.lastAdvanced = block.timestamp;

            // Each vault's counterparty agent can now read thin profile
            readCondition.upgradeStage(m.sellVaultUUID, 2, agentWallet, address(0));
            readCondition.upgradeStage(m.buyVaultUUID, 2, agentWallet, address(0));

            // Register parties with NDA contract
            mirrorNDA.registerMatch(matchId, m.sellWallet, m.buyWallet);

            emit StageAdvanced(matchId, 2);
        }
    }

    /**
     * @notice Called by MirrorNDA when both parties have signed.
     *         Advances to Stage 3 — identity reveal.
     */
    function onNDAComplete(bytes32 matchId) external onlyNDA {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        if (m.stage != 2) revert WrongStage();

        m.stage = 3;
        m.lastAdvanced = block.timestamp;

        // Both wallets can now read each other's vaults
        readCondition.upgradeStage(m.sellVaultUUID, 3, agentWallet, m.buyWallet);
        readCondition.upgradeStage(m.buyVaultUUID, 3, agentWallet, m.sellWallet);

        // Mint Negotiation Rights NFTs to both parties
        negotiationRights.mint(matchId, m.sellWallet, m.buyWallet);

        emit StageAdvanced(matchId, 3);
    }

    /**
     * @notice Vault owner grants Stage 4 access (financial details).
     * @dev Voluntary — the seller decides when to share financials.
     */
    function grantStage4(bytes32 matchId) external {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        if (m.stage != 3) revert WrongStage();
        if (msg.sender != m.sellWallet) revert NotParty();

        m.stage = 4;
        m.lastAdvanced = block.timestamp;

        readCondition.upgradeStage(m.sellVaultUUID, 4, agentWallet, m.buyWallet);

        emit StageAdvanced(matchId, 4);
    }

    /**
     * @notice Cancel a match at Stage 1 or 2. Either party may call this.
     * @dev Not callable at Stage 3+ — the NDA is already signed and identity reveal is permanent.
     */
    function cancelMatch(bytes32 matchId) external {
        Match storage m = matches[matchId];
        require(m.active, "Match not active");
        require(m.stage == 1 || m.stage == 2, "Cannot cancel at this stage");
        require(
            msg.sender == m.sellWallet || msg.sender == m.buyWallet,
            "Not a party to this match"
        );

        m.active = false;

        // Reseal both vaults — no trace
        readCondition.sealVault(m.sellVaultUUID);
        readCondition.sealVault(m.buyVaultUUID);

        // Clear match references so both wallets can match again
        walletToMatch[m.sellWallet] = bytes32(0);
        walletToMatch[m.buyWallet] = bytes32(0);

        emit MatchCancelled(matchId, msg.sender);
        // NOTE: emit no names, no side info — just matchId and caller
    }

    /**
     * @notice Expire an inactive match and reseal vaults.
     * @dev Anyone can call this — expired matches should be cleaned up.
     */
    function expireMatch(bytes32 matchId) external {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        require(
            block.timestamp > m.createdAt + MATCH_EXPIRY,
            "Match not yet expired"
        );

        m.active = false;

        // Reseal both vaults — data sealed, no trace
        readCondition.sealVault(m.sellVaultUUID);
        readCondition.sealVault(m.buyVaultUUID);

        // Free both wallets to match again
        walletToMatch[m.sellWallet] = bytes32(0);
        walletToMatch[m.buyWallet] = bytes32(0);

        emit MatchExpired(matchId);
    }

    // ─── View Functions ───────────────────────────────────────────

    function getMatch(bytes32 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    function getMatchForWallet(address wallet) external view returns (bytes32) {
        return walletToMatch[wallet];
    }

    function getVaultForWallet(address wallet) external view returns (bytes32) {
        return walletToVault[wallet];
    }
}
