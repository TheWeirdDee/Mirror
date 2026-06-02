"use client";

import "./landing.css";
import { MouseEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lock, Package, Settings, FileText, Award, Bot, Database, CircleDot, Eye } from "lucide-react";

const STAGES = [
  { n: "0", col: "#555", label: "Sealed", condition: "Both parties register", detail: "Both vaults are created on Story's Aeneid Testnet via CDR. All sensitive data — company name, revenue, price — is encrypted client-side. The read condition returns false for every caller. No event is emitted on denied reads." },
  { n: "1", col: "#c9a84c", label: "Match Found", condition: "Compatibility score ≥ 60", detail: "The matching agent reads only public signals (sector, stage, deal type) from both vaults and computes a compatibility score. When it crosses 60, MirrorMatcher.recordMatch() is called on-chain. Both wallets receive a notification: a match exists and the compatibility percentage. No names. No details." },
  { n: "2", col: "#4a9eff", label: "Thin Profile", condition: "Both parties confirm interest", detail: "Both wallets call confirmAdvanceToStage2(). When both confirm, the StagedReadCondition upgrades to Stage 2. The counterparty agent can now read coarse fields only: sector, size range, deal type, geography. Company name and financials remain sealed." },
  { n: "3", col: "#a78bfa", label: "Identity Revealed", condition: "Both sign on-chain NDA", detail: "Both wallets call MirrorNDA.sign(). When both have signed, NDAComplete fires atomically — MirrorMatcher advances to Stage 3. Both company names reveal simultaneously on both dashboards. Negotiation Rights NFTs are minted to both wallets." },
  { n: "4", col: "#4caf7d", label: "Full Access", condition: "Seller grants Stage 4", detail: "The sell-side wallet voluntarily calls grantStage4(). The full vault unlocks for the buyer: ARR, revenue, growth rate, churn, target price, floor price, deal notes. The seller decides when they're comfortable sharing financials." },
];

const APPROACH_ITEMS = [
  { n: "01", title: "Both sides seal their intent", body: "Startups upload acquisition intent. Acquirers upload criteria. All sensitive data — company names, revenue, budget — is encrypted client-side and stored in CDR vaults on Story's Aeneid testnet. Nobody can read vault contents without the on-chain conditions being met." },
  { n: "02", title: "The protocol finds the fit", body: "A matching agent reads only public signals — sector, stage, deal type, geography — and scores compatibility. When a score crosses the threshold, a match is recorded on-chain. Both parties are notified. No names. No details. Just: a match exists." },
  { n: "03", title: "Revelation happens in stages", body: "Four stages of increasing disclosure, each requiring mutual on-chain consent. Compatibility first. Thin profiles second. NDA-gated identity reveal third — simultaneous for both parties. Financial details last, at the seller's discretion." },
  { n: "04", title: "Negotiation rights mint on-chain", body: "When identities are revealed at Stage 3, Negotiation Rights NFTs are minted to both wallets. These are permanent, composable on-chain records of mutual acquisition intent. Soulbound. Non-transferable. Proof that both sides consented to engage." },
];

