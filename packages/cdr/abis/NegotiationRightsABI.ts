export const NegotiationRightsABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_mirrorMatcher",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "NonTransferable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotMatcher",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "matchId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sellParty",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyParty",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sellTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "buyTokenId",
        "type": "uint256"
      }
    ],
    "name": "NegotiationRightsMinted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "matchId",
        "type": "bytes32"
      }
    ],
    "name": "getMatchTokens",
    "outputs": [
      {
        "internalType": "uint256[2]",
        "name": "",
        "type": "uint256[2]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getToken",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "matchId",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "counterparty",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "side",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "mintedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "stageAtMint",
            "type": "uint8"
          }
        ],
        "internalType": "struct NegotiationRights.NegotiationToken",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "matchId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "sellParty",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "buyParty",
        "type": "address"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "sellTokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "buyTokenId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
