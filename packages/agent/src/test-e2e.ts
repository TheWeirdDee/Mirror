import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { pollVaults, publicClient, walletClient, account, MATCHER_ADDRESS, matcherAbi } from './index';

// Load config from root .env
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("🚀 Starting E2E Test: Mocking data to trigger the Agent...");

  const sellVaultId = crypto.randomUUID();
  const buyVaultId = crypto.randomUUID();

  // 1. Insert a mock SELLER
  console.log(`📝 Inserting Mock Seller Vault: ${sellVaultId}`);
  await supabase.from('vaults').insert({
    vault_uuid: sellVaultId,
    vault_type: 'sell',
    wallet_address: '0x1111111111111111111111111111111111111111',
    encrypted_data: { 
        sector: 'B2B SaaS', 
        revenue: '2000000', 
        targetPrice: '15000000' 
    },
    status: 'active'
  });

  // 2. Insert a mock BUYER
  console.log(`📝 Inserting Mock Buyer Vault: ${buyVaultId}`);
  await supabase.from('vaults').insert({
    vault_uuid: buyVaultId,
    vault_type: 'buy',
    wallet_address: '0x2222222222222222222222222222222222222222',
    encrypted_data: { 
        targetSectors: 'B2B SaaS', 
        budgetMin: '10000000', 
        budgetMax: '30000000' 
    },
    status: 'active'
  });

  // 3. Register both vaults on-chain
  console.log("🔗 Registering Seller Vault on-chain...");
  const sellBytes32 = `0x${sellVaultId.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`;
  const { request: sellReq } = await publicClient.simulateContract({
    address: MATCHER_ADDRESS,
    abi: matcherAbi,
    functionName: 'registerVault',
    args: [sellBytes32, '0x1111111111111111111111111111111111111111', 'sell'],
    account,
  });
  const sellTx = await walletClient.writeContract(sellReq);
  await publicClient.waitForTransactionReceipt({ hash: sellTx });

  console.log("🔗 Registering Buyer Vault on-chain...");
  const buyBytes32 = `0x${buyVaultId.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`;
  const { request: buyReq } = await publicClient.simulateContract({
    address: MATCHER_ADDRESS,
    abi: matcherAbi,
    functionName: 'registerVault',
    args: [buyBytes32, '0x2222222222222222222222222222222222222222', 'buy'],
    account,
  });
  const buyTx = await walletClient.writeContract(buyReq);
  await publicClient.waitForTransactionReceipt({ hash: buyTx });
  console.log("✓ On-chain registration complete.");

  console.log("⏳ Data inserted. Manually triggering the Matchmaking Agent Cycle...");

  // Trigger the Agent Logic directly
  await pollVaults();

  console.log("🔍 Checking if the match was written to Supabase.");

  // 4. Verify Match in Database
  const { data: matchData, error } = await supabase
    .from('matches')
    .select('*')
    .eq('sell_vault_uuid', sellVaultId)
    .single();

  if (matchData) {
    console.log("✅ SUCCESS! Match successfully created and recorded!");
    console.log(`🔗 Transaction Hash: ${matchData.tx_hash}`);
    console.log(`⭐ Compatibility Score: ${matchData.score}%`);
    console.log(`🚦 Current Stage: ${matchData.status}`);
  } else {
    console.error("❌ FAILED. The agent didn't create a match.");
    console.error(error);
  }
}

runTest().catch(console.error);
