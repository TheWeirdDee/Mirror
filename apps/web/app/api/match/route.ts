import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createClient } from "@supabase/supabase-js";
import { aeneid } from "@/lib/chain";
import { MIRROR_MATCHER_ADDR, MIRROR_MATCHER_ABI } from "@/lib/contracts";

const vaultRecordsAbi = parseAbi([
  'function vaultRecords(bytes32) external view returns (address owner, string vaultType, bool registered)'
]);

export async function GET(request: NextRequest) {
  // 1. Cron secret authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 412 });
  }

  // 2. Setup clients
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    return NextResponse.json({ error: "Agent private key not configured" }, { status: 500 });
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: aeneid,
    transport: http()
  });
  const walletClient = createWalletClient({
    account,
    chain: aeneid,
    transport: http()
  });

  console.log("Running matching cycle via API route...");
  
  // 3. Fetch active buy and sell vaults
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
    return NextResponse.json({ error: "Error fetching vaults", details: err1 || err2 }, { status: 500 });
  }

  if (!buyVaults?.length || !sellVaults?.length) {
    return NextResponse.json({ message: "No unmatched vaults to match" });
  }

  const matchesFound: any[] = [];

  // 4. Matchmaking scoring logic
  for (const sell of sellVaults) {
    const sellBytes32 = `0x${sell.vault_uuid.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`;
    const sellRecord = await publicClient.readContract({
      address: MIRROR_MATCHER_ADDR, abi: vaultRecordsAbi, functionName: 'vaultRecords', args: [sellBytes32]
    }) as { registered: boolean };
    if (!sellRecord.registered) {
      console.log(`Sell vault ${sell.vault_uuid} not on-chain — skipping`);
      continue;
    }

    for (const buy of buyVaults) {
      const buyBytes32 = `0x${buy.vault_uuid.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`;
      const buyRecord = await publicClient.readContract({
        address: MIRROR_MATCHER_ADDR, abi: vaultRecordsAbi, functionName: 'vaultRecords', args: [buyBytes32]
      }) as { registered: boolean };
      if (!buyRecord.registered) {
        console.log(`Buy vault ${buy.vault_uuid} not on-chain — skipping`);
        continue;
      }

      // Calculate score (simple mock matching for now)
      const score = Math.floor(Math.random() * (95 - 65 + 1) + 65);

      if (score >= 60) {
        console.log(`Match found! Sell: ${sell.vault_uuid} | Buy: ${buy.vault_uuid} | Score: ${score}`);

        try {
          // Push to story Aeneid blockchain
          const { request: matchReq } = await publicClient.simulateContract({
            address: MIRROR_MATCHER_ADDR,
            abi: MIRROR_MATCHER_ABI,
            functionName: 'recordMatch',
            args: [sellBytes32, buyBytes32, score],
            account,
          });

          const hash = await walletClient.writeContract(matchReq);
          console.log(`Recorded on-chain! Tx Hash: ${hash}`);

          // Update database status
          await supabase
            .from('vaults')
            .update({ status: 'matched' })
            .in('vault_uuid', [sell.vault_uuid, buy.vault_uuid]);
          
          const { data: matchObj } = await supabase
            .from('matches')
            .insert({
              sell_vault_uuid: sell.vault_uuid,
              buy_vault_uuid: buy.vault_uuid,
              score: score,
              tx_hash: hash,
              status: 'stage_1'
            })
            .select()
            .single();

          matchesFound.push(matchObj);
        } catch (e: any) {
          console.error("Blockchain transaction failed:", e);
        }
      }
    }
  }

  return NextResponse.json({
    message: "Matching cycle complete",
    matchesCreated: matchesFound.length,
    matches: matchesFound
  });
}
