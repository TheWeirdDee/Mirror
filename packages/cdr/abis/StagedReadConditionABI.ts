export const StagedReadConditionABI = [
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
    "name": "NotMatcher",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VaultNotRegistered",
    "type": "error"
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
        "internalType": "uint8",
        "name": "newStage",
        "type": "uint8"
      }
    ],
    "name": "StageUpgraded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "vaultUUID",
        "type": "bytes32"
      }
    ],
    "name": "getStage",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "conditionData",
        "type": "bytes"
      }
    ],
    "name": "isReadAllowed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
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
        "name": "vaultUUID",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "vaultOwner",
        "type": "address"
      }
    ],
    "name": "registerVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "vaultUUID",
        "type": "bytes32"
      }
    ],
    "name": "sealVault",
    "outputs": [],
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
        "internalType": "uint8",
        "name": "newStage",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "counterpartyAgent",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "counterpartyWallet",
        "type": "address"
      }
    ],
    "name": "upgradeStage",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "vaultAccess",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "stage",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "counterpartyAgent",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "counterpartyWallet",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "vaultOwner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
