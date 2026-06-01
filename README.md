# Mirror
### *Find your match without showing your hand.*

**Stealth Acquisition Matchmaker — Built on Story's Confidential Data Rails (CDR)**

---

## What Mirror Is

Mirror is a trustless, private matchmaking protocol for companies that want to be acquired, acquihired, or find strategic partners — and for buyers looking to acquire — without either side ever publicly signaling interest.

Today, M&A deals require expensive brokers and bankers (2–5% of deal value) because someone has to hold the information asymmetry between buyer and seller. Mirror eliminates that middleman entirely. Both sides seal their intent into CDR vaults. The protocol matches them privately. Revelation happens in stages, only when both parties consent. No banker. No broker. No leak.

---

## Why CDR Makes This Possible

Without CDR, this cannot exist. A normal server means the platform operator sees everything and becomes the liability. With CDR:

- Data lives encrypted in TEE-backed vaults
- Nobody — not the platform, not validators, not a subpoena — can open a vault without the conditions being met
- Smart contracts enforce staged revelation logic
- Neither party trusts the other or the platform — they trust only the protocol

---

## The Four Stages

| Stage | What Unlocks | Condition |
|-------|-------------|-----------|
| 0 | Vault sealed | Both parties register |
| 1 | "A match exists" | Compatibility score threshold met |
| 2 | Thin profile (sector, size range, deal type) | Both parties confirm interest |
| 3 | Identity revealed simultaneously | Both parties sign on-chain NDA |
| 4 | Financial details unlock | Both parties advance to negotiation |

---

## Hackathon Tracks

**Technical Track ($1,000):** Staged revelation vault pattern — a genuinely new CDR primitive. Multi-step, multi-sig, time-based conditions. Composable vault systems. Trustless exchange. New dynamic permission patterns.

**Application Track ($1,000–$2,000):** Real product. Real users. Zero-downside registration (vault stays sealed forever if no match). Natural re-engagement at each stage unlock.

---

## Repository Structure

```
mirror/
├── apps/
│   └── web/                  # Next.js frontend
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   ├── register/         # Sell-side + buy-side flows
│       │   ├── dashboard/        # Match status + staged reveal UI
│       │   └── docs/             # Documentation page
│       ├── components/
│       └── lib/
├── packages/
│   ├── contracts/            # Solidity smart contracts
│   │   ├── MirrorMatcher.sol     # Core matching + revelation logic
│   │   ├── MirrorNDA.sol         # On-chain NDA condition
│   │   └── NegotiationRights.sol # ERC-721 minted at Stage 3
│   ├── agent/                # Matching agent
│   │   ├── matcher.ts            # Compatibility scoring
│   │   └── vault-reader.ts       # CDR public signal reader
│   └── cdr/                  # CDR vault integration
│       ├── vault.ts              # Vault creation + access
│       └── conditions.ts         # Read/write condition contracts
├── docs/                     # All documentation (this folder)
└── tests/                    # Test fixtures + integration tests
```

---

## Quick Links

- [PHASES.md](./PHASES.md) — Build phases with completion criteria
- [CHECKLIST.md](./CHECKLIST.md) — Full completion checklist
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical + CDR architecture
- [FRONTEND.md](./FRONTEND.md) — All pages, design system, components
- [TEST-FIXTURES.md](./TEST-FIXTURES.md) — Two test companies for end-to-end testing
- [DESIGN.md](./DESIGN.md) — Visual design system, colors, fonts, themes
