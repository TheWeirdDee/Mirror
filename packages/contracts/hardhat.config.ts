import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from the root .env.local
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    aeneid: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://aeneid.storyrpc.io",
      chainId: 1315,
      accounts: process.env.AGENT_WALLET_PRIVATE_KEY
        ? [process.env.AGENT_WALLET_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
