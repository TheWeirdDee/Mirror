import { useState, useEffect, useRef } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0c0b09; }

:root {
  --gold: #c9a84c;
  --gold-dim: #8a6f2e;
  --gold-bg: rgba(201,168,76,0.07);
  --cream: #f2ede4;
  --cream-dim: rgba(242,237,228,0.55);
  --cream-faint: rgba(242,237,228,0.18);
  --bg: #0c0b09;
  --bg2: #111008;
  --bg3: #181510;
  --surface: rgba(242,237,228,0.04);
  --border: rgba(242,237,228,0.08);
  --border-gold: rgba(201,168,76,0.2);
  --red: #e05a3a;
  --green: #4caf7d;
  --mono: 'DM Mono', monospace;
  --serif: 'Instrument Serif', serif;
  --sans: 'DM Sans', sans-serif;
}

.grain {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  opacity: 0.032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

.app { font-family: var(--sans); color: var(--cream); background: var(--bg); min-height: 100vh; position: relative; }

/* NAV */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 64px;
  background: rgba(12,11,9,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { font-family: var(--serif); font-size: 22px; letter-spacing: 0.12em; color: var(--cream); }
.nav-links { display: flex; align-items: center; gap: 32px; }
.nav-link { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; color: var(--cream-dim); cursor: pointer; text-transform: uppercase; transition: color 0.2s; border: none; background: none; }
.nav-link:hover { color: var(--cream); }
.nav-wallet { font-family: var(--mono); font-size: 11px; letter-spacing: 0.06em; padding: 8px 18px; border: 1px solid var(--border-gold); border-radius: 4px; color: var(--gold); background: var(--gold-bg); cursor: pointer; transition: all 0.2s; }
.nav-wallet:hover { background: rgba(201,168,76,0.14); }
.nav-wallet.connected { color: var(--green); border-color: rgba(76,175,125,0.3); background: rgba(76,175,125,0.07); }

/* HERO */
.hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 120px 48px 80px; position: relative; overflow: hidden;
}
.hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent);
}
.hero-orb {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%, -60%);
  pointer-events: none;
}
.hero-eyebrow {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.35em;
  color: var(--gold); text-transform: uppercase; margin-bottom: 32px;
  display: flex; align-items: center; gap: 12px;
}
.hero-eyebrow::before, .hero-eyebrow::after {
  content: ''; display: block; width: 32px; height: 1px; background: var(--gold-dim);
}
.hero-title {
  font-family: var(--serif); font-size: clamp(64px,9vw,120px);
  line-height: 0.92; text-align: center; margin-bottom: 8px;
  color: var(--cream); letter-spacing: -0.01em;
}
.hero-title em { font-style: italic; color: var(--gold); }
.hero-subtitle {
  font-family: var(--serif); font-style: italic;
  font-size: clamp(20px,3vw,36px); color: var(--cream-dim);
  text-align: center; margin-bottom: 48px; margin-top: 16px;
}
.hero-desc {
  font-family: var(--sans); font-size: 16px; color: var(--cream-dim);
  text-align: center; max-width: 560px; line-height: 1.8; margin-bottom: 56px;
}
.hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 80px; }
.btn-primary {
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 16px 36px;
  background: var(--cream); color: var(--bg); border: none;
  border-radius: 3px; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: var(--gold); }
.btn-secondary {
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 16px 36px;
  background: transparent; color: var(--cream); 
  border: 1px solid var(--border); border-radius: 3px; cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { border-color: var(--cream-dim); }
.hero-stats {
  display: flex; gap: 0; border: 1px solid var(--border);
  border-radius: 6px; overflow: hidden;
}
.hero-stat {
  padding: 20px 36px; text-align: center;
  border-right: 1px solid var(--border);
}
.hero-stat:last-child { border-right: none; }
.hero-stat-n { font-family: var(--serif); font-size: 32px; color: var(--gold); display: block; }
.hero-stat-l { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; color: var(--cream-faint); text-transform: uppercase; margin-top: 4px; display: block; }

/* SCROLL INDICATOR */
.scroll-indicator {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  color: var(--cream-faint); display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.scroll-line { width: 1px; height: 48px; background: linear-gradient(var(--gold-dim), transparent); }

/* SECTION COMMONS */
.section { padding: 120px 48px; position: relative; max-width: 1200px; margin: 0 auto; }
.section-full { padding: 120px 0; position: relative; }
.section-label {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.3em;
  color: var(--gold); text-transform: uppercase; margin-bottom: 20px;
  display: flex; align-items: center; gap: 12px;
}
.section-label::after { content: ''; flex: 1; max-width: 60px; height: 1px; background: var(--gold-dim); }
.section-title { font-family: var(--serif); font-size: clamp(36px,5vw,64px); line-height: 1.05; color: var(--cream); margin-bottom: 20px; }
.section-title em { font-style: italic; color: var(--gold); }
.section-body { font-size: 16px; color: var(--cream-dim); line-height: 1.8; max-width: 580px; }

/* PROBLEM SECTION */
.problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 64px; }
.problem-card {
  padding: 40px; background: var(--surface);
  border: 1px solid var(--border); position: relative; overflow: hidden;
}
.problem-card::before {
  content: attr(data-n); position: absolute; top: -10px; right: 20px;
  font-family: var(--serif); font-size: 120px; color: rgba(242,237,228,0.03);
  line-height: 1; pointer-events: none;
}
.problem-card-tag { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; color: var(--red); text-transform: uppercase; margin-bottom: 16px; }
.problem-card-title { font-family: var(--serif); font-size: 22px; color: var(--cream); margin-bottom: 12px; }
.problem-card-body { font-size: 14px; color: var(--cream-dim); line-height: 1.75; }
.problem-bottom { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 2px; }
.stat-card { padding: 32px 40px; background: var(--surface); border: 1px solid var(--border); text-align: center; }
.stat-card-n { font-family: var(--serif); font-size: 48px; color: var(--gold); display: block; margin-bottom: 8px; }
.stat-card-l { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; color: var(--cream-faint); text-transform: uppercase; }

/* APPROACH */
.approach-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; margin-top: 64px; }
.approach-list { display: flex; flex-direction: column; gap: 0; }
.approach-item {
  padding: 28px 0; border-bottom: 1px solid var(--border);
  display: flex; gap: 20px; align-items: flex-start; cursor: pointer;
  transition: all 0.2s;
}
.approach-item:first-child { border-top: 1px solid var(--border); }
.approach-item.active { background: none; }
.approach-n { font-family: var(--mono); font-size: 11px; color: var(--gold); min-width: 24px; margin-top: 4px; }
.approach-item-title { font-family: var(--serif); font-size: 20px; color: var(--cream-dim); margin-bottom: 0; transition: color 0.2s; }
.approach-item.active .approach-item-title { color: var(--cream); }
.approach-item-body { font-size: 13px; color: var(--cream-dim); line-height: 1.7; max-height: 0; overflow: hidden; transition: max-height 0.4s ease, margin-top 0.3s; }
.approach-item.active .approach-item-body { max-height: 200px; margin-top: 10px; }
.approach-visual {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 40px; min-height: 360px;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px;
}

