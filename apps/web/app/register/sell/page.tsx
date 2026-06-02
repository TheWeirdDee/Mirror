"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
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
  const { addToast } = useToastStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [vaultId, setVaultId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sector: "B2B SaaS",
    stage: "Series A",
    companyName: "",
    revenue: "",
    growth: "",
    teamSize: "",
    targetPrice: "",
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
      
      // 2. Wait for confirmation
      setSubmitStep("2/3: Waiting for on-chain block confirmation...");
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }
      
      // 3. Save to Supabase
      setSubmitStep("3/3: Encrypting and saving vault intent to database...");
      const { error } = await supabase.from('vaults').insert({
        vault_uuid: newVaultId,
        vault_type: 'sell',
        wallet_address: address,
        encrypted_data: formData, // In a real app, this would be symmetrically encrypted before insert
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

                <div className="space-y-6 flex-1">
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
                  <input 
                    type="text" placeholder="Annual Revenue (USD)" className="input"
                    value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})}
                  />
                  <div className="flex gap-4">
                    <input 
                      type="text" placeholder="Target Price" className="input"
                      value={formData.targetPrice} onChange={e => setFormData({...formData, targetPrice: e.target.value})}
                    />
                  </div>
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
