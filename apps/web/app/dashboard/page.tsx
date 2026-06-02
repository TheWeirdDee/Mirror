"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, usePublicClient, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { motion } from "framer-motion";
import { MIRROR_MATCHER_ADDR, MIRROR_MATCHER_ABI, MIRROR_NDA_ADDR, MIRROR_NDA_ABI } from "@/lib/contracts";
import { useToastStore } from "@/lib/toast";
import { Lock, LockOpen, Sparkles, CircleDot, ArrowLeftRight, CheckCircle2 } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();
  const { addToast } = useToastStore();

  const [vault, setVault] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [counterVault, setCounterVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [cancelModal, setCancelModal] = useState(false);

  // Read current matchId from contract
  const { data: matchIdOnChain, refetch: refetchMatchId } = useReadContract({
    address: MIRROR_MATCHER_ADDR,
    abi: MIRROR_MATCHER_ABI,
    functionName: "getMatchForWallet",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const hasMatchOnChain = matchIdOnChain && matchIdOnChain !== "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Read match data from contract
  const { data: matchOnChain, refetch: refetchMatchOnChain } = useReadContract({
    address: MIRROR_MATCHER_ADDR,
    abi: MIRROR_MATCHER_ABI,
    functionName: "getMatch",
    args: hasMatchOnChain ? [matchIdOnChain] : undefined,
    query: {
      enabled: !!hasMatchOnChain,
    }
  });

  // Read NDA record to show per-party signing status at Stage 2
  const { data: ndaRecordData, refetch: refetchNDARecord } = useReadContract({
    address: MIRROR_NDA_ADDR,
    abi: MIRROR_NDA_ABI,
    functionName: "getRecord",
    args: hasMatchOnChain ? [matchIdOnChain] : undefined,
    query: {
      enabled: !!hasMatchOnChain,
    }
  });

  const ndaRecord = ndaRecordData as
    | { sellSigned: boolean; buySigned: boolean; complete: boolean }
    | undefined;

  // Sync blockchain stage with database
  useEffect(() => {
    if (matchOnChain && match) {
      const onChainStage = Array.isArray(matchOnChain) ? matchOnChain[5] : (matchOnChain as any).stage;
      if (typeof onChainStage === 'number' && onChainStage > 0) {
        const dbStatus = `stage_${onChainStage}`;
        if (match.status !== dbStatus) {
          console.log(`Syncing match stage to DB: on-chain stage is ${onChainStage} (${dbStatus}), DB was ${match.status}`);
          supabase
            .from('matches')
            .update({ status: dbStatus })
            .eq('match_id', match.match_id)
            .then(() => {
              fetchData();
            });
        }
      }
    }
  }, [matchOnChain, match]);

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
      refetchMatchId();
      refetchMatchOnChain();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  // Poll every 30 seconds so both parties see stage updates automatically
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(() => {
      fetchData();
      refetchMatchId();
      refetchMatchOnChain();
      refetchNDARecord();
    }, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const fetchData = async () => {
    setLoading(true);
    const { data: vaultData } = await supabase
      .from('vaults')
      .select('*')
      .eq('wallet_address', address)
      .single();

    if (vaultData) {
      setVault(vaultData);

      const matchCol = vaultData.vault_type === 'sell' ? 'sell_vault_uuid' : 'buy_vault_uuid';
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq(matchCol, vaultData.vault_uuid)
        .not('status', 'in', '("rejected","expired")')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (matchData) {
        setMatch(matchData);

        const counterCol = vaultData.vault_type === 'sell' ? 'buy_vault_uuid' : 'sell_vault_uuid';
        const { data: counterVaultData } = await supabase
          .from('vaults')
          .select('*')
          .eq('vault_uuid', matchData[counterCol])
          .single();
        if (counterVaultData) {
          setCounterVault(counterVaultData);
        }
      } else {
        setMatch(null);
        setCounterVault(null);
      }
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!matchIdOnChain || !match || !address) return;
    setIsSubmitting(true);
    try {
      // Sign message so API can verify the caller's identity
      setSubmitStep("1/3: Sign the cancellation request in your wallet...");
      const signature = await signMessageAsync({ message: `Cancel match: ${matchIdOnChain}` });

      // Call cancelMatch on-chain (only the party's wallet can satisfy the require)
      setSubmitStep("2/3: Submitting cancellation on-chain...");
      const txHash = await writeContractAsync({
        address: MIRROR_MATCHER_ADDR,
        abi: MIRROR_MATCHER_ABI,
        functionName: 'cancelMatch',
        args: [matchIdOnChain],
      });

      setSubmitStep("3/3: Waiting for block confirmation...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      // Update Supabase via API
      const res = await fetch('/api/matches/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: matchIdOnChain,
          supabaseMatchId: match.match_id,
          walletAddress: address,
          signature,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update match status');
      }

      addToast("Match cancelled. Your vault remains sealed and can match again in the future.", "success");
      setCancelModal(false);
      await refetchMatchId();
      fetchData();
    } catch (err: any) {
      console.error(err);
      addToast(err.shortMessage || err.message || "Cancellation failed", "error");
    } finally {
      setIsSubmitting(false);
      setSubmitStep("");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 min-h-[80vh] mt-12">
        <div className="card text-center p-8 md:p-12 max-w-md w-full">
          <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
          <p className="text-[var(--text-secondary)] mb-8">Connect your wallet to view your encrypted vault.</p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh] mt-12">
        <div className="text-lg font-mono text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 min-h-[80vh] mt-12">
        <div className="card text-center p-8 md:p-12 max-w-md w-full">
          <h2 className="text-2xl font-semibold mb-4">No Vault Found</h2>
          <p className="text-[var(--text-secondary)] mb-8">You haven't sealed an intent vault yet.</p>
          <div className="flex flex-col gap-4">
            <Link href="/register/sell" className="btn-secondary text-center">Register as Seller</Link>
            <Link href="/register/buy" className="btn-primary text-center">Register as Buyer</Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine active stage for UI
  let currentStage = 0;
  if (match) {
    if (match.status === 'stage_1') currentStage = 1;
    if (match.status === 'stage_2') currentStage = 2;
    if (match.status === 'stage_3') currentStage = 3;
    if (match.status === 'stage_4') currentStage = 4;
  }

  // NDA signing status helpers (used at Stage 2)
  const isSellSide = vault?.vault_type === 'sell';
  const currentUserSigned = ndaRecord
    ? (isSellSide ? ndaRecord.sellSigned : ndaRecord.buySigned)
    : false;
  const counterpartySigned = ndaRecord
    ? (isSellSide ? ndaRecord.buySigned : ndaRecord.sellSigned)
    : false;

  return (
    <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full mt-12">
      {/* Cancellation confirmation modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="card max-w-md w-full p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Cancel this match?</h3>
            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
              Your match will be closed. Your vault remains sealed and can match again in the future.
            </p>
            <div className="flex gap-4">
              <button
                className="btn-secondary flex-1"
                onClick={() => setCancelModal(false)}
                disabled={isSubmitting}
              >
                Keep Match
              </button>
              <button
                className="btn-primary flex-1 disabled:opacity-50"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {isSubmitting ? submitStep || "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Mirror Dashboard</h1>
          <p className="font-mono text-sm text-[var(--text-secondary)]">Wallet: {address}</p>
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="card mb-8">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--border-default)] -z-10 -translate-y-1/2" />
          {['Sealed', 'Match Found', 'Profiles', 'NDA', 'Full Access'].map((label, idx) => (
            <div key={label} className="flex flex-col items-center bg-transparent px-2">
              <div className={`w-4 h-4 rounded-full mb-2 ${
                idx <= currentStage ? 'bg-[var(--text-primary)]' : 'bg-[var(--border-strong)]'
              }`} />
              <span className={`text-xs font-mono uppercase tracking-wider ${
                idx <= currentStage ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area based on Stage */}
      <div className="card relative overflow-hidden">
        {isSubmitting && !cancelModal && (
          <div className="absolute inset-0 bg-[var(--bg-surface)]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 border-4 border-[var(--border-default)] border-t-[var(--accent-match)] rounded-full animate-spin mb-6" />
            <h3 className="text-lg font-semibold mb-2">Executing On-Chain Protocol Step</h3>
            <p className="text-[var(--text-secondary)] text-sm font-mono">{submitStep}</p>
          </div>
        )}

        {currentStage === 0 && (
          <div className="py-8">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-10 h-10 text-[var(--status-sealed)]" />
              <div>
                <h2 className="text-2xl font-semibold text-[var(--status-sealed)]">VAULT SEALED</h2>
                <p className="text-[var(--text-secondary)] mt-1">Your intent is encrypted on-chain.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-[var(--border-default)] pt-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Vault Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Vault ID</p>
                    <p className="font-mono text-sm">{vault.vault_uuid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Type</p>
                    <p className="capitalize">{vault.vault_type}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-elevated)] p-6 rounded-lg border border-[var(--border-default)]">
                <h3 className="font-semibold mb-2">Matching Agent Active</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Our off-chain workers are continuously running mathematical comparisons.
                  You will be notified here immediately when a match is found.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Polling for matches...
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStage === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 card-match-found p-8">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-10 h-10 text-[var(--accent-match)] animate-pulse" />
              <div>
                <h2 className="text-2xl font-semibold text-[var(--accent-match)]">MATCH FOUND</h2>
                <p className="text-[var(--text-secondary)] mt-1">A potential deal exists in our network.</p>
              </div>
              <div className="ml-auto text-right">
                <p className="score">{match.score}%</p>
                <p className="score-label">Compatibility</p>
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] p-6 rounded-lg mb-8">
              <p className="text-lg leading-relaxed">
                No identifying details are revealed yet. Both sides must confirm interest to unlock Stage 2 profiles.
                Approving this signs an on-chain transaction.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                className="btn-primary flex-1 py-4 text-lg disabled:opacity-50"
                onClick={async () => {
                  if (!matchIdOnChain) return;
                  setIsSubmitting(true);
                  setSubmitStep("1/2: Requesting signature in wallet...");
                  try {
                    const txHash = await writeContractAsync({
                      address: MIRROR_MATCHER_ADDR,
                      abi: MIRROR_MATCHER_ABI,
                      functionName: 'confirmAdvanceToStage2',
                      args: [matchIdOnChain],
                    });
                    setSubmitStep("2/2: Waiting for on-chain block confirmation...");
                    if (publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash: txHash });
                    }
                    addToast("Interest confirmed successfully! Waiting for counterparty.", "success");
                    await refetchMatchOnChain();
                    fetchData();
                  } catch (err: any) {
                    console.error(err);
                    addToast(err.shortMessage || err.message || "On-chain confirmation failed", "error");
                  } finally {
                    setIsSubmitting(false);
                    setSubmitStep("");
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Proceed to Stage 2 →"}
              </button>
              <button
                className="btn-secondary py-4 px-8"
                onClick={() => setCancelModal(true)}
                disabled={isSubmitting}
              >
                Not Interested
              </button>
            </div>
          </motion.div>
        )}

        {currentStage === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
            <div className="flex items-center gap-4 mb-8">
              <CircleDot className="w-10 h-10 text-[var(--status-revealed)]" />
              <div>
                <h2 className="text-2xl font-semibold text-[var(--status-revealed)]">YOUR MATCH — STAGE 2</h2>
                <p className="text-[var(--text-secondary)] mt-1">Thin profiles are now visible.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4">Counterparty Profile</h3>
                {vault.vault_type === 'sell' ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Acquirer Type</p>
                      <p className="capitalize">{counterVault?.encrypted_data?.acquirerType || "Strategic"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Target Sectors</p>
                      <p>{counterVault?.encrypted_data?.targetSectors || "B2B SaaS, Data & Analytics"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Budget Range</p>
                      <p>{counterVault?.encrypted_data?.budgetMin ? `$${counterVault.encrypted_data.budgetMin} - $${counterVault.encrypted_data.budgetMax}` : "$10M - $50M"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Sector</p>
                      <p>{counterVault?.encrypted_data?.sector || "B2B SaaS"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Stage</p>
                      <p className="capitalize">{counterVault?.encrypted_data?.stage || "Series A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Target Price</p>
                      <p>{counterVault?.encrypted_data?.targetPrice ? `$${counterVault.encrypted_data.targetPrice}` : "$15M"}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[var(--bg-elevated)] p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Next Step: On-Chain NDA</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Sign the NDA to proceed. The reveal happens when both parties have signed — no rush.
                </p>

                {/* Per-party signing status */}
                <div className="mb-4 space-y-2 text-sm">
                  {currentUserSigned ? (
                    <p className="text-green-500 font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      You have signed ✓
                    </p>
                  ) : null}
                  {currentUserSigned && !counterpartySigned ? (
                    <p className="text-[var(--text-secondary)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse inline-block" />
                      Waiting for counterparty to sign...
                    </p>
                  ) : null}
                </div>

                {!currentUserSigned && (
                  <button
                    className="btn-primary w-full disabled:opacity-50"
                    onClick={async () => {
                      if (!matchIdOnChain) return;
                      setIsSubmitting(true);
                      setSubmitStep("1/2: Requesting NDA signature in wallet...");
                      try {
                        const txHash = await writeContractAsync({
                          address: MIRROR_NDA_ADDR,
                          abi: MIRROR_NDA_ABI,
                          functionName: 'sign',
                          args: [matchIdOnChain],
                        });
                        setSubmitStep("2/2: Waiting for on-chain block confirmation...");
                        if (publicClient) {
                          await publicClient.waitForTransactionReceipt({ hash: txHash });
                        }
                        addToast("NDA signed. Waiting for counterparty to sign.", "success");
                        await refetchNDARecord();
                        await refetchMatchOnChain();
                        fetchData();
                      } catch (err: any) {
                        console.error(err);
                        addToast(err.shortMessage || err.message || "NDA signature failed", "error");
                      } finally {
                        setIsSubmitting(false);
                        setSubmitStep("");
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing NDA..." : "Sign NDA & Reveal Identity"}
                  </button>
                )}
              </div>
            </div>

            {/* Step Back — cancel while still at Stage 2 */}
            <div className="border-t border-[var(--border-default)] pt-6 flex justify-end">
              <button
                className="btn-secondary px-6 py-3"
                onClick={() => setCancelModal(true)}
                disabled={isSubmitting}
              >
                Step Back
              </button>
            </div>
          </motion.div>
        )}

        {currentStage === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
             <div className="flex items-center justify-between mb-12">
               <div className="text-center flex-1 company-name-reveal">
                 <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest mb-2">You</p>
                 <h2 className="text-3xl font-semibold">{vault?.encrypted_data?.companyName || "Your Company"}</h2>
               </div>
               <div className="text-[var(--accent-match)] text-2xl px-8">
                 <ArrowLeftRight size={24} className="text-[var(--accent-match)]" />
               </div>
               <div className="text-center flex-1 company-name-reveal">
                 <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest mb-2">Counterparty</p>
                 <h2 className="text-3xl font-semibold">{counterVault?.encrypted_data?.companyName || "Acme Corp"}</h2>
               </div>
             </div>

             <div className="border border-[var(--border-default)] rounded-xl p-8 bg-[var(--bg-elevated)] flex flex-col items-center text-center">
               <h3 className="text-xl font-semibold text-[var(--status-signed)] mb-2 flex items-center justify-center gap-2">
                 <CheckCircle2 size={20} className="text-[var(--status-signed)]" />
                 <span>NDA Signed On-Chain</span>
               </h3>
               <p className="text-[var(--text-secondary)] mb-6">Negotiation Rights NFT has been minted.</p>

               {vault.vault_type === 'sell' ? (
                 <button
                   className="btn-primary px-12 py-4 text-lg disabled:opacity-50"
                   onClick={async () => {
                     if (!matchIdOnChain) return;
                     setIsSubmitting(true);
                     setSubmitStep("1/2: Requesting consent signature in wallet...");
                     try {
                       const txHash = await writeContractAsync({
                         address: MIRROR_MATCHER_ADDR,
                         abi: MIRROR_MATCHER_ABI,
                         functionName: 'grantStage4',
                         args: [matchIdOnChain],
                       });
                       setSubmitStep("2/2: Waiting for on-chain block confirmation...");
                       if (publicClient) {
                         await publicClient.waitForTransactionReceipt({ hash: txHash });
                       }
                       addToast("Financial details unlocked to counterparty successfully!", "success");
                       await refetchMatchOnChain();
                       fetchData();
                     } catch (err: any) {
                       console.error(err);
                       addToast(err.shortMessage || err.message || "Failed to grant stage 4 financials", "error");
                     } finally {
                       setIsSubmitting(false);
                       setSubmitStep("");
                     }
                   }}
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? "Sharing..." : (
                     <span className="flex items-center gap-2 justify-center">
                       <span>Share Financial Details</span>
                       <LockOpen size={18} />
                     </span>
                   )}
                 </button>
               ) : (
                 <div className="bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--border-default)] w-full max-w-md">
                   <p className="text-[var(--text-secondary)]">Waiting for seller to unlock financial details...</p>
                   <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
                     <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                     Polling consent...
                   </div>
                 </div>
               )}
             </div>
          </motion.div>
        )}

        {currentStage === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
             <div className="flex items-center justify-between mb-12">
               <div className="text-center flex-1 company-name-reveal">
                 <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest mb-2">You</p>
                 <h2 className="text-3xl font-semibold">{vault?.encrypted_data?.companyName || "Your Company"}</h2>
               </div>
               <div className="text-[var(--accent-match)] text-2xl px-8">
                 <ArrowLeftRight size={24} className="text-[var(--accent-match)]" />
               </div>
               <div className="text-center flex-1 company-name-reveal">
                 <p className="text-sm text-[var(--text-secondary)] uppercase tracking-widest mb-2">Counterparty</p>
                 <h2 className="text-3xl font-semibold">{counterVault?.encrypted_data?.companyName || "Acme Corp"}</h2>
               </div>
             </div>

             <div className="border border-[var(--border-default)] rounded-xl p-8 bg-[var(--bg-elevated)] flex flex-col items-center">
               <h3 className="text-xl font-semibold text-[var(--accent-match)] mb-4">STAGE 4 — FINANCIAL DETAILS UNLOCKED</h3>
               {vault.vault_type === 'sell' ? (
                 <p className="text-[var(--text-secondary)] text-center max-w-md">
                   You have successfully shared your financial details with the buyer. Both parties now hold the Negotiation Rights NFT and can proceed with offline diligence.
                 </p>
               ) : (
                 <div className="w-full max-w-md bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--border-default)]">
                   <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-6 text-center">Diligence Metrics</h4>
                   <div className="grid grid-cols-2 gap-6">
                     <div>
                       <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Annual Revenue (USD)</p>
                       <p className="text-lg font-semibold">{counterVault?.encrypted_data?.revenue ? `$${counterVault.encrypted_data.revenue}` : "$2,800,000"}</p>
                     </div>
                     <div>
                       <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">YoY Growth</p>
                       <p className="text-lg font-semibold">{counterVault?.encrypted_data?.growth ? `${counterVault.encrypted_data.growth}%` : "140%"}</p>
                     </div>
                     <div>
                       <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Target Price</p>
                       <p className="text-lg font-semibold">{counterVault?.encrypted_data?.targetPrice ? `$${counterVault.encrypted_data.targetPrice}` : "$18,000,000"}</p>
                     </div>
                     <div>
                       <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Team Size</p>
                       <p className="text-lg font-semibold">{counterVault?.encrypted_data?.teamSize || "18"}</p>
                     </div>
                   </div>
                 </div>
               )}
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