/* STAGES */
.stages-wrap { margin-top: 64px; }
.stage-row {
  display: grid; grid-template-columns: 80px 1fr 1fr; gap: 0;
  border-bottom: 1px solid var(--border); align-items: stretch;
  transition: background 0.2s; cursor: pointer;
}
.stage-row:first-child { border-top: 1px solid var(--border); }
.stage-row:hover { background: var(--surface); }
.stage-n-col {
  padding: 32px 24px; display: flex; align-items: center; justify-content: center;
  border-right: 1px solid var(--border);
}
.stage-n-dot {
  width: 36px; height: 36px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 13px; font-weight: 500;
}
.stage-main { padding: 32px 40px; border-right: 1px solid var(--border); }
.stage-main-title { font-family: var(--serif); font-size: 20px; color: var(--cream); margin-bottom: 6px; }
.stage-main-cond { font-family: var(--mono); font-size: 11px; color: var(--gold); letter-spacing: 0.06em; }
.stage-detail { padding: 32px 40px; }
.stage-detail-body { font-size: 13px; color: var(--cream-dim); line-height: 1.75; }

/* TECH */
.tech-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2px; margin-top: 64px; }
.tech-card { padding: 36px 40px; background: var(--surface); border: 1px solid var(--border); }
.tech-card-tag { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
.tech-card-title { font-family: var(--serif); font-size: 20px; color: var(--cream); margin-bottom: 12px; }
.tech-card-body { font-size: 13px; color: var(--cream-dim); line-height: 1.7; margin-bottom: 20px; }
.tech-card-funcs { border-top: 1px solid var(--border); padding-top: 16px; }
.tech-func { font-family: var(--mono); font-size: 11px; color: var(--cream-faint); margin-bottom: 5px; }

/* WHY CDR */
.cdr-split { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 64px; }
.cdr-col { padding: 48px 40px; background: var(--surface); border: 1px solid var(--border); }
.cdr-col-title { font-family: var(--mono); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 28px; }
.cdr-row { display: flex; gap: 14px; margin-bottom: 20px; align-items: flex-start; }
.cdr-icon { font-size: 16px; margin-top: 2px; flex-shrink: 0; }
.cdr-row-title { font-size: 14px; color: var(--cream); font-weight: 500; margin-bottom: 4px; }
.cdr-row-body { font-size: 12px; color: var(--cream-dim); line-height: 1.6; }

/* VAULT VISUAL */
.vault-section { padding: 120px 48px; background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.vault-inner { max-width: 1200px; margin: 0 auto; }
.vault-flow { display: flex; align-items: center; justify-content: center; gap: 0; margin-top: 64px; flex-wrap: wrap; }
.vault-box {
  padding: 28px 32px; text-align: center; min-width: 160px;
  background: var(--surface); border: 1px solid var(--border); position: relative;
}
.vault-box-icon { font-size: 28px; margin-bottom: 10px; display: block; }
.vault-box-title { font-family: var(--serif); font-size: 16px; color: var(--cream); margin-bottom: 4px; }
.vault-box-sub { font-family: var(--mono); font-size: 10px; color: var(--cream-faint); letter-spacing: 0.08em; }
.vault-arrow { font-family: var(--mono); font-size: 18px; color: var(--gold-dim); padding: 0 8px; }
.vault-center { border-color: var(--gold-dim); background: rgba(201,168,76,0.06); }
.vault-center .vault-box-title { color: var(--gold); }

/* CTA SECTION */
.cta-section {
  padding: 120px 48px; text-align: center;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.06), transparent);
}
.cta-inner { max-width: 680px; margin: 0 auto; }
.cta-title { font-family: var(--serif); font-size: clamp(40px,6vw,80px); color: var(--cream); margin-bottom: 20px; line-height: 1; }
.cta-title em { color: var(--gold); font-style: italic; }
.cta-body { font-size: 16px; color: var(--cream-dim); line-height: 1.8; margin-bottom: 48px; max-width: 480px; margin-left: auto; margin-right: auto; }
.cta-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 48px; text-align: left; }
.cta-card { padding: 28px 32px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.cta-card:hover { border-color: var(--gold-dim); background: var(--gold-bg); }
.cta-card-tag { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; color: var(--gold); text-transform: uppercase; margin-bottom: 10px; }
.cta-card-title { font-family: var(--serif); font-size: 20px; color: var(--cream); margin-bottom: 8px; }
.cta-card-body { font-size: 13px; color: var(--cream-dim); line-height: 1.65; }
.cta-note { font-family: var(--mono); font-size: 11px; color: var(--cream-faint); letter-spacing: 0.08em; margin-top: 24px; }

/* FOOTER */
.footer { padding: 48px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.footer-logo { font-family: var(--serif); font-size: 18px; letter-spacing: 0.1em; color: var(--cream-dim); }
.footer-links { display: flex; gap: 24px; }
.footer-link { font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; color: var(--cream-faint); text-transform: uppercase; cursor: pointer; }
.footer-link:hover { color: var(--cream-dim); }
.footer-right { font-family: var(--mono); font-size: 10px; color: var(--cream-faint); text-align: right; line-height: 1.6; }

/* CONNECTED STATE */
.wallet-banner {
  background: rgba(76,175,125,0.07); border-bottom: 1px solid rgba(76,175,125,0.15);
  padding: 10px 48px; display: flex; align-items: center; justify-content: space-between;
  font-family: var(--mono); font-size: 11px; color: var(--green); letter-spacing: 0.06em;
}
.wallet-banner-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; display: inline-block; margin-right: 8px; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }

/* DIVIDER */
.hr { border: none; border-top: 1px solid var(--border); }

@media (max-width: 768px) {
  .nav { padding: 0 20px; }
  .section, .vault-section, .cta-section { padding: 80px 20px; }
  .hero { padding: 100px 20px 60px; }
  .problem-grid, .approach-wrap, .tech-grid, .cdr-split, .cta-cards { grid-template-columns: 1fr; }
  .stage-row { grid-template-columns: 48px 1fr; }
  .stage-detail { display: none; }
  .vault-flow { flex-direction: column; }
  .vault-arrow { transform: rotate(90deg); }
  .footer { flex-direction: column; gap: 24px; text-align: center; }
  .hero-stats { flex-direction: column; }
  .hero-stat { border-right: none; border-bottom: 1px solid var(--border); }
  .problem-bottom { grid-template-columns: 1fr; }
}
`;

const STAGES = [
  { n: "0", col: "#555", label: "Sealed", condition: "Both parties register", detail: "Both vaults are created on Story's Aeneid Testnet via CDR. All sensitive data — company name, revenue, price — is encrypted before it leaves your browser. The read condition returns false for every caller. No event is emitted on denied reads. Zero on-chain trace of the sealed contents." },
  { n: "1", col: "#c9a84c", label: "Match Found", condition: "Compatibility score ≥ 60", detail: "The matching agent reads only public signals (sector, stage, deal type) from both vaults and computes a compatibility score. When it crosses 60, MirrorMatcher.recordMatch() is called on-chain. Both wallets receive a notification: a match exists and the compatibility percentage. No names. No details. Match expires in 7 days with no action." },
  { n: "2", col: "#4a9eff", label: "Thin Profile", condition: "Both parties confirm interest", detail: "Both wallets call confirmAdvanceToStage2(). When both confirm, the StagedReadCondition upgrades to Stage 2. The counterparty agent can now read coarse fields only: sector, size range, deal type, geography. Company name and financials remain sealed. Neither party has committed to anything yet." },
  { n: "3", col: "#a78bfa", label: "Identity Revealed", condition: "Both sign on-chain NDA", detail: "Both wallets call MirrorNDA.sign(). When both have signed, NDAComplete fires atomically — MirrorMatcher advances to Stage 3. Both company names reveal simultaneously on both dashboards. Neither side saw the other's identity first. Negotiation Rights NFTs are minted to both wallets as permanent on-chain proof of mutual intent." },
  { n: "4", col: "#4caf7d", label: "Full Access", condition: "Seller grants Stage 4", detail: "The sell-side wallet voluntarily calls grantStage4(). The full vault unlocks for the buyer: ARR, revenue, growth rate, churn, target price, floor price, deal notes. This stage is optional and owner-controlled. The seller decides when they're comfortable sharing financials. Both parties now hold Negotiation Rights NFTs and can begin direct conversation." },
];

const APPROACH_ITEMS = [
  { n: "01", title: "Both sides seal their intent", body: "Startups upload acquisition intent. Acquirers upload criteria. All sensitive data — company names, revenue, budget — is encrypted client-side and stored in CDR vaults on Story's Aeneid testnet. Nobody, not even the Mirror platform, can read vault contents without the on-chain conditions being met." },
  { n: "02", title: "The protocol finds the fit", body: "A matching agent reads only public signals — sector, stage, deal type, geography — and scores compatibility. Deep matching runs inside the TEE. When a score crosses the threshold, a match is recorded on-chain. Both parties are notified. No names. No details. Just: a match exists." },
  { n: "03", title: "Revelation happens in stages", body: "Four stages of increasing disclosure, each requiring mutual on-chain consent. Compatibility first. Thin profiles second. NDA-gated identity reveal third — simultaneous for both parties. Financial details last, at the seller's discretion. Every stage transition is a smart contract call, not a platform decision." },
  { n: "04", title: "Negotiation rights mint on-chain", body: "When identities are revealed at Stage 3, Negotiation Rights NFTs are minted to both wallets. These are permanent, composable on-chain records of mutual acquisition intent. Soulbound. Non-transferable. Proof that both sides consented to engage — before any human knew who the other was." },
];

const TECH_CARDS = [
  { color: "#c9a84c", tag: "Core Condition Contract", title: "StagedReadCondition.sol", body: "CDR read condition that upgrades across 4 stages. Called by validators on every access attempt. Emits zero events on denied reads — no on-chain trace of failed access attempts. Only MirrorMatcher can upgrade stages. This is Mirror's primary technical contribution to the CDR ecosystem.", funcs: ["isReadAllowed(caller, conditionData) → bool", "upgradeStage(uuid, newStage)", "sealVault(uuid) — on expiry", "registerVault(uuid, owner)"] },
  { color: "#4a9eff", tag: "Coordination Contract", title: "MirrorMatcher.sol", body: "Core contract controlling all stage transitions. Both parties must confirm before any stage advances. Records matches on-chain when agent finds fit. Receives NDA completion signal from MirrorNDA. Events contain only matchId and stage number — no company names, no financial data, nothing sensitive.", funcs: ["recordMatch(sellUUID, buyUUID, score)", "confirmAdvanceToStage2(matchId)", "onNDAComplete(matchId) ← from NDA", "grantStage4(matchId) — sell side only"] },
  { color: "#a78bfa", tag: "Consent Contract", title: "MirrorNDA.sol", body: "On-chain mutual NDA enforcing dual-signature requirement. Both parties sign independently. When both have signed, NDAComplete fires automatically — calling MirrorMatcher.onNDAComplete() to trigger Stage 3. The reveal is atomic. Neither party sees the other's name until both have signed.", funcs: ["sign(matchId) — any registered party", "NDAComplete event fires when both sign", "Calls MirrorMatcher.onNDAComplete()", "isSigned(matchId) → bool"] },
  { color: "#4caf7d", tag: "Proof-of-Intent NFT", title: "NegotiationRights.sol", body: "ERC-721 soulbound NFT minted to both parties at Stage 3. Non-transferable by design — this is a record of mutual consent, not a financial instrument. Token metadata stores matchId, timestamp, and counterparty address. Composable: other protocols can read this as proof of intent.", funcs: ["mint(matchId, sellParty, buyParty)", "_update reverts on transfer (soulbound)", "tokenURI returns on-chain JSON metadata", "getMatchTokens(matchId) → tokenIds"] },
];

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [activeApproach, setActiveApproach] = useState(0);
  const [activeStage, setActiveStage] = useState(null);
  const [page, setPage] = useState("home");

  const connectWallet = () => {
    if (wallet) { setWallet(null); return; }
    setWallet("0x8C62...F90e");
  };

  if (page === "sell") return <RegisterPage type="sell" wallet={wallet} connectWallet={connectWallet} onBack={() => setPage("home")} />;
  if (page === "buy") return <RegisterPage type="buy" wallet={wallet} connectWallet={connectWallet} onBack={() => setPage("home")} />;
  if (page === "dashboard") return <DashboardPage wallet={wallet} connectWallet={connectWallet} onBack={() => setPage("home")} />;
  if (page === "docs") return <DocsPage wallet={wallet} connectWallet={connectWallet} onBack={() => setPage("home")} />;

  return (
    <div className="app">
      <style>{FONT}{css}</style>
      <div className="grain" />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("home")} style={{cursor:"pointer"}}>MIRROR</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => setPage("docs")}>Docs</button>
          <button className="nav-link" onClick={() => setPage("dashboard")}>Dashboard</button>
          <button className={`nav-wallet ${wallet ? "connected" : ""}`} onClick={connectWallet}>
            {wallet ? `● ${wallet}` : "Connect Wallet"}
          </button>
        </div>
      </nav>

      {/* WALLET BANNER */}
      {wallet && (
        <div className="wallet-banner" style={{marginTop:"64px"}}>
          <span><span className="wallet-banner-dot"/>Connected to Story Aeneid Testnet · {wallet}</span>
          <span>25 IP · Ready to register</span>
        </div>
      )}

      {/* HERO */}
      <section className="hero" style={wallet ? {paddingTop:"80px"} : {}}>
        <div className="hero-grid" />
        <div className="hero-orb" />
        <div className="hero-eyebrow">CDR Hackathon · Story Protocol · May 2026</div>
        <h1 className="hero-title">Find your <em>match</em><br />without showing<br />your hand.</h1>
        <p className="hero-subtitle">The trustless M&A matchmaking protocol.</p>
        <p className="hero-desc">
          Both sides seal their acquisition intent into CDR vaults.
          The protocol matches privately. Identities reveal only when both parties consent — simultaneously, on-chain, with no banker in the middle.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => setPage("sell")}>I'm looking to sell →</button>
          <button className="btn-secondary" onClick={() => setPage("buy")}>I'm looking to acquire →</button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><span className="hero-stat-n">0</span><span className="hero-stat-l">Data exposed</span></div>
          <div className="hero-stat"><span className="hero-stat-n">4</span><span className="hero-stat-l">Revelation stages</span></div>
          <div className="hero-stat"><span className="hero-stat-n">$50B</span><span className="hero-stat-l">Industry disrupted</span></div>
          <div className="hero-stat"><span className="hero-stat-n">∅</span><span className="hero-stat-l">Trusted middleman</span></div>
        </div>
        <div className="scroll-indicator"><div className="scroll-line"/><span>SCROLL</span></div>
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
          <div className="problem-bottom">
            {[["$3.4T","Global M&A volume annually"],["2–5%","Advisory fee per deal"],["$50B+","Paid to bankers every year"]].map(([n,l]) => (
              <div key={n} className="stat-card">
                <span className="stat-card-n">{n}</span>
                <span className="stat-card-l">{l}</span>
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
                <div style={{fontFamily:"var(--serif)",fontSize:"64px",color:"var(--gold)",marginBottom:"16px"}}>
                  {["🔒","◎","◉","⬡"][activeApproach]}
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
                  {activeStage === i && <div style={{fontSize:"13px",color:"var(--cream-dim)",lineHeight:"1.75",marginTop:"12px"}}>{s.detail}</div>}
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
              {icon:"📦",title:"Sell Vault",sub:"CDR · Aeneid"},
              null,
              {icon:"⚙️",title:"MirrorMatcher",sub:"Coordinates stages",center:true},
              null,
              {icon:"📦",title:"Buy Vault",sub:"CDR · Aeneid"},
            ].map((b,i) => b ? (
              <div key={i} className={`vault-box ${b.center?"vault-center":""}`}>
                <span className="vault-box-icon">{b.icon}</span>
                <div className="vault-box-title">{b.title}</div>
                <div className="vault-box-sub">{b.sub}</div>
              </div>
            ) : <div key={i} className="vault-arrow">→</div>)}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:"0",marginTop:"2px",flexWrap:"wrap"}}>
            {[{icon:"📜",title:"MirrorNDA.sol",sub:"Dual-sig NDA"},{icon:"🏆",title:"NegotiationRights",sub:"ERC-721 soulbound"},{icon:"🤖",title:"Matching Agent",sub:"Vercel Cron · 10min"},{icon:"🗄️",title:"Supabase",sub:"Public signals only"}].map(b => (
              <div key={b.title} className="vault-box" style={{minWidth:"180px"}}>
                <span className="vault-box-icon">{b.icon}</span>
                <div className="vault-box-title">{b.title}</div>
                <div className="vault-box-sub">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TECH */}
      <div>
        <div className="section">
          <div className="section-label">05 — Smart Contracts</div>
          <h2 className="section-title">Four contracts.<br /><em>One new CDR primitive.</em></h2>
          <div className="tech-grid">
            {TECH_CARDS.map(c => (
              <div key={c.title} className="tech-card">
                <div className="tech-card-tag" style={{color:c.color}}>{c.tag}</div>
                <div className="tech-card-title">{c.title}</div>
                <div className="tech-card-body">{c.body}</div>
                <div className="tech-card-funcs">
                  {c.funcs.map(f => <div key={f} className="tech-func">→ {f}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY CDR */}
      <div style={{background:"var(--bg2)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div className="section">
          <div className="section-label">06 — Why CDR</div>
          <h2 className="section-title">The only technology<br />that makes this <em>possible.</em></h2>
          <div className="cdr-split">
            <div className="cdr-col">
              <div className="cdr-col-title" style={{color:"var(--red)"}}>✗ &nbsp;Every alternative fails</div>
              {[
                {icon:"✗",title:"Centralized server",body:"Platform operator sees everything. Becomes the banker. Can be subpoenaed. One data breach exposes every deal."},
                {icon:"✗",title:"Fully offchain storage",body:"Private but loses composability. Smart contracts can't reference it. Conditions can't be enforced on-chain."},
                {icon:"✗",title:"FHE (Homomorphic)",body:"Theoretically ideal but 1000x too slow for real applications. Not production-ready for complex matching logic."},
                {icon:"✗",title:"Trusted oracle",body:"Requires trusting a company or individual. That trust can be violated, coerced, or simply fail. The banker problem restated."},
              ].map(r => (
                <div key={r.title} className="cdr-row">
                  <div className="cdr-icon" style={{color:"var(--red)"}}>{r.icon}</div>
                  <div><div className="cdr-row-title">{r.title}</div><div className="cdr-row-body">{r.body}</div></div>
                </div>
              ))}
            </div>
            <div className="cdr-col" style={{background:"rgba(201,168,76,0.04)",borderColor:"var(--border-gold)"}}>
              <div className="cdr-col-title" style={{color:"var(--gold)"}}>✓ &nbsp;CDR delivers all three</div>
              {[
                {icon:"✓",title:"TEE-backed privacy",body:"Trusted Execution Environments are physically sealed hardware. Code runs inside. Nobody — not validators, not the operator, not a subpoena — can read vault contents without the on-chain condition being met."},
                {icon:"✓",title:"On-chain composability",body:"Vaults are on-chain objects with addresses. Smart contracts interact with them. The matching logic, NDA enforcement, and NFT minting all compose without any data exposure."},
                {icon:"✓",title:"Trustless enforcement",body:"No company, individual, or platform is trusted. Conditions are enforced by the protocol. Mirror cannot open your vault. Validators cannot open your vault. Only the conditions can."},
                {icon:"✓",title:"New permission patterns",body:"Mirror introduces staged revelation — CDR read conditions that upgrade progressively based on multi-party on-chain consent. This pattern didn't exist before. It's Mirror's contribution to the ecosystem."},
              ].map(r => (
                <div key={r.title} className="cdr-row">
                  <div className="cdr-icon" style={{color:"var(--gold)"}}>{r.icon}</div>
                  <div><div className="cdr-row-title">{r.title}</div><div className="cdr-row-body">{r.body}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-inner">
          <div className="section-label" style={{justifyContent:"center"}}>Register your vault</div>
          <h2 className="cta-title">Seal your<br /><em>intent.</em></h2>
          <p className="cta-body">Zero downside. Your vault stays sealed forever if no match comes. If it does — you'll know before anyone else. No commitment until you decide.</p>
          <div className="cta-cards">
            <div className="cta-card" onClick={() => setPage("sell")}>
              <div className="cta-card-tag">Sell side</div>
              <div className="cta-card-title">I'm open to an acquisition</div>
              <div className="cta-card-body">Seal your metrics, goals, and price expectations. Stay invisible until the right buyer appears.</div>
            </div>
            <div className="cta-card" onClick={() => setPage("buy")}>
              <div className="cta-card-tag">Buy side</div>
              <div className="cta-card-title">I'm looking to acquire</div>
              <div className="cta-card-body">Seal your acquisition criteria, budget, and strategic intent. Find fit without signaling to the market.</div>
            </div>
          </div>
          <button className="btn-primary" style={{width:"100%",padding:"20px"}}>Register your vault — it's free</button>
          <p className="cta-note">Built on Story Protocol · Aeneid Testnet · CDR Hackathon 2026</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">MIRROR</div>
        <div className="footer-links">
          <span className="footer-link" onClick={()=>setPage("docs")}>Docs</span>
          <span className="footer-link" onClick={()=>setPage("dashboard")}>Dashboard</span>
          <span className="footer-link">GitHub</span>
          <span className="footer-link">Discord</span>
        </div>
        <div className="footer-right">
          Powered by Story's CDR<br/>
          Aeneid Testnet · Chain 1315
        </div>
      </footer>
    </div>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────
function RegisterPage({ type, wallet, connectWallet, onBack }) {
  const [step, setStep] = useState(wallet ? 1 : 0);
  const [form, setForm] = useState({});
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);

  useEffect(() => { if (wallet && step === 0) setStep(1); }, [wallet]);

  const isSell = type === "sell";

  const handleSeal = () => {
    setSealing(true);
    setTimeout(() => { setSealing(false); setSealed(true); }, 2800);
  };

  return (
    <div className="app">
      <style>{FONT}{css}</style>
      <div className="grain" />
      <nav className="nav">
        <div className="nav-logo" onClick={onBack} style={{cursor:"pointer"}}>MIRROR</div>
        <div className="nav-links">
          <button className="nav-link" onClick={onBack}>← Back</button>
          <button className={`nav-wallet ${wallet ? "connected" : ""}`} onClick={connectWallet}>{wallet ? `● ${wallet}` : "Connect Wallet"}</button>
        </div>
      </nav>
      {wallet && <div className="wallet-banner" style={{marginTop:"64px"}}><span><span className="wallet-banner-dot"/>Connected · {wallet} · 25 IP</span><span>Story Aeneid Testnet · Chain 1315</span></div>}

      <div style={{maxWidth:"720px",margin:"0 auto",padding:wallet?"80px 40px 80px":"120px 40px 80px"}}>
        {/* Progress */}
        <div style={{display:"flex",gap:"8px",marginBottom:"48px"}}>
          {["Connect","Public Signals","Private Details","Seal Vault"].map((l,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",gap:"6px"}}>
              <div style={{height:"2px",background:step>i?"var(--gold)":step===i?"var(--gold)":"var(--border)",transition:"background 0.3s"}}/>
              <div style={{fontFamily:"var(--mono)",fontSize:"9px",letterSpacing:"0.1em",color:step>=i?"var(--gold)":"var(--cream-faint)",textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Steps */}
        {step === 0 && (
          <div>
            <div style={{fontFamily:"var(--serif)",fontSize:"40px",color:"var(--cream)",marginBottom:"16px"}}>Connect your wallet</div>
            <p style={{color:"var(--cream-dim)",lineHeight:"1.8",marginBottom:"40px"}}>Your vault is sealed to your wallet address. Only you can advance the reveal process. Connect to Story's Aeneid Testnet to continue.</p>
            <div style={{padding:"28px",background:"var(--surface)",border:"1px solid var(--border-gold)",borderRadius:"6px",marginBottom:"24px"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--gold)",letterSpacing:"0.15em",marginBottom:"12px"}}>NETWORK REQUIRED</div>
              <div style={{fontSize:"14px",color:"var(--cream-dim)",lineHeight:"1.7"}}>Story Aeneid Testnet · Chain ID: 1315<br/>RPC: https://aeneid.storyrpc.io</div>
            </div>
            <button className="btn-primary" style={{width:"100%",padding:"18px"}} onClick={connectWallet}>Connect Wallet</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{fontFamily:"var(--serif)",fontSize:"40px",color:"var(--cream)",marginBottom:"8px"}}>{isSell ? "Your public signals" : "Your acquisition criteria"}</div>
            <p style={{color:"var(--cream-dim)",lineHeight:"1.8",marginBottom:"40px"}}>These fields are visible to the matching agent only — never to any human until you consent to Stage 2.</p>
            <div style={{display:"flex",flexDirection:"column",gap:"16px",marginBottom:"40px"}}>
              {(isSell ? [
                {label:"Company Sector",key:"sector",placeholder:"e.g. B2B SaaS"},
                {label:"Company Stage",key:"stage",placeholder:"e.g. Series A"},
                {label:"Deal Type",key:"dealType",placeholder:"e.g. Acquisition, Acquihire"},
                {label:"Size Range",key:"size",placeholder:"e.g. $10M–$50M"},
                {label:"Geography Preference",key:"geo",placeholder:"e.g. US / Remote"},
              ] : [
                {label:"Acquirer Type",key:"acquirerType",placeholder:"e.g. Strategic, PE"},
                {label:"Target Sectors",key:"sectors",placeholder:"e.g. B2B SaaS, Data"},
                {label:"Target Stages",key:"stages",placeholder:"e.g. Series A, Series B"},
                {label:"Budget Range",key:"budget",placeholder:"e.g. $10M–$50M"},
                {label:"Target Geographies",key:"geos",placeholder:"e.g. US, Remote"},
              ]).map(f=>(
                <div key={f.key}>
                  <label style={{display:"block",fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.12em",color:"var(--gold)",textTransform:"uppercase",marginBottom:"8px"}}>{f.label}</label>
                  <input value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} style={{width:"100%",padding:"12px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px",color:"var(--cream)",fontFamily:"var(--mono)",fontSize:"13px",outline:"none"}}/>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{width:"100%",padding:"18px"}} onClick={()=>setStep(2)}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{fontFamily:"var(--serif)",fontSize:"40px",color:"var(--cream)",marginBottom:"8px"}}>Your sealed vault contents</div>
            <p style={{color:"var(--cream-dim)",lineHeight:"1.8",marginBottom:"16px"}}>This data never leaves your encrypted vault. Not us. Not validators. Not anyone — until you decide.</p>
            <div style={{padding:"12px 16px",background:"rgba(201,168,76,0.06)",border:"1px solid var(--border-gold)",borderRadius:"4px",marginBottom:"32px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--gold)",letterSpacing:"0.06em"}}>
              🔒 Encrypted client-side before transmission · TEE-backed storage · Zero platform access
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"16px",marginBottom:"40px"}}>
              {(isSell ? [
                {label:"Company Name",key:"name",placeholder:"Your company name"},
                {label:"Annual Revenue (USD)",key:"revenue",placeholder:"e.g. 2800000"},
                {label:"ARR",key:"arr",placeholder:"e.g. 3200000"},
                {label:"Team Size",key:"team",placeholder:"e.g. 18"},
                {label:"Target Acquisition Price (USD)",key:"price",placeholder:"e.g. 18000000"},
                {label:"Price Floor (USD)",key:"floor",placeholder:"e.g. 14000000"},
                {label:"Deal Notes",key:"notes",placeholder:"What you're looking for in a buyer...",multiline:true},
              ] : [
                {label:"Company / Fund Name",key:"name",placeholder:"Your company or fund name"},
                {label:"Budget Min (USD)",key:"min",placeholder:"e.g. 12000000"},
                {label:"Budget Max (USD)",key:"max",placeholder:"e.g. 25000000"},
                {label:"Strategic Rationale",key:"rationale",placeholder:"Why are you acquiring?",multiline:true},
                {label:"Must-Haves",key:"musts",placeholder:"Non-negotiable requirements"},
                {label:"Deal Breakers",key:"breakers",placeholder:"Reasons you'd walk away"},
              ]).map(f=>(
                <div key={f.key}>
                  <label style={{display:"block",fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.12em",color:"var(--gold)",textTransform:"uppercase",marginBottom:"8px"}}>{f.label}</label>
                  {f.multiline ? (
                    <textarea value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} rows={3} style={{width:"100%",padding:"12px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px",color:"var(--cream)",fontFamily:"var(--mono)",fontSize:"13px",outline:"none",resize:"vertical"}}/>
                  ) : (
                    <input value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder} style={{width:"100%",padding:"12px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px",color:"var(--cream)",fontFamily:"var(--mono)",fontSize:"13px",outline:"none"}}/>
                  )}
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"12px"}}>
              <button className="btn-secondary" style={{flex:1,padding:"18px"}} onClick={()=>setStep(1)}>← Back</button>
              <button className="btn-primary" style={{flex:2,padding:"18px"}} onClick={()=>setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && !sealed && (
          <div>
            <div style={{fontFamily:"var(--serif)",fontSize:"40px",color:"var(--cream)",marginBottom:"8px"}}>Seal your vault</div>
            <p style={{color:"var(--cream-dim)",lineHeight:"1.8",marginBottom:"40px"}}>Your vault will be created on Story's Aeneid Testnet. The private data will be encrypted before it leaves your browser and stored in a TEE-backed CDR vault. Only you can advance the revelation process.</p>
            <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"40px"}}>
              {[
                ["Wallet",wallet],
                ["Network","Story Aeneid Testnet · Chain 1315"],
                ["Vault type",isSell?"Sell-side":"Buy-side"],
                ["Write condition","Owner-only (your wallet)"],
                ["Read condition","Stage 0 — sealed (no access)"],
                ["Data exposure","Zero — encrypted before transmission"],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px"}}>
                  <span style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--cream-faint)",letterSpacing:"0.08em",textTransform:"uppercase"}}>{k}</span>
                  <span style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--cream)"}}>{v}</span>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{width:"100%",padding:"20px",fontSize:"13px",letterSpacing:"0.12em"}} onClick={handleSeal} disabled={sealing}>
              {sealing ? "Sealing vault on-chain..." : "Seal vault → Sign with wallet"}
            </button>
            {sealing && <div style={{marginTop:"16px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--gold)",textAlign:"center",letterSpacing:"0.08em"}}>Creating CDR vault on Aeneid testnet...</div>}
          </div>
        )}

        {sealed && (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"64px",marginBottom:"24px"}}>🔒</div>
            <div style={{fontFamily:"var(--serif)",fontSize:"40px",color:"var(--cream)",marginBottom:"16px"}}>Vault sealed.</div>
            <div style={{padding:"16px 20px",background:"rgba(76,175,125,0.08)",border:"1px solid rgba(76,175,125,0.2)",borderRadius:"6px",marginBottom:"32px"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--green)",letterSpacing:"0.12em",marginBottom:"8px"}}>VAULT CREATED ON AENEID TESTNET</div>
              <div style={{fontFamily:"var(--mono)",fontSize:"12px",color:"var(--cream)"}}>0xd1ea...0000 · Stage 0 · Sealed</div>
            </div>
            <p style={{color:"var(--cream-dim)",lineHeight:"1.8",marginBottom:"40px",maxWidth:"480px",margin:"0 auto 40px"}}>Your intent is now encrypted on Story's Aeneid testnet. The matching agent runs every 10 minutes. If a match is found, you'll see it in your dashboard. If no match comes, your vault stays sealed forever — nobody ever knows you registered.</p>
            <button className="btn-primary" style={{padding:"18px 40px"}} onClick={onBack}>View Dashboard →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────
function DashboardPage({ wallet, connectWallet, onBack }) {
  const [demoStage, setDemoStage] = useState(1);

  return (
    <div className="app">
      <style>{FONT}{css}</style>
      <div className="grain"/>
      <nav className="nav">
        <div className="nav-logo" onClick={onBack} style={{cursor:"pointer"}}>MIRROR</div>
        <div className="nav-links">
          <button className="nav-link" onClick={onBack}>← Home</button>
          <button className={`nav-wallet ${wallet?"connected":""}`} onClick={connectWallet}>{wallet?`● ${wallet}`:"Connect Wallet"}</button>
        </div>
      </nav>
      {wallet && <div className="wallet-banner" style={{marginTop:"64px"}}><span><span className="wallet-banner-dot"/>Connected · {wallet} · 25 IP</span><span>Story Aeneid · Chain 1315</span></div>}

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"100px 40px 80px"}}>
        {!wallet ? (
          <div style={{textAlign:"center",padding:"80px 0"}}>
            <div style={{fontFamily:"var(--serif)",fontSize:"48px",color:"var(--cream)",marginBottom:"20px"}}>Your vault dashboard</div>
            <p style={{color:"var(--cream-dim)",marginBottom:"40px",lineHeight:"1.8"}}>Connect your wallet to view your sealed vault and match status.</p>
            <button className="btn-primary" style={{padding:"18px 40px"}} onClick={connectWallet}>Connect Wallet</button>
          </div>
        ) : (
          <div>
            <div style={{fontFamily:"var(--serif)",fontSize:"48px",color:"var(--cream)",marginBottom:"8px"}}>Dashboard</div>
            <div style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--cream-faint)",letterSpacing:"0.08em",marginBottom:"48px"}}>{wallet} · Story Aeneid Testnet</div>

            {/* Stage selector for demo */}
            <div style={{display:"flex",gap:"8px",marginBottom:"32px",flexWrap:"wrap"}}>
              {["Sealed","Match Found","Profiles","NDA","Full Access"].map((l,i)=>(
                <button key={i} onClick={()=>setDemoStage(i)} style={{fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.08em",padding:"8px 14px",border:`1px solid ${demoStage===i?"var(--gold)":"var(--border)"}`,background:demoStage===i?"var(--gold-bg)":"transparent",color:demoStage===i?"var(--gold)":"var(--cream-faint)",borderRadius:"4px",cursor:"pointer",textTransform:"uppercase"}}>
                  {l}
                </button>
              ))}
            </div>

            {/* Stage 0 */}
            {demoStage === 0 && (
              <div style={{padding:"48px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"8px",textAlign:"center"}}>
                <div style={{fontSize:"48px",marginBottom:"20px"}}>🔒</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"28px",color:"var(--cream)",marginBottom:"12px"}}>Vault sealed</div>
                <div style={{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--cream-faint)",letterSpacing:"0.08em",marginBottom:"24px"}}>0xd1ea...0000 · Stage 0 · Active</div>
                <p style={{color:"var(--cream-dim)",lineHeight:"1.8",maxWidth:"400px",margin:"0 auto"}}>Your intent is encrypted on-chain. The matching agent runs every 10 minutes. You'll be notified when a match is found.</p>
              </div>
            )}

            {/* Stage 1 */}
            {demoStage === 1 && (
              <div style={{padding:"40px",background:"rgba(201,168,76,0.06)",border:"1px solid var(--border-gold)",borderRadius:"8px"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.15em",color:"var(--gold)",marginBottom:"16px"}}>● MATCH FOUND</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"32px",color:"var(--cream)",marginBottom:"8px"}}>A match exists</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"64px",color:"var(--gold)",marginBottom:"4px"}}>87%</div>
                <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--cream-faint)",letterSpacing:"0.1em",marginBottom:"32px"}}>COMPATIBILITY SCORE</div>
                <p style={{color:"var(--cream-dim)",lineHeight:"1.8",marginBottom:"32px",maxWidth:"480px"}}>A potential match has been identified. No details are revealed yet. Both parties must confirm interest to proceed to Stage 2. This match expires in 7 days.</p>
                <div style={{display:"flex",gap:"12px"}}>
                  <button className="btn-primary" style={{padding:"14px 32px"}}>Proceed to Stage 2 →</button>
                  <button className="btn-secondary" style={{padding:"14px 32px"}}>Not interested</button>
                </div>
              </div>
            )}

            {/* Stage 2 */}
            {demoStage === 2 && (
              <div style={{padding:"40px",background:"rgba(74,158,255,0.05)",border:"1px solid rgba(74,158,255,0.2)",borderRadius:"8px"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.15em",color:"#4a9eff",marginBottom:"16px"}}>◎ STAGE 2 — THIN PROFILE</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"28px",color:"var(--cream)",marginBottom:"24px"}}>Your match's profile</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"32px"}}>
                  {[["Acquirer Type","Strategic Buyer"],["Target Sectors","B2B SaaS, Data & Analytics"],["Deal Types","Acquisition, Acquihire"],["Geography","US, Remote"],["Budget Range","$10M–$50M"],["Company Stage","Series A, Series B"]].map(([k,v])=>(
                    <div key={k} style={{padding:"14px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px"}}>
                      <div style={{fontFamily:"var(--mono)",fontSize:"9px",letterSpacing:"0.12em",color:"var(--cream-faint)",textTransform:"uppercase",marginBottom:"6px"}}>{k}</div>
                      <div style={{fontSize:"14px",color:"var(--cream)"}}>{v}</div>
                    </div>
                  ))}
                </div>
                <p style={{color:"var(--cream-dim)",fontSize:"13px",lineHeight:"1.7",marginBottom:"24px"}}>Signing the NDA will reveal both company identities simultaneously. This is permanent and on-chain.</p>
                <button className="btn-primary" style={{padding:"16px 36px"}}>Sign NDA & Reveal Identity →</button>
              </div>
            )}

            {/* Stage 3 */}
            {demoStage === 3 && (
              <div style={{padding:"40px",background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:"8px"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.15em",color:"#a78bfa",marginBottom:"16px"}}>◉ STAGE 3 — IDENTITY REVEALED</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"28px",color:"var(--cream)",marginBottom:"32px"}}>Match revealed</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"16px",alignItems:"center",marginBottom:"32px"}}>
                  <div style={{padding:"20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"6px",textAlign:"center"}}>
                    <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--cream-faint)",letterSpacing:"0.1em",marginBottom:"8px"}}>SELL SIDE</div>
                    <div style={{fontFamily:"var(--serif)",fontSize:"22px",color:"var(--cream)"}}>Archway Analytics</div>
                  </div>
                  <div style={{fontFamily:"var(--serif)",fontSize:"28px",color:"var(--cream-faint)"}}>↔</div>
                  <div style={{padding:"20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"6px",textAlign:"center"}}>
                    <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--cream-faint)",letterSpacing:"0.1em",marginBottom:"8px"}}>BUY SIDE</div>
                    <div style={{fontFamily:"var(--serif)",fontSize:"22px",color:"var(--cream)"}}>Meridian Group</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:"12px",marginBottom:"24px"}}>
                  <div style={{padding:"10px 16px",background:"rgba(76,175,125,0.1)",border:"1px solid rgba(76,175,125,0.2)",borderRadius:"4px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--green)"}}>✓ NDA signed on-chain</div>
                  <div style={{padding:"10px 16px",background:"rgba(76,175,125,0.1)",border:"1px solid rgba(76,175,125,0.2)",borderRadius:"4px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--green)"}}>✓ Negotiation Rights NFT #042 minted</div>
                </div>
                <button className="btn-primary" style={{padding:"16px 36px"}}>View Financial Details →</button>
              </div>
            )}

            {/* Stage 4 */}
            {demoStage === 4 && (
              <div style={{padding:"40px",background:"rgba(76,175,125,0.04)",border:"1px solid rgba(76,175,125,0.2)",borderRadius:"8px"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.15em",color:"var(--green)",marginBottom:"16px"}}>◉ STAGE 4 — FULL ACCESS</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"28px",color:"var(--cream)",marginBottom:"24px"}}>Archway Analytics</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"32px"}}>
                  {[["ARR","$3.2M"],["Revenue Growth","140% YoY"],["Gross Margin","74%"],["Churn Rate","4.2%"],["Target Price","$18M"],["Price Floor","$14M"]].map(([k,v])=>(
                    <div key={k} style={{padding:"16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px"}}>
                      <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--cream-faint)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"6px"}}>{k}</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:"24px",color:"var(--gold)"}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"16px 20px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"6px",marginBottom:"24px"}}>
                  <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--cream-faint)",letterSpacing:"0.1em",marginBottom:"8px"}}>DEAL NOTES</div>
                  <div style={{fontSize:"14px",color:"var(--cream-dim)",lineHeight:"1.7"}}>Founders seeking larger distribution platform. Product is mature; growth limited by sales bandwidth. Open to full acquisition with team retention.</div>
                </div>
                <div style={{padding:"14px 20px",background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:"4px",fontFamily:"var(--mono)",fontSize:"11px",color:"#a78bfa"}}>
                  Negotiation Rights NFT #042 · minted to 0x8C62...F90e
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DOCS PAGE ────────────────────────────────────────────────────
function DocsPage({ wallet, connectWallet, onBack }) {
  const [active, setActive] = useState(0);
  const sections = [
    {title:"What is Mirror?",content:"Mirror is a trustless stealth acquisition matchmaker built on Story Protocol's Confidential Data Rails (CDR). It allows startups open to acquisition and companies looking to acquire to find each other privately — without a broker, banker, or any trusted middleman.\n\nBoth sides seal their intent into CDR-encrypted vaults on Story's Aeneid testnet. A matching agent reads only public signals. When a match is found, a 4-stage revelation protocol unlocks information progressively, enforced entirely by smart contracts."},
    {title:"What is CDR?",content:"Confidential Data Rails (CDR) is a system built on Story Protocol that uses Trusted Execution Environments (TEEs) — physically sealed hardware enclaves — synchronized by on-chain state.\n\nData encrypted to the network's threshold public key can only be decrypted when a quorum of validators confirms the on-chain read condition is met. Nobody — not validators, not the platform operator, not a subpoena — can decrypt without the condition being satisfied.\n\nThe result: private data that behaves like a programmable, composable on-chain object."},
    {title:"The Four Stages",content:"Stage 0 — Sealed: Both vaults are created. All data is encrypted. The read condition returns false for every caller. Zero on-chain trace of sealed contents.\n\nStage 1 — Match Found: Agent finds compatibility score ≥ 60 from public signals. Both parties notified. No names. No details. Match expires in 7 days.\n\nStage 2 — Thin Profile: Both parties confirm interest. Coarse fields visible: sector, size range, deal type, geography. Company name and financials remain sealed.\n\nStage 3 — Identity Revealed: Both wallets sign the on-chain NDA. When both have signed, both company names reveal simultaneously. Negotiation Rights NFTs minted.\n\nStage 4 — Full Access: Seller grants Stage 4. Full financial details unlock for the buyer."},
    {title:"Smart Contracts",content:"StagedReadCondition.sol: CDR read condition that upgrades across 4 stages. Emits zero events on denied reads. Only MirrorMatcher can upgrade stages.\n\nMirrorMatcher.sol: Core coordination contract. Controls all stage transitions. Both parties must confirm before any stage advances.\n\nMirrorNDA.sol: On-chain mutual NDA. Both parties sign independently. When both sign, Stage 3 triggers automatically.\n\nNegotiationRights.sol: ERC-721 soulbound NFT minted to both parties at Stage 3. Non-transferable. Permanent proof of mutual intent."},
    {title:"FAQ",content:"Can Mirror see my data? No. Vault contents are encrypted client-side before transmission. The platform has no access to private data without the CDR conditions being met.\n\nWhat if no match is found? Your vault stays sealed forever. Nobody ever knows you registered.\n\nWhat if I change my mind? You can withdraw at Stage 1 or Stage 2. Once both parties sign the NDA at Stage 3, the identity reveal is permanent.\n\nIs this on mainnet? This is running on Story's Aeneid testnet for the CDR Hackathon. Chain ID: 1315.\n\nWhat is the NDA? An on-chain signed statement stored permanently. It is not a legally binding document — it is a cryptographic record of mutual consent to engage."},
  ];
  return (
    <div className="app">
      <style>{FONT}{css}</style>
      <div className="grain"/>
      <nav className="nav">
        <div className="nav-logo" onClick={onBack} style={{cursor:"pointer"}}>MIRROR</div>
        <div className="nav-links">
          <button className="nav-link" onClick={onBack}>← Home</button>
          <button className={`nav-wallet ${wallet?"connected":""}`} onClick={connectWallet}>{wallet?`● ${wallet}`:"Connect Wallet"}</button>
        </div>
      </nav>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"100px 40px 80px",display:"grid",gridTemplateColumns:"220px 1fr",gap:"60px",alignItems:"start"}}>
        <div style={{position:"sticky",top:"100px"}}>
          <div style={{fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"0.2em",color:"var(--gold)",marginBottom:"20px",textTransform:"uppercase"}}>Documentation</div>
          {sections.map((s,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 0",fontFamily:"var(--sans)",fontSize:"14px",color:active===i?"var(--cream)":"var(--cream-faint)",background:"none",border:"none",cursor:"pointer",borderLeft:`2px solid ${active===i?"var(--gold)":"transparent"}`,paddingLeft:"16px",marginBottom:"4px",transition:"all 0.2s"}}>
              {s.title}
            </button>
          ))}
        </div>
        <div>
          <div style={{fontFamily:"var(--serif)",fontSize:"clamp(32px,5vw,52px)",color:"var(--cream)",marginBottom:"32px",lineHeight:"1.1"}}>{sections[active].title}</div>
          <div style={{fontSize:"15px",color:"var(--cream-dim)",lineHeight:"2",whiteSpace:"pre-line"}}>{sections[active].content}</div>
        </div>
      </div>
    </div>
  );
}
