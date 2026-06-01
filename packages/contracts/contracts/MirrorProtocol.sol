// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ----------------------------------------------------------------------------
// 1. OwnerOnlyWriteCondition
// ----------------------------------------------------------------------------
contract OwnerOnlyWriteCondition {
    function isWriteAllowed(
        address caller,
        bytes calldata conditionData
    ) external pure returns (bool allowed) {
        address owner = abi.decode(conditionData, (address));
        return caller == owner;
    }
}

// ----------------------------------------------------------------------------
// 2. StagedReadCondition
// ----------------------------------------------------------------------------
contract StagedReadCondition {
    address public mirrorMatcher;

    struct VaultAccess {
        uint8 stage;
        address counterpartyAgent;
        address counterpartyWallet;
        address vaultOwner;
    }

    mapping(bytes32 => VaultAccess) public vaultAccess;
    event StageUpgraded(bytes32 indexed vaultUUID, uint8 newStage);
    error NotMatcher();
    error VaultNotRegistered();

    function setMatcher(address _mirrorMatcher) external {
        require(mirrorMatcher == address(0), "Already set");
        mirrorMatcher = _mirrorMatcher;
    }

    modifier onlyMatcher() {
        if (msg.sender != mirrorMatcher) revert NotMatcher();
        _;
    }

    function registerVault(bytes32 vaultUUID, address vaultOwner) external onlyMatcher {
        vaultAccess[vaultUUID] = VaultAccess({
            stage: 0,
            counterpartyAgent: address(0),
            counterpartyWallet: address(0),
            vaultOwner: vaultOwner
        });
    }

    function isReadAllowed(address caller, bytes calldata conditionData) external view returns (bool allowed) {
        bytes32 vaultUUID = abi.decode(conditionData, (bytes32));
        VaultAccess memory access = vaultAccess[vaultUUID];

        if (access.stage == 0) return false;
        if (access.stage == 1) return caller == access.counterpartyAgent;
        if (access.stage == 2) return caller == access.counterpartyAgent;
        if (access.stage >= 3) return caller == access.counterpartyWallet || caller == access.vaultOwner;
        return false;
    }

    function upgradeStage(bytes32 vaultUUID, uint8 newStage, address counterpartyAgent, address counterpartyWallet) external onlyMatcher {
        VaultAccess storage access = vaultAccess[vaultUUID];
        require(newStage > access.stage, "Cannot downgrade stage");
        require(newStage <= 4, "Max stage is 4");

        access.stage = newStage;
        if (counterpartyAgent != address(0)) access.counterpartyAgent = counterpartyAgent;
        if (counterpartyWallet != address(0)) access.counterpartyWallet = counterpartyWallet;

        emit StageUpgraded(vaultUUID, newStage);
    }

    function sealVault(bytes32 vaultUUID) external onlyMatcher {
        vaultAccess[vaultUUID].stage = 0;
        vaultAccess[vaultUUID].counterpartyAgent = address(0);
        vaultAccess[vaultUUID].counterpartyWallet = address(0);
    }

    function getStage(bytes32 vaultUUID) external view returns (uint8) {
        return vaultAccess[vaultUUID].stage;
    }
}

// ----------------------------------------------------------------------------
// 3. MirrorNDA
// ----------------------------------------------------------------------------
interface IMirrorMatcher {
    function onNDAComplete(bytes32 matchId) external;
}

