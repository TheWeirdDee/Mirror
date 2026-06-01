// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title StagedReadCondition
 * @notice CDR read condition that enforces staged revelation.
 *         Stage 0: nobody can read (sealed)
 *         Stage 1: matching agent only (no data — just triggers notification)
 *         Stage 2: counterparty agent (thin profile fields only)
 *         Stage 3: counterparty wallet (post NDA — full identity)
 *         Stage 4: counterparty wallet (financial details)
 *
 * @dev Only MirrorMatcher can upgrade stages.
 *      Emits NO event on denied access — zero trace for failed reads.
 */
contract StagedReadCondition {
    address public immutable mirrorMatcher;

    struct VaultAccess {
        uint8 stage;
        address counterpartyAgent;    // set at match time
        address counterpartyWallet;   // set at Stage 3
        address vaultOwner;
    }

    // vaultUUID (bytes32) => access config
    mapping(bytes32 => VaultAccess) public vaultAccess;

    event StageUpgraded(bytes32 indexed vaultUUID, uint8 newStage);

    error NotMatcher();
    error VaultNotRegistered();

    constructor(address _mirrorMatcher) {
        mirrorMatcher = _mirrorMatcher;
    }

    modifier onlyMatcher() {
        if (msg.sender != mirrorMatcher) revert NotMatcher();
        _;
    }

    /**
     * @notice Register a new vault at Stage 0.
     * @dev Called by MirrorMatcher when a vault is first registered.
     */
    function registerVault(
        bytes32 vaultUUID,
        address vaultOwner
    ) external onlyMatcher {
        vaultAccess[vaultUUID] = VaultAccess({
            stage: 0,
            counterpartyAgent: address(0),
            counterpartyWallet: address(0),
            vaultOwner: vaultOwner
        });
    }

    /**
     * @notice Called by CDR validators to check if a read is permitted.
     * @param caller Address requesting access.
     * @param conditionData ABI-encoded vaultUUID.
     * @return allowed True if caller may read at current stage.
     *
     * IMPORTANT: This function intentionally emits NO event on denial.
     * A denied read leaves zero on-chain trace.
     */
    function isReadAllowed(
        address caller,
        bytes calldata conditionData
    ) external view returns (bool allowed) {
        bytes32 vaultUUID = abi.decode(conditionData, (bytes32));
        VaultAccess memory access = vaultAccess[vaultUUID];

        // Stage 0: completely sealed — nobody reads
        if (access.stage == 0) return false;

        // Stage 1: matching agent only
        if (access.stage == 1) {
            return caller == access.counterpartyAgent;
        }

        // Stage 2: counterparty agent (thin profile)
        if (access.stage == 2) {
            return caller == access.counterpartyAgent;
        }

        // Stage 3+: counterparty wallet
        if (access.stage >= 3) {
            return caller == access.counterpartyWallet ||
                   caller == access.vaultOwner;
        }

        return false;
    }

    /**
     * @notice Upgrade vault stage. Only callable by MirrorMatcher.
     */
    function upgradeStage(
        bytes32 vaultUUID,
        uint8 newStage,
        address counterpartyAgent,
        address counterpartyWallet
    ) external onlyMatcher {
        VaultAccess storage access = vaultAccess[vaultUUID];
        require(newStage > access.stage, "Cannot downgrade stage");
        require(newStage <= 4, "Max stage is 4");

        access.stage = newStage;
        if (counterpartyAgent != address(0)) {
            access.counterpartyAgent = counterpartyAgent;
        }
        if (counterpartyWallet != address(0)) {
            access.counterpartyWallet = counterpartyWallet;
        }

        emit StageUpgraded(vaultUUID, newStage);
    }

    /**
     * @notice Seal vault back to Stage 0 (on expiry).
     */
    function sealVault(bytes32 vaultUUID) external onlyMatcher {
        vaultAccess[vaultUUID].stage = 0;
        vaultAccess[vaultUUID].counterpartyAgent = address(0);
        vaultAccess[vaultUUID].counterpartyWallet = address(0);
        // No event emitted — no trace
    }

    function getStage(bytes32 vaultUUID) external view returns (uint8) {
        return vaultAccess[vaultUUID].stage;
    }
}
