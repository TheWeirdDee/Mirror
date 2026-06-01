// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NegotiationRights
 * @notice ERC-721 minted to both parties at Stage 3.
 *         Represents a verified, on-chain record of mutual intent
 *         to negotiate an acquisition or partnership.
 *
 * @dev Non-transferable (soulbound). This isn't a financial instrument —
 *      it's a cryptographic record of mutual consent.
 */
contract NegotiationRights is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address public mirrorMatcher;

    struct NegotiationToken {
        bytes32 matchId;
        address counterparty;
        string side;           // "sell" or "buy"
        uint256 mintedAt;
        uint8 stageAtMint;     // always 3
    }

    mapping(uint256 => NegotiationToken) public tokens;
    // matchId => [sellTokenId, buyTokenId]
    mapping(bytes32 => uint256[2]) public matchTokens;

    event NegotiationRightsMinted(
        bytes32 indexed matchId,
        address indexed sellParty,
        address indexed buyParty,
        uint256 sellTokenId,
        uint256 buyTokenId
    );

    error NotMatcher();
    error NonTransferable();

    constructor(address _mirrorMatcher)
        ERC721("Mirror Negotiation Rights", "MNR")
        Ownable(msg.sender)
    {
        mirrorMatcher = _mirrorMatcher;
    }

    modifier onlyMatcher() {
        if (msg.sender != mirrorMatcher) revert NotMatcher();
        _;
    }

    /**
     * @notice Mint negotiation rights to both parties. Called by MirrorMatcher at Stage 3.
     */
    function mint(
        bytes32 matchId,
        address sellParty,
        address buyParty
    ) external onlyMatcher returns (uint256 sellTokenId, uint256 buyTokenId) {
        sellTokenId = ++_tokenIdCounter;
        buyTokenId = ++_tokenIdCounter;

        _safeMint(sellParty, sellTokenId);
        _safeMint(buyParty, buyTokenId);

        tokens[sellTokenId] = NegotiationToken({
            matchId: matchId,
            counterparty: buyParty,
            side: "sell",
            mintedAt: block.timestamp,
            stageAtMint: 3
        });

        tokens[buyTokenId] = NegotiationToken({
            matchId: matchId,
            counterparty: sellParty,
            side: "buy",
            mintedAt: block.timestamp,
            stageAtMint: 3
        });

        matchTokens[matchId] = [sellTokenId, buyTokenId];

        emit NegotiationRightsMinted(matchId, sellParty, buyParty, sellTokenId, buyTokenId);
    }

    /**
     * @notice Soulbound — prevent transfers.
     * @dev Override transfer to block all transfers except minting (from == address(0))
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
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

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        NegotiationToken memory token = tokens[tokenId];
        return string(abi.encodePacked(
            'data:application/json;utf8,{"name":"Mirror Negotiation Rights #',
            _toString(tokenId),
            '","description":"Verified mutual acquisition intent. Sealed by Mirror Protocol.",',
            '"attributes":[',
            '{"trait_type":"Match ID","value":"', _toHexString(token.matchId), '"},',
            '{"trait_type":"Side","value":"', token.side, '"},',
            '{"trait_type":"Stage","value":"3"},',
            '{"trait_type":"Minted At","value":"', _toString(token.mintedAt), '"}',
            ']}'
        ));
    }

    // Utility functions
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _toHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(66);
        str[0] = '0'; str[1] = 'x';
        for (uint256 i = 0; i < 32; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }
}
