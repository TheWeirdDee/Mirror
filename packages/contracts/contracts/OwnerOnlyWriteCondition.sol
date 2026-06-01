// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OwnerOnlyWriteCondition
 * @notice CDR write condition — only the vault creator can write to their vault.
 * @dev Deployed once. Each vault passes its owner address as conditionData.
 */
contract OwnerOnlyWriteCondition {
    /**
     * @notice Called by CDR validators to check if a write is permitted.
     * @param caller The address attempting the write.
     * @param conditionData ABI-encoded owner address set at vault creation.
     * @return allowed True if caller is the vault owner.
     */
    function isWriteAllowed(
        address caller,
        bytes calldata conditionData
    ) external pure returns (bool allowed) {
        address owner = abi.decode(conditionData, (address));
        return caller == owner;
    }
}