contract MirrorNDA {
    address public mirrorMatcher;

    struct NDARecord {
        bool sellSigned;
        bool buySigned;
        bool complete;
        uint256 sellSignedAt;
        uint256 buySignedAt;
        uint256 completedAt;
    }

    mapping(bytes32 => NDARecord) public ndaRecords;
    mapping(bytes32 => mapping(address => string)) public matchParties;

    event NDASigned(bytes32 indexed matchId, address indexed signer, string side);
    event NDAComplete(bytes32 indexed matchId, uint256 completedAt);

    error NotMatcher();
    error NotParty();
    error AlreadySigned();
    error NDAAlreadyComplete();

    function setMatcher(address _mirrorMatcher) external {
        require(mirrorMatcher == address(0), "Already set");
        mirrorMatcher = _mirrorMatcher;
    }

    modifier onlyMatcher() {
        if (msg.sender != mirrorMatcher) revert NotMatcher();
        _;
    }

    function registerMatch(bytes32 matchId, address sellWallet, address buyWallet) external onlyMatcher {
        matchParties[matchId][sellWallet] = "sell";
        matchParties[matchId][buyWallet] = "buy";
    }

    function sign(bytes32 matchId) external {
        string memory side = matchParties[matchId][msg.sender];
        require(bytes(side).length > 0, "Not a party to this match");

        NDARecord storage record = ndaRecords[matchId];
        if (record.complete) revert NDAAlreadyComplete();

        if (keccak256(bytes(side)) == keccak256(bytes("sell"))) {
            if (record.sellSigned) revert AlreadySigned();
            record.sellSigned = true;
            record.sellSignedAt = block.timestamp;
        } else {
            if (record.buySigned) revert AlreadySigned();
            record.buySigned = true;
            record.buySignedAt = block.timestamp;
        }

        emit NDASigned(matchId, msg.sender, side);

        if (record.sellSigned && record.buySigned) {
            record.complete = true;
            record.completedAt = block.timestamp;
            emit NDAComplete(matchId, block.timestamp);
            IMirrorMatcher(mirrorMatcher).onNDAComplete(matchId);
        }
    }

    function isSigned(bytes32 matchId) external view returns (bool) {
        return ndaRecords[matchId].complete;
    }

    function getRecord(bytes32 matchId) external view returns (NDARecord memory) {
        return ndaRecords[matchId];
    }
}

