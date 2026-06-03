Here's the README with everything added:

---

```markdown
# Mirror
### *Find your match without showing your hand.*

**Stealth Acquisition Matchmaker — Built on Story's Confidential Data Rails (CDR)**

🔗 **Live App:** https://mirror-web-two.vercel.app  
📺 **Demo Video:** [https://youtu.be/3MxVcuR-Woc]  
🌐 **Network:** Story Aeneid Testnet · Chain ID 1315

---

## What Mirror Is

Mirror is a trustless, private matchmaking protocol for companies that want 
to be acquired, acquihired, or find strategic partners — and for buyers 
looking to acquire — without either side ever publicly signaling interest.

Today, M&A deals require expensive brokers and bankers (2–5% of deal value) 
because someone has to hold the information asymmetry between buyer and seller. 
Mirror eliminates that middleman entirely. Both sides seal their intent into 
CDR vaults. The protocol matches them privately. Revelation happens in stages, 
only when both parties consent. No banker. No broker. No leak.

---

## Why CDR Makes This Possible

Without CDR, this cannot exist. A normal server means the platform operator 
sees everything and becomes the liability. With CDR:

- Private data is **TDH2-encrypted** to Story's DKG global public key 
  client-side using `uploadCDR()` — no server ever sees the plaintext
- Nobody — not the platform, not validators, not a subpoena — can open 
  a vault without the on-chain conditions being met
- Smart contracts enforce staged revelation logic
- Neither party trusts the other or the platform — they trust only the protocol

---

## How Mirror Uses CDR

### 1. Real Vault Encryption
When a user registers, their private data (company name, revenue, target price, 
budget) is encrypted using `uploadCDR()` from `@piplabs/cdr-sdk`. The SDK 
fetches the DKG global public key, applies TDH2 threshold encryption locally, 
and writes the ciphertext to a CDR vault on Story Aeneid testnet. The 
`allocate` and `write` transactions are both visible on Storyscan.

### 2. Novel CDR Primitive — Staged Revelation Vaults
Mirror introduces a new CDR pattern: **dynamic read conditions that upgrade 
progressively based on bilateral on-chain consent.**

Every previous CDR project uses a static read condition — a vault either 
unlocks or it doesn't. Mirror's `StagedReadCondition.sol` is a custom 
condition contract implementing `checkReadCondition` and `checkWriteCondition` 
that advances through 4 stages only when both parties confirm on-chain. 
Neither party can advance a stage alone. The protocol enforces the order.

### 3. CDR Access Control Patterns Used
- **Write:** `conditions.ownerOnly()` with deployed `OwnerWriteCondition` 
  (`0x4C9bFC96d7092b590D497A191826C3dA2277c34B`) — only the registering 
  wallet can write to their vault
- **Read:** `StagedReadCondition.sol` (custom deployed contract) for 
  application-layer access control across 4 stages
- **CDR storage:** `conditions.open()` with `LicenseReadCondition` 
  (`0xC0640AD4CF2CaA9914C8e5C44234359a9102f7a3`) for CDR vault storage

---

## The Four Stages

| Stage | What Unlocks | Condition |
|-------|-------------|-----------|
| 0 | Vault sealed | Both parties register |
| 1 | "A match exists" | Compatibility score ≥ 60 |
| 2 | Thin profile (sector, size range, deal type) | Both parties confirm interest |
| 3 | Identity revealed simultaneously | Both parties sign on-chain NDA |
| 4 | Financial details unlock | Seller grants Stage 4 |

---

## Smart Contracts (Story Aeneid Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| MirrorMatcher | `0x48a957537D54a42bF2848D59e7e582D208Cdb060` | Core stage coordination |
| MirrorNDA | `0xe87599921b3754d1351eFb32668038127B6Bf412` | Dual-signature on-chain NDA |
| NegotiationRights | `0x5b68496cE34d09795218A8163ba1bb12828D92dd` | ERC-721 soulbound NFT at Stage 3 |
| StagedReadCondition | `0xA56ad6778bBEa54eE15696EE9ec5fF371e1d84FF` | Novel CDR read condition |
| OwnerOnlyWriteCondition | `0xdf22B6C521D8a80A5849337f0680c4D426483Eb3` | Owner-only write access |

---

## Technical Highlights

**Staged revelation** is Mirror's core technical contribution to the CDR 
ecosystem. Key properties:

- **Multi-step:** 4 stages, cannot skip
- **Multi-sig:** Both parties must confirm each transition
- **Time-based:** Matches expire on-chain after 7 days via `expireMatch()`
- **Zero trace on denial:** `StagedReadCondition` emits no event on denied 
  reads — a one-sided access attempt leaves zero on-chain evidence
- **Composable:** Match records and NDA are on-chain objects other protocols 
  can reference
- **Cancellable:** Either party can cancel at Stage 1 or 2 via `cancelMatch()`

---

## Testing Mirror

### Requirements
- MetaMask with Story Aeneid Testnet added:
  - RPC: `https://aeneid.storyrpc.io`
  - Chain ID: `1315`
  - Currency: `IP`
- Free testnet IP tokens: https://aeneid.faucet.story.foundation

### Run the full flow
1. Go to https://mirror-web-two.vercel.app
2. Register as a seller with your acquisition intent
3. In a different browser/incognito, register as a buyer
4. The matching agent runs every 10 minutes — watch your dashboard
5. When a match is found, advance through the stages
6. Both identities reveal simultaneously after both sign the on-chain NDA

---

## Repository Structure

```
mirror/
├── apps/
│   └── web/                  # Next.js 14 frontend
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   ├── register/         # Sell-side + buy-side flows
│       │   ├── dashboard/        # Match status + staged reveal UI
│       │   └── docs/             # Documentation page
│       ├── components/
│       └── lib/
├── packages/
│   ├── contracts/            # Solidity smart contracts (Hardhat)
│   │   ├── MirrorMatcher.sol
│   │   ├── MirrorNDA.sol
│   │   ├── NegotiationRights.sol
│   │   ├── StagedReadCondition.sol
│   │   └── OwnerOnlyWriteCondition.sol
│   ├── agent/                # Matching agent (Vercel Cron)
│   └── cdr/                  # CDR vault integration
├── docs/                     # Architecture, design, phases
└── tests/                    # Test fixtures + integration tests
```

---

## Stack

- **Frontend:** Next.js 14, Tailwind CSS, wagmi, RainbowKit, Framer Motion
- **Contracts:** Solidity 0.8.24, Hardhat, Story Aeneid Testnet
- **CDR:** `@piplabs/cdr-sdk` v0.2.1 — `uploadCDR`, `conditions.ownerOnly`
- **Database:** Supabase (public signals only — private data stays in CDR vaults)
- **Agent:** TypeScript, Vercel Cron (runs every 10 minutes)
- **Network:** Story Aeneid Testnet · Chain ID 1315

---

## The Banker Is the Bug. CDR Is the Fix.

*Built for the CDR Hackathon — May 2026*
```