"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Docs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full mt-20 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-semibold mb-4 tracking-tight">Documentation</h1>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Learn how Mirror uses Story's Confidential Data Rails (CDR) to enable trustless, private M&A matching.
        </p>
      </motion.div>

      {/* What is Mirror */}
      <section className="mb-16 border-t border-[var(--border-default)] pt-12">
        <h2 className="text-2xl font-semibold mb-6">What is Mirror?</h2>
        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
          <p>
            Mirror is a decentralized, stealth acquisition matchmaker built on **Story's Confidential Data Rails (CDR)**. Today, M&A transactions rely on intermediaries (investment bankers and brokers) who charge 2–5% of the total deal value. These intermediaries exist primarily to resolve a single problem: **information asymmetry**.
          </p>
          <p>
            Neither a buyer nor a seller can safely signal interest first without risking leaks, losing leverage, or exposing proprietary data. Mirror eliminates this middleman entirely. Both sides seal their intents and metrics into secure, cryptographically guarded TEE (Trusted Execution Environment) vaults. The protocol performs math comparisons off-chain in the TEE, scoring compatibility privately and unlocking information in controlled, mutual stages.
          </p>
        </div>
      </section>

      {/* CDR Architecture Diagram */}
      <section className="mb-16 border-t border-[var(--border-default)] pt-12">
        <h2 className="text-2xl font-semibold mb-6">CDR & Staged Revelation</h2>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          Story's Confidential Data Rails protect data through a Distributed Key Generation (DKG) system. Data is encrypted using a threshold public key, and validator nodes can only release decryption keys when the on-chain read condition contracts evaluate to <code className="font-mono text-xs bg-[var(--bg-elevated)] px-1 py-0.5 rounded">true</code>.
        </p>

        {/* Visual HTML Diagram */}
        <div className="card bg-[var(--bg-elevated)] p-8 border border-[var(--border-default)] mb-8 flex flex-col gap-6 rounded-lg font-mono text-xs">
          <div className="flex justify-between items-center text-center">
            <div className="p-3 border border-[var(--border-strong)] rounded bg-[var(--bg-surface)] w-1/4">
              <span className="font-bold block mb-1">User Vault</span>
              <span className="text-[var(--text-secondary)] text-[10px]">Private Data Sealed</span>
            </div>
            <div className="text-[var(--text-secondary)]">── register ──&gt;</div>
            <div className="p-3 border border-[var(--border-strong)] rounded bg-[var(--bg-surface)] w-1/3">
              <span className="font-bold block mb-1">StagedReadCondition</span>
              <span className="text-[var(--text-secondary)] text-[10px]">On-Chain Condition Guard</span>
            </div>
            <div className="text-[var(--text-secondary)]">&lt;── query ──</div>
            <div className="p-3 border border-[var(--border-strong)] rounded bg-[var(--bg-surface)] w-1/4">
              <span className="font-bold block mb-1">Story Validators</span>
              <span className="text-[var(--text-secondary)] text-[10px]">DKG Quorum Checks</span>
            </div>
          </div>

          <div className="border-t border-[var(--border-default)] pt-6 flex flex-col gap-3 text-[var(--text-secondary)] leading-relaxed">
            <p>
              1. **Stage 0 (Sealed)**: Vault is completely sealed. No read queries are allowed.
            </p>
            <p>
              2. **Stage 1 (Match Found)**: The Matching Agent reads public signals only. A match triggers on-chain entry.
            </p>
            <p>
              3. **Stage 2 (Profiles)**: Both parties confirm interest. The counterparty agent reads thin signals (sector, size, stage).
            </p>
            <p>
              4. **Stage 3 (NDA Signed)**: Both parties sign the mutual NDA contract. Company identities unlock simultaneously, and a Soulbound NFT is minted.
            </p>
            <p>
              5. **Stage 4 (Financials)**: The seller grants consent, releasing full private financials.
            </p>
          </div>
        </div>
      </section>

      {/* The Four Stages Table */}
      <section className="mb-16 border-t border-[var(--border-default)] pt-12">
        <h2 className="text-2xl font-semibold mb-6">The Four Stages of Revelation</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-strong)] text-[var(--text-secondary)] font-mono uppercase tracking-wider text-xs">
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">What Unlocks</th>
                <th className="py-3 px-4">Required Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {[
                { s: "0", name: "Sealed", what: "Data resides fully encrypted in the TEE.", cond: "Default state after registration." },
                { s: "1", name: "Match Found", what: "Compatibility score is displayed on dashboards.", cond: "Matching Agent scores pair compatibility ≥ 60%." },
                { s: "2", name: "Thin Profile", what: "Sector, stage, and deal metrics visible (names hidden).", cond: "Both parties confirm interest." },
                { s: "3", name: "Identity Reveal", what: "Company names revealed; Soulbound rights NFT minted.", cond: "Both parties sign the on-chain NDA." },
                { s: "4", name: "Financial Access", what: "Private financial details unlocked to counterparty.", cond: "Owner explicitly calls grantStage4()." }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-[var(--accent-match)]">{row.s}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold block mb-1">{row.name}</span>
                    <span className="text-[var(--text-secondary)] text-xs">{row.what}</span>
                  </td>
                  <td className="py-4 px-4 text-[var(--text-secondary)] text-xs">{row.cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mb-16 border-t border-[var(--border-default)] pt-12">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can the platform operator view my sealed financials?",
              a: "No. The data is encrypted using threshold encryption before it leaves your browser. Decryption keys are managed by Story Protocol's validator nodes and are only compiled in the client after the on-chain read conditions are satisfied."
            },
            {
              q: "What is the Negotiation Rights NFT?",
              a: "It is an ERC-721 token minted automatically to both parties when they sign the mutual NDA. It is non-transferable (soulbound) and represents a cryptographic record of intent to engage in diligence."
            },
            {
              q: "How does the matching agent score compatibility without decrypting data?",
              a: "Both parties write 'public signals' (e.g. sector, stage range) off-chain. The matching agent evaluates these public inputs to determine compatibility. The private data (company names, detailed revenue, target prices) remains locked."
            }
          ].map((faq, i) => (
            <div key={i} className="border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-surface)]">
              <button
                className="w-full text-left p-5 font-semibold flex justify-between items-center hover:bg-[var(--bg-elevated)] transition-colors"
                onClick={() => toggleFaq(i)}
              >
                <span>{faq.q}</span>
                <span className="text-lg">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="p-5 border-t border-[var(--border-default)] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-elevated)]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-t border-[var(--border-default)] pt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">Developers & Resources</h2>
        <div className="flex justify-center gap-6 text-sm font-mono">
          <a
            href="https://aeneid.storyscan.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-[var(--text-secondary)]"
          >
            Story Explorer
          </a>
          <span>•</span>
          <a
            href="https://faucet.story.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-[var(--text-secondary)]"
          >
            Story Faucet
          </a>
          <span>•</span>
          <a
            href="https://docs.story.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-[var(--text-secondary)]"
          >
            Story Docs
          </a>
        </div>
      </section>
    </div>
  );
}
