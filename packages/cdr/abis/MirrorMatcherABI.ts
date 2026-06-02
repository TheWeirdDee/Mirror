export const MirrorMatcherABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_readCondition",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_mirrorNDA",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_negotiationRights",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_agentWallet",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AlreadyConfirmed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MatchExpiredError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MatchNotActive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotAgent",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotNDA",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotParty",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WrongStage",
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
      }
    ],
    "name": "MatchExpired",
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
        "indexed": false,
        "internalType": "uint8",
        "name": "score",
        "type": "uint8"
      }
    ],
    "name": "MatchFound",
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
        "indexed": false,
        "internalType": "uint8",
        "name": "newStage",
        "type": "uint8"
      }
    ],
    "name": "StageAdvanced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "vaultUUID",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "vaultType",
        "type": "string"
      }
    ],
    "name": "VaultRegistered",
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
        "name": "cancelledBy",
        "type": "address"
      }
    ],
    "name": "MatchCancelled",
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
    "name": "cancelMatch",
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
    "name": "confirmAdvanceToStage2",
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
    "name": "expireMatch",
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
    "name": "getMatch",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "sellVaultUUID",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "buyVaultUUID",
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
          },
          {
            "internalType": "uint8",
            "name": "score",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "stage",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "sellConfirmedStage2",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "buyConfirmedStage2",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "lastAdvanced",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct MirrorMatcher.Match",
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
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "getMatchForWallet",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "getVaultForWallet",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
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
    "name": "grantStage4",
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
    "name": "onNDAComplete",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "sellVaultUUID",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "buyVaultUUID",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "score",
        "type": "uint8"
      }
    ],
    "name": "recordMatch",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "matchId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "vaultUUID",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "vaultType",
        "type": "string"
      }
    ],
    "name": "registerVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
