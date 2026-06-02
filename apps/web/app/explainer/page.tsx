"use client";

import "./explainer.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ExplainerPage() {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Header — above the fold, opacity fade is safe
      gsap.from(".page-eyebrow", { y: -20, opacity: 0, duration: 0.7, ease: "power3.out" });
      gsap.from(".page-title", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.08 });
      gsap.from(".page-subtitle", { y: 18, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.15 });

      // Below-fold — scroll-triggered slide only, no opacity so elements never get stuck invisible
      gsap.from(".section-header", { y: 22, duration: 0.7, ease: "power3.out", stagger: 0.1, clearProps: "transform", scrollTrigger: { trigger: ".section-header", start: "top 88%", once: true } });
      gsap.from(".expl-card", { y: 24, duration: 0.75, ease: "power3.out", stagger: 0.07, clearProps: "transform", scrollTrigger: { trigger: ".expl-card", start: "top 88%", once: true } });
      gsap.from(".callout", { y: 20, duration: 0.7, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".callout", start: "top 88%", once: true } });
      gsap.from(".compare-col", { y: 24, duration: 0.75, ease: "power3.out", stagger: 0.1, clearProps: "transform", scrollTrigger: { trigger: ".compare-col", start: "top 88%", once: true } });
      gsap.from(".step-item", { x: -20, duration: 0.7, ease: "power3.out", stagger: 0.08, clearProps: "transform", scrollTrigger: { trigger: ".step-item", start: "top 88%", once: true } });
      gsap.from(".faq-item", { y: 18, duration: 0.65, ease: "power3.out", stagger: 0.06, clearProps: "transform", scrollTrigger: { trigger: ".faq-item", start: "top 88%", once: true } });
      gsap.from(".verdict-box", { y: 24, duration: 0.8, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".verdict-box", start: "top 88%", once: true } });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="explainer-page-wrapper" ref={pageRef}>
      <div style={{ paddingTop: '80px' }}>
        <div className="page">

          {/*  HEADER  */}
          <div className="page-header">
            <div className="page-eyebrow">Mirror Protocol · CDR Explainer</div>
            <h1 className="page-title">How does Mirror <em>actually</em> work?</h1>
            <p className="page-subtitle">A plain-English breakdown of the technology, the protocol, and why none of this was possible before Confidential Data Rails.</p>
          </div>

          {/*  SECTION 1: THE PROBLEM  */}
          <div className="section-header">
            <span className="section-num">1.</span>
            <span className="section-title-text">The problem with M&A today</span>
          </div>

          <div className="card-row card-row-2">
            <div className="expl-card card-red">
              <div className="card-label">Startups cannot</div>
              <h3>Signal acquisition interest</h3>
              <p>The moment a founder hints at wanting to exit, valuation drops, employees panic, and competitors move in. Silence is survival — even when an exit is the right move.</p>
            </div>
            <div className="expl-card card-red">
              <div className="card-label">Acquirers cannot</div>
              <h3>Reveal acquisition criteria</h3>
              <p>Sharing what sectors, stages, or prices you're targeting inflates every target's valuation. Competitors learn your strategy. The informal channel must stay informal.</p>
            </div>
          </div>

          <div className="callout">
            <p>So both sides hire bankers. Bankers charge 2–5% of deal value to hold the information both sides can't share. That's $50B a year for a coordination problem.</p>
          </div>

          <div className="expl-card card-gold" style={{"marginBottom": "40px"}}>
            <div className="card-label">The core dysfunction</div>
            <h3>Nobody can safely go first</h3>
            <p>Both sides need to share sensitive information to find out if a deal is worth pursuing. But sharing that information before trust is established is catastrophically risky. So nothing happens — or bankers step in and extract value from the gap.</p>
          </div>

          <hr className="section-divider" />

          {/*  SECTION 2: WHAT CDR IS  */}
          <div className="section-header">
            <span className="section-num">2.</span>
            <span className="section-title-text">What is Confidential Data Rails?</span>
          </div>

          <div className="card-row card-row-3" style={{"marginBottom": "12px"}}>
            <div className="expl-card card-blue">
              <div className="card-label">Step 1</div>
              <h3>TEE-backed encryption</h3>
              <p>Data is encrypted to a threshold public key controlled by a decentralized network of Trusted Execution Environments — physically sealed hardware on Story validator nodes.</p>
            </div>
            <div className="expl-card card-blue">
              <div className="card-label">Step 2</div>
              <h3>On-chain conditions</h3>
              <p>A read condition contract lives on Story Protocol. When someone wants to access vault data, validators check whether the on-chain condition is met before releasing their partial decryption keys.</p>
            </div>
            <div className="expl-card card-blue">
              <div className="card-label">Step 3</div>
              <h3>Client-side decryption</h3>
              <p>When a quorum of validators confirms the condition, the requester receives enough partial keys to assemble the full decryption key. Data decrypts on their device — never in the clear on any server.</p>
            </div>
          </div>

          <div className="connector-wrap" style={{"margin": "8px 0 8px"}}>
            <svg width="100%" height="32" viewBox="0 0 600 32">
              <path d="M 0 16 Q 300 0 600 16" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"/>
              <polygon points="595,12 600,16 595,20" fill="#c9a84c" opacity="0.7"/>
            </svg>
            <span className="hand-label">result ↓</span>
          </div>

          <div className="expl-card card-gold" style={{"marginBottom": "12px"}}>
            <div className="card-label">The CDR primitive</div>
            <h3>Private data that behaves like a programmable, composable on-chain object</h3>
            <p>It has an address. It has rules. Other contracts can interact with it. The blockchain records what happened without ever seeing the data. No trusted middleman required — the TEE is the trust.</p>
          </div>

          {/*  WHY CDR COMPARISON  */}
          <div className="compare-wrap" style={{"margin": "20px 0 40px"}}>
            <div className="compare-col">
              <div className="compare-head bad flex items-center gap-2">
                <XCircle size={18} />
                <span>Every alternative fails</span>
              </div>
              <div className="compare-row">
                <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>Centralized server</strong> — operator sees everything, becomes the banker, can be subpoenaed</span>
              </div>
              <div className="compare-row">
                <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>Fully offchain storage</strong> — private but loses composability, contracts can't reference it</span>
              </div>
              <div className="compare-row">
                <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>FHE</strong> — composable but 1000× too slow for real applications today</span>
              </div>
              <div className="compare-row">
                <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong>Trusted oracle</strong> — requires trusting a person or company that can be coerced</span>
              </div>
            </div>
            <div className="compare-col">
              <div className="compare-head good flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>CDR delivers all three</span>
              </div>
              <div className="compare-row">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Private</strong> — TEE is physically sealed hardware, not a software promise</span>
              </div>
              <div className="compare-row">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Composable</strong> — vaults are on-chain objects, contracts interact with them</span>
              </div>
              <div className="compare-row">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Trustless</strong> — conditions enforced by protocol, not by any company or person</span>
              </div>
              <div className="compare-row">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span><strong>Programmable</strong> — read conditions can be any on-chain logic</span>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/*  SECTION 3: HOW MIRROR USES CDR  */}
          <div className="section-header">
            <span className="section-num">3.</span>
            <span className="section-title-text">How Mirror uses CDR</span>
          </div>

          <div className="card-row card-row-2" style={{"marginBottom": "16px"}}>
            <div className="expl-card card-teal">
              <div className="card-label">Sell-side vault</div>
              <h3>Startup seals intent</h3>
              <p>Company name, ARR, growth, target price — all encrypted before leaving the browser. Public signals (sector, stage, deal type) stored separately for matching. Private data is sealed with a staged read condition starting at Stage 0: nobody can read it.</p>
              <div style={{"marginTop": "12px"}}>
                <span className="tag-pill">SellSideVault</span>
                <span className="tag-pill">OwnerOnlyWrite</span>
                <span className="tag-pill">StagedReadCondition</span>
              </div>
            </div>
            <div className="expl-card card-purple">
              <div className="card-label">Buy-side vault</div>
              <h3>Acquirer seals criteria</h3>
              <p>Company name, budget range, strategic rationale, must-haves — all encrypted and sealed. Public signals tell the matching agent what they're looking for without revealing who they are or how much they'll pay.</p>
              <div style={{"marginTop": "12px"}}>
                <span className="tag-pill">BuySideVault</span>
                <span className="tag-pill">OwnerOnlyWrite</span>
                <span className="tag-pill">StagedReadCondition</span>
              </div>
            </div>
          </div>

          <div className="connector-wrap" style={{"margin": "4px 0 4px", "position": "relative", "height": "48px"}}>
            <svg width="100%" height="48" viewBox="0 0 600 48" style={{"position": "absolute", "top": "0", "left": "0"}}>
              <path d="M 150 8 Q 300 48 450 8" fill="none" stroke="#c9a84c" strokeWidth="2" strokeDasharray="5 4"/>
              <polygon points="448,4 452,10 456,5" fill="#c9a84c" opacity="0.8"/>
              <text x="300" y="38" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="14" fill="#c9a84c" opacity="0.9">matching agent reads only public signals</text>
            </svg>
          </div>

          <div className="expl-card card-gold" style={{"marginBottom": "40px"}}>
            <div className="card-label">MirrorMatcher.sol + Matching Agent</div>
            <h3>Protocol finds the fit — privately</h3>
            <p>The matching agent reads only the public signals from both vaults and computes a compatibility score (0–100). When the score crosses 60, MirrorMatcher.recordMatch() is called on-chain. Both parties are notified. Neither side's identity or sensitive data has been touched.</p>
          </div>

          <hr className="section-divider" />

          {/*  SECTION 4: THE FOUR STAGES  */}
          <div className="section-header">
            <span className="section-num">4.</span>
            <span className="section-title-text">The four revelation stages</span>
          </div>

          <p style={{"fontSize": "14px", "color": "var(--text-secondary)", "lineHeight": "1.75", "marginBottom": "24px"}}>Each stage requires mutual on-chain consent. Neither party can advance a stage alone. The smart contract enforces the order — not the platform, not a human decision.</p>

          <div className="stage-flow" style={{"marginBottom": "24px"}}>
            <div className="stage-item expl-card card-white" style={{"borderColor": "#888", "background": "#f5f3ee"}}>
              <span className="stage-n" style={{"color": "#888"}}>0</span>
              <span className="stage-name" style={{"color": "#555"}}>Sealed</span>
              <span className="stage-cond" style={{"color": "#888"}}>Both register<br />Zero reads allowed</span>
            </div>
            <div className="stage-item expl-card card-gold" style={{"padding": "18px 14px"}}>
              <span className="stage-n" style={{"color": "#c9a84c"}}>1</span>
              <span className="stage-name" style={{"color": "#5c3f0a"}}>Match found</span>
              <span className="stage-cond" style={{"color": "#8a6424"}}>Score ≥ 60<br />No names revealed</span>
            </div>
            <div className="stage-item expl-card card-blue" style={{"padding": "18px 14px"}}>
              <span className="stage-n" style={{"color": "#3a8adf"}}>2</span>
              <span className="stage-name" style={{"color": "#0a3a7a"}}>Thin profile</span>
              <span className="stage-cond" style={{"color": "#1a5aaf"}}>Both confirm<br />Coarse fields only</span>
            </div>
            <div className="stage-item expl-card card-purple" style={{"padding": "18px 14px"}}>
              <span className="stage-n" style={{"color": "#8a6add"}}>3</span>
              <span className="stage-name" style={{"color": "#3a1a7a"}}>Identity reveal</span>
              <span className="stage-cond" style={{"color": "#5a3aad"}}>Both sign NDA<br />Simultaneous</span>
            </div>
            <div className="stage-item expl-card card-green" style={{"padding": "18px 14px"}}>
              <span className="stage-n" style={{"color": "#4a9e5c"}}>4</span>
              <span className="stage-name" style={{"color": "#1a4e24"}}>Full access</span>
              <span className="stage-cond" style={{"color": "#2a6e38"}}>Seller grants<br />All financials</span>
            </div>
          </div>

          <div className="step-list" style={{"marginBottom": "40px"}}>
            <div className="step-item">
              <div className="step-num" style={{"background": "#fdf3dc", "borderColor": "#c9a84c", "color": "#5c3f0a"}}>1</div>
              <div className="step-content">
                <h4>Match found — no data revealed yet</h4>
                <p>Both dashboards show: "A match exists. 87% compatibility." That's all. No names. No company size. No financials. The matching agent found fit from public signals alone.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num" style={{"background": "#edf4fd", "borderColor": "#3a8adf", "color": "#0a3a7a"}}>2</div>
              <div className="step-content">
                <h4>Thin profile — coarse fields only, still no names</h4>
                <p>Both wallets call confirmAdvanceToStage2(). When both confirm, StagedReadCondition upgrades to Stage 2. The counterparty agent can now read: sector, size range, deal type, geography.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num" style={{"background": "#f3effe", "borderColor": "#8a6add", "color": "#3a1a7a"}}>3</div>
              <div className="step-content">
                <h4>Identity revealed — simultaneously, on both screens</h4>
                <p>Both wallets call MirrorNDA.sign(). When both have signed, NDAComplete fires — MirrorMatcher advances to Stage 3 atomically. Both company names appear on both dashboards at the exact same moment. Negotiation Rights NFTs mint to both wallets.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num" style={{"background": "#eef7ee", "borderColor": "#4a9e5c", "color": "#1a4e24"}}>4</div>
              <div className="step-content">
                <h4>Full access — seller's choice, at their pace</h4>
                <p>The sell-side wallet voluntarily calls grantStage4(). The full CDR vault unlocks for the buyer: ARR, revenue, growth rate, churn, target price, price floor, deal notes.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/*  SECTION 5: SMART CONTRACTS  */}
          <div className="section-header">
            <span className="section-num">5.</span>
            <span className="section-title-text">The smart contracts</span>
          </div>

          <div className="card-row card-row-2" style={{"marginBottom": "8px"}}>
            <div className="expl-card card-gold">
              <div className="card-label">Novel CDR pattern · StagedReadCondition.sol</div>
              <h3>The new primitive</h3>
              <p>A CDR read condition that upgrades across 4 stages. Called by validators on every access attempt. Emits zero events on denied reads — no on-chain trace of a failed access.</p>
              <div className="code-block" style={{"marginTop": "12px"}}>
                <code>
                  <span className="code-comment">// Stage 0: nobody reads (sealed)</span>{"\n"}
                  <span className="code-comment">// Stage 1: matching agent only</span>{"\n"}
                  <span className="code-comment">// Stage 2: counterparty agent</span>{"\n"}
                  <span className="code-comment">// Stage 3: counterparty wallet</span>{"\n"}
                  <span className="code-comment">// Stage 4: full financial access</span>{"\n"}
                  <span className="code-key">function</span> <span className="code-val">isReadAllowed</span>({"\n"}
                  {"  "}address caller,{"\n"}
                  {"  "}bytes conditionData{"\n"}
                  ) <span className="code-key">returns</span> (bool allowed)
                </code>
              </div>
            </div>
            <div className="expl-card card-blue">
              <div className="card-label">Coordination · MirrorMatcher.sol</div>
              <h3>Controls all stage transitions</h3>
              <p>Both parties must confirm before any stage advances. Records matches on-chain when agent finds fit. Events emit only matchId and stage number — no company names, no financial data in any on-chain log.</p>
              <div className="code-block" style={{"marginTop": "12px"}}>
                <code>
                  <span className="code-comment">// Agent calls this on match found</span>{"\n"}
                  <span className="code-key">recordMatch</span>(sellUUID, buyUUID, score){"\n"}
                  {"\n"}
                  <span className="code-comment">// Both parties must call to advance</span>{"\n"}
                  <span className="code-key">confirmAdvanceToStage2</span>(matchId){"\n"}
                  {"\n"}
                  <span className="code-comment">// Called by MirrorNDA when both sign</span>{"\n"}
                  <span className="code-key">onNDAComplete</span>(matchId)
                </code>
              </div>
            </div>
          </div>

          <div className="card-row card-row-2" style={{"marginBottom": "40px"}}>
            <div className="expl-card card-purple">
              <div className="card-label">Consent · MirrorNDA.sol</div>
              <h3>Dual-signature NDA</h3>
              <p>Both parties sign independently. When both have signed, NDAComplete fires automatically — calling MirrorMatcher.onNDAComplete() to trigger Stage 3. The reveal is atomic. Permanent, composable, on-chain.</p>
              <div className="code-block" style={{"marginTop": "12px"}}>
                <code>
                  <span className="code-comment">// Any registered party can sign</span>{"\n"}
                  <span className="code-key">sign</span>(matchId){"\n"}
                  {"\n"}
                  <span className="code-comment">// Fires when both parties sign</span>{"\n"}
                  <span className="code-key">event</span> <span className="code-val">NDAComplete</span>(matchId){"\n"}
                  {"\n"}
                  <span className="code-comment">// Auto-calls MirrorMatcher</span>{"\n"}
                  <span className="code-key">onNDAComplete</span>(matchId)
                </code>
              </div>
            </div>
            <div className="expl-card card-green">
              <div className="card-label">Proof-of-Intent · NegotiationRights.sol</div>
              <h3>Soulbound NFT at Stage 3</h3>
              <p>ERC-721 minted to both parties when identities are revealed. Non-transferable by design — this is a cryptographic record of mutual consent, not a financial instrument.</p>
              <div className="code-block" style={{"marginTop": "12px"}}>
                <code>
                  <span className="code-comment">// Mints to both parties at Stage 3</span>{"\n"}
                  <span className="code-key">mint</span>(matchId, sellParty, buyParty){"\n"}
                  {"\n"}
                  <span className="code-comment">// Soulbound — reverts on transfer</span>{"\n"}
                  <span className="code-key">_update</span>() → revert on from ≠ 0{"\n"}
                  {"\n"}
                  <span className="code-comment">// On-chain JSON metadata</span>{"\n"}
                  <span className="code-key">tokenURI</span>(tokenId)
                </code>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          {/*  SECTION 6: FAQ  */}
          <div className="section-header">
            <span className="section-num">6.</span>
            <span className="section-title-text">Frequently asked questions</span>
          </div>

          <div className="faq-list" style={{"marginBottom": "40px"}}>
            <div className="faq-item">
              <div className="faq-q">Can Mirror read my vault contents?</div>
              <div className="faq-a">No. Vault contents are encrypted client-side before transmission using the CDR network's threshold public key. The Mirror platform has no access to private data without the CDR conditions being met on-chain.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">What if no match is ever found?</div>
              <div className="faq-a">Your vault stays sealed forever. Nobody ever knows you registered. The zero-downside mechanic is intentional — sealing a vault costs nothing and exposes nothing.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">What if I change my mind after registering?</div>
              <div className="faq-a">You can withdraw at Stage 1 or Stage 2. Once both parties sign the NDA at Stage 3, the identity reveal is permanent and on-chain.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Is the NDA legally binding?</div>
              <div className="faq-a">The on-chain NDA is a cryptographic record of mutual consent — not a legal document and not legal advice. Whether this has legal standing in your jurisdiction is a question for your lawyer.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">What network is this on?</div>
              <div className="faq-a">Mirror runs on Story Protocol's Aeneid Testnet. Chain ID: 1315. RPC: aeneid.storyrpc.io. CDR is currently testnet-only.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">What makes this technically novel?</div>
              <div className="faq-a">Mirror introduces staged revelation vaults — CDR read conditions that upgrade progressively based on multi-party on-chain consent. Every previous CDR project uses a static read condition. Mirror is the first to make the condition itself dynamic, requiring bilateral consent at each step.</div>
            </div>
          </div>

          {/*  VERDICT  */}
          <div className="verdict-box">
            <h3>The banker is the bug. CDR is the fix.</h3>
            <p>Mirror is not a product built <em>using</em> CDR. It is a product that is <em>only possible</em> because of CDR. The $50B M&A advisory industry exists to solve an information asymmetry problem. CDR is the first technology that solves the same problem without a trusted middleman.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
