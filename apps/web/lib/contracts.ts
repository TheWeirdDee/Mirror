import { parseAbi } from "viem";

export const MIRROR_MATCHER_ADDR = (process.env.NEXT_PUBLIC_MIRROR_MATCHER_ADDR || "") as `0x${string}`;
export const MIRROR_NDA_ADDR = (process.env.NEXT_PUBLIC_MIRROR_NDA_ADDR || "") as `0x${string}`;

export const MIRROR_MATCHER_ABI = parseAbi([
  "function registerVault(bytes32 vaultUUID, address owner, string vaultType) external",
  "function recordMatch(bytes32 sellVaultUUID, bytes32 buyVaultUUID, uint8 score) external returns (bytes32)",
  "function confirmAdvanceToStage2(bytes32 matchId) external",
  "function cancelMatch(bytes32 matchId) external",
  "function grantStage4(bytes32 matchId) external",
  "function getMatchForWallet(address wallet) external view returns (bytes32)",
  "function getVaultForWallet(address wallet) external view returns (bytes32)",
  "function getMatch(bytes32 matchId) external view returns ((bytes32 sellVaultUUID, bytes32 buyVaultUUID, address sellWallet, address buyWallet, uint8 score, uint8 stage, bool sellConfirmedStage2, bool buyConfirmedStage2, uint256 createdAt, uint256 lastAdvanced, bool active) Match)"
]);

export const MIRROR_NDA_ABI = parseAbi([
  "function sign(bytes32 matchId) external",
  "function getRecord(bytes32 matchId) external view returns ((bool sellSigned, bool buySigned, bool complete, uint256 sellSignedAt, uint256 buySignedAt, uint256 completedAt) NDARecord)"
]);
