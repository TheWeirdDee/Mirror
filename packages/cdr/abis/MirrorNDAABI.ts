export const MirrorNDAABI = [
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
    "name": "AlreadySigned",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NDAAlreadyComplete",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotMatcher",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotParty",
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
        "indexed": false,
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
      }
    ],
    "name": "NDAComplete",
    "type": "event"
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
        "name": "signer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "side",
        "type": "string"
      }
    ],
    "name": "NDASigned",
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
    "name": "getRecord",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "sellSigned",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "buySigned",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "complete",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "sellSignedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "buySignedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct MirrorNDA.NDARecord",
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
      }
    ],
    "name": "isSigned",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "matchParties",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mirrorMatcher",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "ndaRecords",
    "outputs": [
      {
        "internalType": "bool",
        "name": "sellSigned",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "buySigned",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "complete",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "sellSignedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "buySignedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "completedAt",
        "type": "uint256"
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
        "name": "sellWallet",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "buyWallet",
        "type": "address"
      }
    ],
    "name": "registerMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "matchId",
        "type": "bytes32"
      }
    ],
    "name": "sign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
