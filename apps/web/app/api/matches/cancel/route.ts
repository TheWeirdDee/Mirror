import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, verifyMessage } from "viem";
import { createClient } from "@supabase/supabase-js";
import { aeneid } from "@/lib/chain";
import { MIRROR_MATCHER_ADDR, MIRROR_MATCHER_ABI } from "@/lib/contracts";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { matchId, supabaseMatchId, walletAddress, signature } = body;

  if (!matchId || !supabaseMatchId || !walletAddress || !signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Verify signature proves walletAddress owns the request
  const message = `Cancel match: ${matchId}`;
  let isValid = false;
  try {
    isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
  } catch {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Verify on-chain that cancelMatch was already executed (active == false)
  //    and that walletAddress is a party to the match
  const publicClient = createPublicClient({ chain: aeneid, transport: http() });
  let onChainMatch: any;
  try {
    onChainMatch = await publicClient.readContract({
      address: MIRROR_MATCHER_ADDR,
      abi: MIRROR_MATCHER_ABI,
      functionName: "getMatch",
      args: [matchId as `0x${string}`],
    });
  } catch {
    return NextResponse.json({ error: "Failed to read on-chain match state" }, { status: 500 });
  }

  const sellWallet: string = (onChainMatch as any).sellWallet ?? onChainMatch[3];
  const buyWallet: string = (onChainMatch as any).buyWallet ?? onChainMatch[4];
  const isActive: boolean = (onChainMatch as any).active ?? onChainMatch[10];

  const isParty =
    walletAddress.toLowerCase() === sellWallet.toLowerCase() ||
    walletAddress.toLowerCase() === buyWallet.toLowerCase();

  if (!isParty) {
    return NextResponse.json({ error: "Wallet is not a party to this match" }, { status: 403 });
  }

  if (isActive) {
    return NextResponse.json(
      { error: "Match is still active on-chain — cancelMatch tx may not have confirmed yet" },
      { status: 400 }
    );
  }

  // 3. Update Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: matchRow } = await supabase
    .from("matches")
    .select("sell_vault_uuid, buy_vault_uuid")
    .eq("match_id", supabaseMatchId)
    .single();

  await supabase
    .from("matches")
    .update({ status: "rejected" })
    .eq("match_id", supabaseMatchId);

  if (matchRow) {
    await supabase
      .from("vaults")
      .update({ status: "active" })
      .in("vault_uuid", [matchRow.sell_vault_uuid, matchRow.buy_vault_uuid]);
  }

  // 4. Return success
  return NextResponse.json({ success: true, matchId });
}
