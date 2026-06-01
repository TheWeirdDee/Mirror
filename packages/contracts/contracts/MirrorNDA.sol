// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MirrorNDA
 * @notice On-chain mutual NDA. Both parties must sign before
 *         Stage 3 (identity reveal) triggers.
 *
 * @dev Signing is sequential but reveal is simultaneous —
 *      neither party sees the other's identity until BOTH have signed.
 *      Once both sign, MirrorMatcher is called to advance to Stage 3.
 */
interface IMirrorMatcher {
    function onNDAComplete(bytes32 matchId) external;
}

contract MirrorNDA {
    address public immutable mirrorMatcher;

    struct NDARecord {
        bool sellSigned;
        bool buySigned;
        bool complete;
        uint256 sellSignedAt;
        uint256 buySignedAt;
        uint256 completedAt;
    }

    // matchId => NDA record
    mapping(bytes32 => NDARecord) public ndaRecords;

    // matchId => wallet => which side they are
    mapping(bytes32 => mapping(address => string)) public matchParties;

    event NDASigned(bytes32 indexed matchId, address indexed signer, string side);
    event NDAComplete(bytes32 indexed matchId, uint256 completedAt);

    error NotMatcher();
    error NotParty();
    error AlreadySigned();
    error NDAAlreadyComplete();

    constructor(address _mirrorMatcher) {
        mirrorMatcher = _mirrorMatcher;
    }

    modifier onlyMatcher() {
        if (msg.sender != mirrorMatcher) revert NotMatcher();
        _;
    }

    /**
     * @notice Register parties for a match. Called by MirrorMatcher at Stage 2.
     */
    function registerMatch(
        bytes32 matchId,
        address sellWallet,
        address buyWallet
    ) external onlyMatcher {
        matchParties[matchId][sellWallet] = "sell";
        matchParties[matchId][buyWallet] = "buy";
    }

    /**
     * @notice Sign the NDA. Caller must be a registered party for this match.
     * @dev When both parties have signed, automatically calls MirrorMatcher.onNDAComplete()
     */
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

        // Both signed — complete the NDA and trigger Stage 3
        if (record.sellSigned && record.buySigned) {
            record.complete = true;
            record.completedAt = block.timestamp;
            emit NDAComplete(matchId, block.timestamp);

            // Trigger MirrorMatcher to advance to Stage 3
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