export default function Home() {
  const [activeApproach, setActiveApproach] = useState(0);
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Hero — fires on load, above the fold, opacity fade-in is safe here
      gsap.from(".hero-eyebrow", { y: -20, opacity: 0, duration: 0.7, ease: "power3.out" });
      gsap.from(".hero-title", { y: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.08 });
      gsap.from(".hero-desc, .hero-ctas, .hero-stats", { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.18 });

      // Below-fold — scroll-triggered slide only, no opacity so elements never get stuck invisible
      gsap.from(".problem-card", { y: 28, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform", scrollTrigger: { trigger: ".problem-card", start: "top 85%", once: true } });
      gsap.from(".approach-item", { x: -22, duration: 0.75, ease: "power3.out", stagger: 0.08, clearProps: "transform", scrollTrigger: { trigger: ".approach-item", start: "top 85%", once: true } });
      gsap.from(".stage-row", { y: 26, duration: 0.8, ease: "power3.out", stagger: 0.07, clearProps: "transform", scrollTrigger: { trigger: ".stage-row", start: "top 85%", once: true } });
      gsap.from(".vault-box", { y: 22, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform", scrollTrigger: { trigger: ".vault-box", start: "top 85%", once: true } });
      gsap.from(".cta-card", { y: 28, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform", scrollTrigger: { trigger: ".cta-card", start: "top 85%", once: true } });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="app" ref={pageRef}>
      <div className="grain" />

      {/* HERO */}
      <section
        className="hero"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* LEFT: content */}
        <div className="hero-content">
          <div className="hero-eyebrow">CDR Hackathon · Story Protocol · May 2026</div>
          <h1 className="hero-title">Find your <em>match</em><br />without showing your hand.</h1>
          <p className="hero-subtitle">The trustless M&amp;A matchmaking protocol.</p>
          <p className="hero-desc">
            Both sides seal their acquisition intent into CDR vaults.
            The protocol matches privately. Identities reveal only when both parties consent — simultaneously, on-chain, with no banker in the middle.
          </p>
          <div className="hero-ctas">
            <Link href="/register/sell" className="btn-primary">I&apos;m looking to sell →</Link>
            <Link href="/register/buy" className="btn-secondary">I&apos;m looking to acquire →</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-n">0</span><span className="hero-stat-l">Data exposed</span></div>
            <div className="hero-stat"><span className="hero-stat-n">4</span><span className="hero-stat-l">Revelation stages</span></div>
            <div className="hero-stat"><span className="hero-stat-n">$50B</span><span className="hero-stat-l">Industry disrupted</span></div>
            <div className="hero-stat"><span className="hero-stat-n">0</span><span className="hero-stat-l">Trusted middleman</span></div>
          </div>
        </div>

        <div
          className={`custom-cursor ${isHovered ? "active" : ""}`}
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      </section>

      {/* PROBLEM */}
      <div style={{background:"var(--bg2)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)"}}>
        <div className="section">
          <div className="section-label">01 — The Problem</div>
          <h2 className="section-title">M&A is broken<br />at the <em>signal layer.</em></h2>
          <p className="section-body">Every acquisition deal requires a banker. Not because they're smart. Because nobody can safely go first. The moment either side signals intent, they lose leverage.</p>
          <div className="problem-grid">
            {[
              {n:"01",tag:"Startups Cannot",title:"Signal acquisition interest",body:"Publicly signaling you're open to an exit tanks your valuation, triggers employee panic, alerts competitors, and destroys negotiating leverage. So founders stay silent — even when an exit would be the right move."},
              {n:"02",tag:"Startups Cannot",title:"Share metrics pre-NDA",body:"Any buyer could use your revenue numbers against you in fundraising, with customers, or to poach your team. Without identity established, sharing financials is impossible. Without financials, deals don't start."},
              {n:"03",tag:"Acquirers Cannot",title:"Reveal acquisition criteria",body:"Disclosing what sectors, stages, or price ranges you're targeting inflates valuations across every target in your pipeline simultaneously. Competitors learn your strategy. Shareholders ask uncomfortable questions."},
              {n:"04",tag:"Acquirers Cannot",title:"Approach targets directly",body:"A direct approach from a strategic acquirer is public. It signals intent. It moves markets. It puts the target in a position of power. The informal channel has to stay informal — which means expensive, leaky brokers."},
            ].map(c => (
              <div key={c.n} className="problem-card" data-n={c.n}>
                <div className="problem-card-tag">{c.tag}</div>
                <div className="problem-card-title">{c.title}</div>
                <div className="problem-card-body">{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div>
        <div className="section">
          <div className="section-label">02 — How Mirror Works</div>
          <h2 className="section-title">Four steps.<br /><em>Zero exposure.</em></h2>
          <div className="approach-wrap">
            <div className="approach-list">
              {APPROACH_ITEMS.map((item, i) => (
                <div key={i} className={`approach-item ${activeApproach === i ? "active" : ""}`} onClick={() => setActiveApproach(i)}>
                  <div className="approach-n">{item.n}</div>
                  <div style={{flex:1}}>
                    <div className="approach-item-title">{item.title}</div>
                    <div className="approach-item-body">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="approach-visual">
              <div style={{textAlign:"center"}}>
                <div style={{color:"var(--gold)",marginBottom:"16px",display:"flex",justifyContent:"center"}}>
                  {(() => {
                    const Icon = [Lock, CircleDot, Eye, Award][activeApproach];
                    return <Icon size={48} />;
                  })()}
                </div>
                <div style={{fontFamily:"var(--serif)",fontSize:"24px",color:"var(--cream)",marginBottom:"12px"}}>{APPROACH_ITEMS[activeApproach].title}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--gold)",letterSpacing:"0.1em",marginBottom:"20px"}}>STEP {APPROACH_ITEMS[activeApproach].n}</div>
                <div style={{fontSize:"13px",color:"var(--cream-dim)",lineHeight:"1.75",maxWidth:"280px",margin:"0 auto"}}>{APPROACH_ITEMS[activeApproach].body}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGES */}
      <div style={{background:"var(--bg2)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="section">
          <div className="section-label">03 — Revelation Protocol</div>
          <h2 className="section-title">Four stages of disclosure.<br /><em>Each requiring mutual consent.</em></h2>
          <p className="section-body">No single party can advance a stage. Every transition is a smart contract call that requires both sides to confirm. The protocol enforces the order. Nobody decides — the code does.</p>
          <div className="stages-wrap">
            {STAGES.map((s, i) => (
              <div key={s.n} className="stage-row" onClick={() => setActiveStage(activeStage === i ? null : i)}>
                <div className="stage-n-col">
                  <div className="stage-n-dot" style={{background:s.col,color:"#0c0b09"}}>{s.n}</div>
                </div>
                <div className="stage-main">
                  <div className="stage-main-title">{s.label}</div>
                  <div className="stage-main-cond">{s.condition}</div>
                  <div className={`stage-main-detail${activeStage === i ? " active" : ""}`}>{s.detail}</div>
                </div>
                <div className="stage-detail">
                  <div className="stage-detail-body">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VAULT FLOW */}
      <div className="vault-section">
        <div className="vault-inner">
          <div className="section-label">04 — Protocol Architecture</div>
          <h2 className="section-title">Private data.<br /><em>On-chain composability.</em></h2>
          <p className="section-body" style={{marginBottom:"0"}}>CDR vaults are encrypted objects with programmable access control. Two vaults compose with three contracts. No data is ever exposed outside the TEE without conditions being met on-chain.</p>
          <div className="vault-flow" style={{marginTop:"64px"}}>
            {[
              {icon:<Package size={28} />,title:"Sell Vault",sub:"CDR · Aeneid"},
              null,
              {icon:<Settings size={28} />,title:"MirrorMatcher",sub:"Coordinates stages",center:true},
              null,
              {icon:<Package size={28} />,title:"Buy Vault",sub:"CDR · Aeneid"},
            ].map((b,i) => b ? (
              <div key={i} className={`vault-box ${b.center?"vault-center":""}`}>
                <span className="vault-box-icon">{b.icon}</span>
                <div className="vault-box-title">{b.title}</div>
                <div className="vault-box-sub">{b.sub}</div>
              </div>
            ) : <div key={i} className="vault-arrow">→</div>)}
          </div>
          <div className="vault-grid" style={{marginTop:"2px"}}>
            {[
              {icon:<FileText size={28} />,title:"MirrorNDA.sol",sub:"Dual-sig NDA"},
              {icon:<Award size={28} />,title:"NegotiationRights",sub:"ERC-721 soulbound"},
              {icon:<Bot size={28} />,title:"Matching Agent",sub:"Vercel Cron · 10min"},
              {icon:<Database size={28} />,title:"Supabase",sub:"Public signals only"}
            ].map(b => (
              <div key={b.title} className="vault-box" style={{minWidth:"180px"}}>
                <span className="vault-box-icon">{b.icon}</span>
                <div className="vault-box-title">{b.title}</div>
                <div className="vault-box-sub">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-inner">
          <div className="section-label" style={{justifyContent:"center"}}>Register your vault</div>
          <h2 className="cta-title">Seal your <em>intent.</em></h2>
          <p className="cta-body">Zero downside. Your vault stays sealed forever if no match comes. If it does — you'll know before anyone else. No commitment until you decide.</p>
          <div className="cta-cards">
            <Link href="/register/sell" className="cta-card">
              <div className="cta-card-tag">Sell side</div>
              <div className="cta-card-title">I'm open to an acquisition</div>
              <div className="cta-card-body">Seal your metrics, goals, and price expectations. Stay invisible until the right buyer appears.</div>
            </Link>
            <Link href="/register/buy" className="cta-card">
              <div className="cta-card-tag">Buy side</div>
              <div className="cta-card-title">I'm looking to acquire</div>
              <div className="cta-card-body">Seal your acquisition criteria, budget, and strategic intent. Find fit without signaling to the market.</div>
            </Link>
          </div>
          <Link href="/register/sell" className="btn-primary" style={{width:"100%",padding:"20px",textAlign:"center",display:"block"}}>Register your vault — it's free</Link>
          <p className="cta-note">Built on Story Protocol · Aeneid Testnet · CDR Hackathon 2026</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <Link href="/" className="footer-logo">MIRROR</Link>
        <div className="footer-links">
          <Link href="/docs" className="footer-link">Docs</Link>
          <Link href="/explainer" className="footer-link">Explainer</Link>
          <Link href="/dashboard" className="footer-link">Dashboard</Link>
        </div>
        <div className="footer-right">
          Powered by Story's CDR<br/>
          Aeneid Testnet · Chain 1315
        </div>
      </footer>
    </div>
  );
}
