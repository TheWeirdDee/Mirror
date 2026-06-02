"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { CDRClient, initWasm } from "@piplabs/cdr-sdk";
import { cdrAbi } from "@piplabs/cdr-contracts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { MIRROR_MATCHER_ADDR, MIRROR_MATCHER_ABI } from "@/lib/contracts";

import { useToastStore } from "@/lib/toast";
import { Lock } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SellRegistration() {
  const [step, setStep] = useState(1);
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { addToast } = useToastStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [vaultId, setVaultId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sector: "B2B SaaS",
    stage: "Series A",
    dealType: "Acquisition",
    sizeRange: "$10M–$50M",
    geography: "US, Remote",
    companyName: "Archway Analytics",
    revenue: "2800000",
    arr: "3200000",
    growth: "140",
    teamSize: "18",
    targetPrice: "18000000",
    priceFloor: "14000000",
    dealNotes: "Founders seeking larger distribution platform. Product is mature. Growth limited by sales bandwidth not product quality.",
    dealBreakers: "Acquirer must retain at least 80% of team for 18 months post-close",
  });

  const step2Valid =
    formData.companyName.trim() !== "" &&
    formData.revenue.trim() !== "" &&
    formData.targetPrice.trim() !== "";

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSeal = async () => {
    if (!address) return;
    setIsSubmitting(true);
    
    // Generate UUID for vault
    const newVaultId = crypto.randomUUID();
    const vaultBytes32 = `0x${newVaultId.replace(/-/g, "").padEnd(64, "0")}` as `0x${string}`;
    
    try {
      // 1. Call on-chain registerVault
      setSubmitStep("1/3: Requesting signature in wallet...");
      const txHash = await writeContractAsync({
        address: MIRROR_MATCHER_ADDR,
        abi: MIRROR_MATCHER_ABI,
        functionName: "registerVault",
        args: [vaultBytes32, address, "sell"],
      });
      
      console.log("On-chain Tx Hash:", txHash);
      
      // 2. Wait for confirmation — must succeed before writing to Supabase
      setSubmitStep("2/4: Waiting for on-chain block confirmation...");
      if (!publicClient) throw new Error("Chain client unavailable. Refresh and try again.");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // 3. Encrypt private fields to a real CDR vault on Story
      setSubmitStep("3/4: Encrypting private data to CDR vault on Story...");
      if (!walletClient) throw new Error("Wallet client unavailable.");
      await initWasm();
      const cdrClient = new CDRClient({
        network: "testnet",
        publicClient: publicClient as any,
        walletClient: walletClient as any,
        apiUrl: process.env.NEXT_PUBLIC_STORY_API_URL!,
      });
      const [allocateFee, writeFee] = await Promise.all([
        cdrClient.observer.getAllocateFee(),
        cdrClient.observer.getWriteFee(),
      ]);
      const privateFields = {
        companyName: formData.companyName,
        revenue: formData.revenue,
        arr: formData.arr,
        growth: formData.growth,
        teamSize: formData.teamSize,
        targetPrice: formData.targetPrice,
        priceFloor: formData.priceFloor,
        dealNotes: formData.dealNotes,
        dealBreakers: formData.dealBreakers,
      };
      const writeConditionData = encodeAbiParameters(
        parseAbiParameters("address"),
        [address as `0x${string}`]
      );
      const CDR_ADDR = "0xCCCcCC0000000000000000000000000000000005" as const;
      const [chainWriteFee, chainAllocateFee, chainMaxSize] = await Promise.all([
        publicClient.readContract({ address: CDR_ADDR, abi: cdrAbi, functionName: "writeFee" }),
        publicClient.readContract({ address: CDR_ADDR, abi: cdrAbi, functionName: "allocateFee" }),
        publicClient.readContract({ address: CDR_ADDR, abi: cdrAbi, functionName: "maxEncryptedDataSize" }),
      ]);
      console.log("[CDR chain]", {
        writeFee: chainWriteFee.toString(),
        allocateFee: chainAllocateFee.toString(),
        maxEncryptedDataSize: chainMaxSize.toString(),
      });
      console.log("[CDR debug] uploadCDR params:", {
        writeConditionAddr: process.env.NEXT_PUBLIC_OWNER_WRITE_CONDITION_ADDR,
        readConditionAddr: process.env.NEXT_PUBLIC_STAGED_READ_CONDITION_ADDR,
        writeConditionData,
        readConditionData: vaultBytes32,
        allocateFee: allocateFee.toString(),
        writeFee: writeFee.toString(),
      });
      const cdrResult = await cdrClient.uploader.uploadCDR({
        dataKey: new TextEncoder().encode(JSON.stringify(privateFields)),
        updatable: false,
        writeConditionAddr: process.env.NEXT_PUBLIC_OWNER_WRITE_CONDITION_ADDR as `0x${string}`,
        readConditionAddr: process.env.NEXT_PUBLIC_STAGED_READ_CONDITION_ADDR as `0x${string}`,
        writeConditionData,
        readConditionData: vaultBytes32,
        accessAuxData: "0x",
        allocateFeeOverride: allocateFee,
        writeFeeOverride: writeFee,
      });
      console.log("[CDR debug] result:", { uuid: cdrResult.uuid, txHashes: cdrResult.txHashes });

      // Verify write tx actually succeeded — viem does not throw on revert
      const writeReceipt = await publicClient.getTransactionReceipt({ hash: cdrResult.txHashes.write });
      if (writeReceipt.status === 'reverted') {
        throw new Error(`CDR write tx reverted (allocate fee: ${allocateFee}, write fee: ${writeFee}). Vault data was not encrypted on-chain.`);
      }

      // 4. Save to Supabase — public signals + CDR vault reference
      setSubmitStep("4/4: Recording vault in database...");
      const { error } = await supabase.from('vaults').insert({
        vault_uuid: newVaultId,
        vault_type: 'sell',
        wallet_address: address,
        encrypted_data: {
          sector: formData.sector,
          stage: formData.stage,
          dealType: formData.dealType,
          sizeRange: formData.sizeRange,
          geography: formData.geography,
          companyName: formData.companyName,
          cdr_vault_uuid: cdrResult.uuid,
        },
        status: 'active'
      });

      setIsSubmitting(false);
      
      if (!error) {
        setVaultId(newVaultId);
        addToast("Vault successfully sealed on-chain and registered!", "success");
        setStep(4);
      } else {
        console.error(error);
        addToast("Failed to write to vault database.", "error");
      }
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      addToast(err.shortMessage || err.message || "On-chain transaction failed", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div 
               key={i} 
               className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                 i <= step ? 'bg-[var(--text-primary)]' : 'bg-[var(--border-default)]'
               }`} 
            />
          ))}
        </div>

        <div className="card min-h-[400px] flex flex-col relative overflow-hidden">
          {isSubmitting && (
            <div className="absolute inset-0 bg-[var(--bg-surface)]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6">
              <div className="w-10 h-10 border-4 border-[var(--border-default)] border-t-[var(--accent-match)] rounded-full animate-spin mb-6" />
              <h3 className="text-lg font-semibold mb-2">Sealing Cryptographic Vault</h3>
              <p className="text-[var(--text-secondary)] text-sm font-mono">{submitStep}</p>
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">Step 1 — Public Signals</h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    These details are visible to our matching agent only. Never shown to any human until you consent.
                  </p>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Sector</label>
                    <select
                      className="input appearance-none"
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    >
                      <option>B2B SaaS</option>
                      <option>Consumer</option>
                      <option>Fintech</option>
                      <option>Data & Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Stage</label>
                    <select
                      className="input appearance-none"
                      value={formData.stage}
                      onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    >
                      <option>Pre-seed</option>
                      <option>Seed</option>
                      <option>Series A</option>
                      <option>Series B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deal Type</label>
                    <input
                      type="text" className="input" placeholder="e.g. Acquisition, Acquihire"
                      value={formData.dealType}
                      onChange={(e) => setFormData({...formData, dealType: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Size Range</label>
                    <input
                      type="text" className="input" placeholder="e.g. $10M–$50M"
                      value={formData.sizeRange}
                      onChange={(e) => setFormData({...formData, sizeRange: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Geography</label>
                    <input
                      type="text" className="input" placeholder="e.g. US, Remote"
                      value={formData.geography}
                      onChange={(e) => setFormData({...formData, geography: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={handleNext} className="btn-primary">Continue &rarr;</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">Step 2 — Private Details</h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    This data never leaves your encrypted vault. Not us. Not validators. Not anyone — until you decide.
                  </p>
                </div>

                <div className="space-y-4 flex-1">
                  <input
                    type="text" placeholder="Company Name" className="input"
                    value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                  />
                  <div className="flex gap-4">
                    <input
                      type="text" placeholder="Annual Revenue (USD)" className="input"
                      value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})}
                    />
                    <input
                      type="text" placeholder="ARR (USD)" className="input"
                      value={formData.arr} onChange={e => setFormData({...formData, arr: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="text" placeholder="Team Size" className="input"
                      value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})}
                    />
                    <input
                      type="text" placeholder="Growth Rate %" className="input"
                      value={formData.growth} onChange={e => setFormData({...formData, growth: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="text" placeholder="Target Price (USD)" className="input"
                      value={formData.targetPrice} onChange={e => setFormData({...formData, targetPrice: e.target.value})}
                    />
                    <input
                      type="text" placeholder="Price Floor (USD)" className="input"
                      value={formData.priceFloor} onChange={e => setFormData({...formData, priceFloor: e.target.value})}
                    />
                  </div>
                  <textarea
                    placeholder="Deal Notes — anything else the right acquirer should know" className="input min-h-[80px] resize-none"
                    value={formData.dealNotes} onChange={e => setFormData({...formData, dealNotes: e.target.value})}
                  />
                  <input
                    type="text" placeholder="Deal Breakers" className="input"
                    value={formData.dealBreakers} onChange={e => setFormData({...formData, dealBreakers: e.target.value})}
                  />
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="btn-secondary">&larr; Back</button>
                  <button onClick={handleNext} className="btn-primary">Continue &rarr;</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">Step 3 — Seal your vault</h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Your vault is sealed to your wallet address. Only you can advance the reveal process.
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-4">
                  <ConnectButton />
                  {!step2Valid && (
                    <p className="text-sm text-[var(--text-secondary)] text-center mt-2">
                      ← Go back and fill in Company Name, Annual Revenue, and Target Price before sealing.
                    </p>
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="btn-secondary">&larr; Back</button>
                  <button
                    onClick={handleSeal}
                    disabled={!isConnected || isSubmitting || !step2Valid}
                    className="btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                    title={!step2Valid ? "Fill in all required fields first" : undefined}
                  >
                    <span>{isSubmitting ? "Sealing..." : "Seal Vault"}</span>
                    <Lock size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col flex-1 items-center justify-center text-center py-12"
              >
                <div className="flex justify-center mb-6 text-[var(--status-sealed)]">
                  <Lock size={64} />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Your vault is sealed</h2>
                <p className="text-[var(--text-secondary)] mb-6 max-w-md">
                  Your intent is now sealed. Our matching agent runs constantly. If a match is found, you'll be notified. Nothing is revealed until you consent.
                </p>
                <div className="vault-id mb-8">Vault ID: {vaultId}</div>
                <Link href="/dashboard" className="btn-primary">
                  View Dashboard &rarr;
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
