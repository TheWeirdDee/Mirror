export const OwnerOnlyWriteConditionABI = [
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
    "name": "isWriteAllowed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "allowed",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  }
] as const;