// ----------------------------------------------------------------------------
// 4. NegotiationRights
// ----------------------------------------------------------------------------
contract NegotiationRights is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address public mirrorMatcher;

    struct NegotiationToken {
        bytes32 matchId;
        address counterparty;
        string side;
        uint256 mintedAt;
        uint8 stageAtMint;
    }

    mapping(uint256 => NegotiationToken) public tokens;
    mapping(bytes32 => uint256[2]) public matchTokens;

    event NegotiationRightsMinted(
        bytes32 indexed matchId, address indexed sellParty, address indexed buyParty,
        uint256 sellTokenId, uint256 buyTokenId
    );

    error NotMatcher();
    error NonTransferable();

    constructor()
        ERC721("Mirror Negotiation Rights", "MNR")
        Ownable(msg.sender)
    {}

    function setMatcher(address _mirrorMatcher) external {
        require(mirrorMatcher == address(0), "Already set");
        mirrorMatcher = _mirrorMatcher;
    }

    modifier onlyMatcher() {
        if (msg.sender != mirrorMatcher) revert NotMatcher();
        _;
    }

    function mint(bytes32 matchId, address sellParty, address buyParty) external onlyMatcher returns (uint256 sellTokenId, uint256 buyTokenId) {
        sellTokenId = ++_tokenIdCounter;
        buyTokenId = ++_tokenIdCounter;

        _safeMint(sellParty, sellTokenId);
        _safeMint(buyParty, buyTokenId);

        tokens[sellTokenId] = NegotiationToken({
            matchId: matchId, counterparty: buyParty, side: "sell", mintedAt: block.timestamp, stageAtMint: 3
        });
        tokens[buyTokenId] = NegotiationToken({
            matchId: matchId, counterparty: sellParty, side: "buy", mintedAt: block.timestamp, stageAtMint: 3
        });

        matchTokens[matchId] = [sellTokenId, buyTokenId];
        emit NegotiationRightsMinted(matchId, sellParty, buyParty, sellTokenId, buyTokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function getToken(uint256 tokenId) external view returns (NegotiationToken memory) {
        return tokens[tokenId];
    }

    function getMatchTokens(bytes32 matchId) external view returns (uint256[2] memory) {
        return matchTokens[matchId];
    }
}

// ----------------------------------------------------------------------------
// 5. MirrorMatcher
// ----------------------------------------------------------------------------
interface IStagedReadCondition2 {
    function registerVault(bytes32 vaultUUID, address vaultOwner) external;
    function upgradeStage(bytes32 vaultUUID, uint8 newStage, address counterpartyAgent, address counterpartyWallet) external;
    function sealVault(bytes32 vaultUUID) external;
}
interface IMirrorNDA2 {
    function registerMatch(bytes32 matchId, address sellWallet, address buyWallet) external;
}
interface INegotiationRights2 {
    function mint(bytes32 matchId, address sellParty, address buyParty) external returns (uint256, uint256);
}

contract MirrorMatcher {
    IStagedReadCondition2 public immutable readCondition;
    IMirrorNDA2 public immutable mirrorNDA;
    INegotiationRights2 public immutable negotiationRights;
    address public immutable agentWallet;

    struct Match {
        bytes32 sellVaultUUID; bytes32 buyVaultUUID; address sellWallet; address buyWallet;
        uint8 score; uint8 stage; bool sellConfirmedStage2; bool buyConfirmedStage2;
        uint256 createdAt; uint256 lastAdvanced; bool active;
    }

    struct VaultRecord {
        address owner; string vaultType; bool registered;
    }

    mapping(bytes32 => Match) public matches;
    mapping(bytes32 => VaultRecord) public vaultRecords;
    mapping(address => bytes32) public walletToVault;
    mapping(address => bytes32) public walletToMatch;

    uint256 public constant MATCH_EXPIRY = 7 days;
    uint8 public constant MATCH_THRESHOLD = 60;

    event MatchFound(bytes32 indexed matchId, uint8 score);
    event StageAdvanced(bytes32 indexed matchId, uint8 newStage);
    event MatchExpired(bytes32 indexed matchId);
    event VaultRegistered(bytes32 indexed vaultUUID, string vaultType);

    error NotAgent(); error NotParty(); error NotNDA(); error AlreadyConfirmed();
    error MatchNotActive(); error MatchExpiredError(); error WrongStage(); error VaultAlreadyRegistered();

    modifier onlyAgent() {
        if (msg.sender != agentWallet) revert NotAgent();
        _;
    }
    modifier onlyNDA() {
        if (msg.sender != address(mirrorNDA)) revert NotNDA();
        _;
    }

    constructor(address _readCondition, address _mirrorNDA, address _negotiationRights, address _agentWallet) {
        readCondition = IStagedReadCondition2(_readCondition);
        mirrorNDA = IMirrorNDA2(_mirrorNDA);
        negotiationRights = INegotiationRights2(_negotiationRights);
        agentWallet = _agentWallet;
    }

    function registerVault(bytes32 vaultUUID, address owner, string calldata vaultType) external {
        if (vaultRecords[vaultUUID].registered) revert VaultAlreadyRegistered();
        vaultRecords[vaultUUID] = VaultRecord({ owner: owner, vaultType: vaultType, registered: true });
        walletToVault[owner] = vaultUUID;
        readCondition.registerVault(vaultUUID, owner);
        emit VaultRegistered(vaultUUID, vaultType);
    }

    function recordMatch(bytes32 sellVaultUUID, bytes32 buyVaultUUID, uint8 score) external onlyAgent returns (bytes32 matchId) {
        require(score >= MATCH_THRESHOLD, "Score below threshold");
        VaultRecord memory sellRecord = vaultRecords[sellVaultUUID];
        VaultRecord memory buyRecord = vaultRecords[buyVaultUUID];
        require(sellRecord.registered && buyRecord.registered, "Vault not registered");

        matchId = keccak256(abi.encodePacked(sellVaultUUID, buyVaultUUID, block.timestamp));
        matches[matchId] = Match({
            sellVaultUUID: sellVaultUUID, buyVaultUUID: buyVaultUUID, sellWallet: sellRecord.owner, buyWallet: buyRecord.owner,
            score: score, stage: 1, sellConfirmedStage2: false, buyConfirmedStage2: false,
            createdAt: block.timestamp, lastAdvanced: block.timestamp, active: true
        });
        walletToMatch[sellRecord.owner] = matchId; walletToMatch[buyRecord.owner] = matchId;
        
        readCondition.upgradeStage(sellVaultUUID, 1, agentWallet, address(0));
        readCondition.upgradeStage(buyVaultUUID, 1, agentWallet, address(0));
        emit MatchFound(matchId, score);
    }

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
        } else revert NotParty();

        if (m.sellConfirmedStage2 && m.buyConfirmedStage2) {
            m.stage = 2; m.lastAdvanced = block.timestamp;
            readCondition.upgradeStage(m.sellVaultUUID, 2, agentWallet, address(0));
            readCondition.upgradeStage(m.buyVaultUUID, 2, agentWallet, address(0));
            mirrorNDA.registerMatch(matchId, m.sellWallet, m.buyWallet);
            emit StageAdvanced(matchId, 2);
        }
    }

    function onNDAComplete(bytes32 matchId) external onlyNDA {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        if (m.stage != 2) revert WrongStage();
        m.stage = 3; m.lastAdvanced = block.timestamp;
        readCondition.upgradeStage(m.sellVaultUUID, 3, agentWallet, m.buyWallet);
        readCondition.upgradeStage(m.buyVaultUUID, 3, agentWallet, m.sellWallet);
        negotiationRights.mint(matchId, m.sellWallet, m.buyWallet);
        emit StageAdvanced(matchId, 3);
    }

    function grantStage4(bytes32 matchId) external {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        if (m.stage != 3) revert WrongStage();
        if (msg.sender != m.sellWallet) revert NotParty();
        m.stage = 4; m.lastAdvanced = block.timestamp;
        readCondition.upgradeStage(m.sellVaultUUID, 4, agentWallet, m.buyWallet);
        emit StageAdvanced(matchId, 4);
    }

    function expireMatch(bytes32 matchId) external {
        Match storage m = matches[matchId];
        if (!m.active) revert MatchNotActive();
        require(block.timestamp > m.createdAt + MATCH_EXPIRY, "Match not yet expired");
        m.active = false;
        readCondition.sealVault(m.sellVaultUUID); readCondition.sealVault(m.buyVaultUUID);
        emit MatchExpired(matchId);
    }

    function getMatch(bytes32 matchId) external view returns (Match memory) { return matches[matchId]; }
    function getMatchForWallet(address wallet) external view returns (bytes32) { return walletToMatch[wallet]; }
    function getVaultForWallet(address wallet) external view returns (bytes32) { return walletToVault[wallet]; }
}

// ----------------------------------------------------------------------------
// ONE-CLICK DEPLOYER
// ----------------------------------------------------------------------------
contract MirrorDeployer {
    MirrorMatcher public matcher;
    StagedReadCondition public readCondition;
    MirrorNDA public nda;
    NegotiationRights public rights;
    OwnerOnlyWriteCondition public ownerWrite;

    constructor(address agentWallet) {
        ownerWrite = new OwnerOnlyWriteCondition();
        readCondition = new StagedReadCondition();
        nda = new MirrorNDA();
        rights = new NegotiationRights();

        matcher = new MirrorMatcher(
            address(readCondition),
            address(nda),
            address(rights),
            agentWallet
        );

        readCondition.setMatcher(address(matcher));
        nda.setMatcher(address(matcher));
        rights.setMatcher(address(matcher));
    }
}
