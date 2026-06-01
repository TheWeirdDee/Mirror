export * from './abis/MirrorMatcherABI';
export * from './abis/StagedReadConditionABI';
export * from './abis/MirrorNDAABI';
export * from './abis/NegotiationRightsABI';
export * from './abis/OwnerOnlyWriteConditionABI';

// Common config interfaces that front-end and agent can use
export const MIRROR_CONFIG = {
  chainId: 1513,
  rpcUrl: "https://aeneid.storyrpc.io",
  explorerUrl: "https://aeneid.storyscan.io",
  contracts: {
    matcher: process.env.NEXT_PUBLIC_MIRROR_MATCHER_ADDR || "",
    nda: process.env.NEXT_PUBLIC_MIRROR_NDA_ADDR || "",
    negotiationRights: process.env.NEXT_PUBLIC_NEGOTIATION_RIGHTS_ADDR || "",
    stagedRead: process.env.NEXT_PUBLIC_STAGED_READ_CONDITION_ADDR || "",
    ownerWrite: process.env.NEXT_PUBLIC_OWNER_WRITE_CONDITION_ADDR || "",
  }
};
