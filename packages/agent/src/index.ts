import { createClient } from '@supabase/supabase-js';
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { storyAeneid } from 'viem/chains';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from root — override: true forces dotenv to win over system env vars
dotenv.config({ path: resolve(__dirname, '../../../.env'), override: true });

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Agent uses service role
const supabase = createClient(supabaseUrl, supabaseKey);

// Setup Blockchain Client
export const account = privateKeyToAccount((process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`) || '0x0');
export const publicClient = createPublicClient({
  chain: storyAeneid,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL)
});
export const walletClient = createWalletClient({
  account,
  chain: storyAeneid,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL)
});

export const MATCHER_ADDRESS = process.env.NEXT_PUBLIC_MIRROR_MATCHER_ADDR as `0x${string}`;

export const matcherAbi = parseAbi([
  'function recordMatch(bytes32 sellVaultUUID, bytes32 buyVaultUUID, uint8 score) external returns (bytes32 matchId)',
  'function registerVault(bytes32 vaultUUID, address owner, string vaultType) external',
  'function vaultRecords(bytes32) external view returns (address owner, string vaultType, bool registered)'
]);

export async function pollVaults() {
  console.log("Polling Supabase for unmatched vaults...");

  // Fetch active buy and sell vaults
  const { data: buyVaults, error: err1 } = await supabase
    .from('vaults')
    .select('*')
    .eq('vault_type', 'buy')
    .eq('status', 'active');
    
  const { data: sellVaults, error: err2 } = await supabase
    .from('vaults')
    .select('*')
    .eq('vault_type', 'sell')
    .eq('status', 'active');

  if (err1 || err2) {
    console.error("Error fetching vaults:", err1 || err2);
    return;
  }

  if (!buyVaults?.length || !sellVaults?.length) {
    console.log("Not enough vaults to match.");
    return;
  }

  // Simple Matchmaking Engine
  for (const sell of sellVaults) {
    const sellBytes32 = `0x${sell.vault_uuid.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`;

    // Skip vaults that were never confirmed on-chain (Supabase-only entries)
    const sellRecord = await publicClient.readContract({
      address: MATCHER_ADDRESS, abi: matcherAbi, functionName: 'vaultRecords', args: [sellBytes32]
    }) as { owner: string; vaultType: string; registered: boolean };
    if (!sellRecord.registered) {
      console.log(`Sell vault ${sell.vault_uuid} not registered on-chain — skipping`);
      continue;
    }

    for (const buy of buyVaults) {
      const buyBytes32 = `0x${buy.vault_uuid.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`;

      const buyRecord = await publicClient.readContract({
        address: MATCHER_ADDRESS, abi: matcherAbi, functionName: 'vaultRecords', args: [buyBytes32]
      }) as { owner: string; vaultType: string; registered: boolean };
      if (!buyRecord.registered) {
        console.log(`Buy vault ${buy.vault_uuid} not registered on-chain — skipping`);
        continue;
      }

      const score = computeMatchScore(sell.encrypted_data, buy.encrypted_data);

      if (score >= 60) {
        console.log(`Match found! Sell: ${sell.vault_uuid} | Buy: ${buy.vault_uuid} | Score: ${score}`);

        try {
          // Push to Aeneid blockchain
          const { request } = await publicClient.simulateContract({
            address: MATCHER_ADDRESS,
            abi: matcherAbi,
            functionName: 'recordMatch',
            args: [sellBytes32, buyBytes32, score],
            account,
          });

          const hash = await walletClient.writeContract(request);
          console.log(`Match recorded on-chain! Tx Hash: ${hash}`);

          // Update Supabase status
          await supabase.from('vaults').update({ status: 'matched' }).in('vault_uuid', [sell.vault_uuid, buy.vault_uuid]);
          
          await supabase.from('matches').insert({
            sell_vault_uuid: sell.vault_uuid,
            buy_vault_uuid: buy.vault_uuid,
            score: score,
            tx_hash: hash,
            status: 'stage_1'
          });

        } catch (e) {
          console.error("Blockchain transaction failed:", e);
        }
      }
    }
  }
}

// Dummy scoring function (in reality this would decrypt and compare metrics)
function computeMatchScore(sellData: any, buyData: any): number {
  return Math.floor(Math.random() * (95 - 65 + 1) + 65); // Random score between 65 and 95
}

// Start polling loop
console.log(`Starting Mirror Agent with account ${account.address}`);
setInterval(pollVaults, 15000); // Poll every 15 seconds
pollVaults();
