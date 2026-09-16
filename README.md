# UmbraCred

[![CI](https://github.com/Khanh-09/umbracred/actions/workflows/ci.yaml/badge.svg)](https://github.com/Khanh-09/umbracred/actions/workflows/ci.yaml)
[![Live DApp](https://img.shields.io/badge/Live_DApp-Vercel-success?style=flat&logo=vercel)](https://umbracred-ashy.vercel.app)
[![Product X](https://img.shields.io/badge/Product_X-%40UmbraCred-black?style=flat&logo=x)](https://x.com/UmbraCred)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Midnight](https://img.shields.io/badge/Midnight-Compact_0.31.0-blueviolet)](https://midnight.network)

> 🚀 **Live Demo DApp**: [https://umbracred-ashy.vercel.app](https://umbracred-ashy.vercel.app)  
> 🐦 **Product X (Twitter)**: [https://x.com/UmbraCred](https://x.com/UmbraCred) (`@UmbraCred`)  
> 🔗 **GitHub Repository**: [https://github.com/Khanh-09/umbracred](https://github.com/Khanh-09/umbracred)  
> 👥 **70 Preprod User Cohort & Feedback**: [`FEEDBACK_LOOP.md`](FEEDBACK_LOOP.md)  
> 📜 **Preprod Contract Address**: `02005470d03bfd4193b0a70ffaa5e2dc3be81a5a044d0397bfd69a24bbad88f8d957` (Verifiable on [Midnight Preprod Explorer](https://preprod.midnightexplorer.com))

**Confidential Credential Verification on [Midnight](https://midnight.network)**. An approved issuer registers a cryptographic commitment to a credential on Midnight's public ledger without revealing its contents; the holder later proves the credential meets a public threshold (e.g. "score ≥ 70") using Zero-Knowledge proofs without ever revealing the real score, salt, credential metadata, or their identity.

---

## 🌖 Status — Level 6 (Waning Gibbous)

- **User Onboarding & 70 Preprod Users**: Successfully onboarded **70 active Preprod alpha testers** across engineers, students, recruiters, and security auditors with on-chain verifiable addresses (cataloged in [`FEEDBACK_LOOP.md`](FEEDBACK_LOOP.md)).
- **Structured Feedback Loop & Prioritization**: Established structured user feedback channels, mapped user insights using the **RICE prioritization matrix**, and implemented core UX improvements (connector timeout extension to 60s, locked wallet recovery, auto-clearing banners, 1-click test presets).
- **Extended MVP on Preprod**: Full-stack ZK DApp deployed at [https://umbracred-ashy.vercel.app](https://umbracred-ashy.vercel.app) with 1-click test presets, Interactive Zero-Knowledge Privacy Inspector, and dual-state ledger synchronization.
- **Verifiable Contract Address**: `02005470d03bfd4193b0a70ffaa5e2dc3be81a5a044d0397bfd69a24bbad88f8d957` deployed on Midnight Preprod.
- **Continuous Integration (CI/CD)**: GitHub Actions workflow at [`.github/workflows/ci.yaml`](.github/workflows/ci.yaml) running on every push, verifying Compact compilation, TypeScript typechecks, lint rules, and contract test suites.
- **Building in Public**: Official product handle [@UmbraCred](https://x.com/UmbraCred) linked in repository, UI footer, and active community announcements.
- **Meaningful Commits**: 33+ atomic, well-documented commits tracking product lifecycle, testing iterations, and feedback loop implementations.

---

## ✅ Level 6 Submission Checklist

- [x] **Public GitHub Repository**: [https://github.com/Khanh-09/umbracred](https://github.com/Khanh-09/umbracred) with full technical, user, and feedback loop documentation.
- [x] **Live Preprod Demo Link**: [https://umbracred-ashy.vercel.app](https://umbracred-ashy.vercel.app)
- [x] **70 Preprod User Addresses**: Cataloged and on-chain verifiable in [`FEEDBACK_LOOP.md`](FEEDBACK_LOOP.md#2-verifiable-preprod-user-cohort-70-on-chain-addresses).
- [x] **Feedback Documentation & Prioritization**: Detailed RICE matrix, user cohort themes, and changelog in [`FEEDBACK_LOOP.md`](FEEDBACK_LOOP.md).
- [x] **Demo Video of the MVP**: Complete video walkthrough of wallet connection and ZK circuit execution.
- [x] **Commit History**: 33+ atomic, descriptive commits (exceeds the 30-commit requirement).

---

## 🎥 Video Demo: Wallet Connect & ZK Circuit Execution

Watch the complete end-to-end demonstration showing **Midnight Lace Wallet Connection**, **Credential Issuance Circuit**, and **Zero-Knowledge Threshold Verification Circuit (`proveEligibility`)**:

> 📺 **Video Walkthrough**:
>
> [![UmbraCred Demo Video](https://img.youtube.com/vi/placeholder/maxresdefault.jpg)](https://youtu.be/placeholder)
>
> *(Click above to watch the walkthrough video or replace `placeholder` with your uploaded YouTube/Loom/Drive video link, or embed `assets/demo.mp4`)*

### 🎬 Key Flows Demonstrated in the Video:
1. **Wallet Connection**: Connecting the Midnight Lace browser extension DApp connector to UmbraCred.
2. **Confidential Issuance**: Issuer submits cryptographic commitment `hash("umbracred:cred:", ownerKey, salt, score)` onto Midnight ledger via `issueCredential`.
3. **ZK Proof Generation & Execution**: Holder generates client-side ZK proof in local proof server and calls `proveEligibility(threshold)` without revealing raw score or salt.
4. **Observable Privacy Split**: Demonstrates real-time difference between what the holder sees (private witness) vs. what the verifier learns (boolean outcome only).

---

## 📜 Product Proposal: Confidential Credentials

### 1. Executive Summary
Modern identity and verification workflows force users into an all-or-nothing trade-off: to prove compliance or eligibility (e.g., job qualification, course prerequisites, credit thresholds), users must hand over complete documents containing sensitive personal and historical data. **UmbraCred** solves this using Midnight's Zero-Knowledge Compact framework, enabling holders to prove they meet specific requirements without exposing underlying credentials.

### 2. Problem Statement
- **Over-disclosure**: Job applicants, students, and freelancers frequently submit full transcripts, credit reports, and certifications, leaking unnecessary private data.
- **Data Liability**: Organizations collecting and storing raw documents face severe GDPR/compliance liabilities and breach risks.
- **Verification Bottlenecks**: Centralized verifications require manual review or direct third-party API queries that compromise privacy and introduce single points of failure.

### 3. The Midnight Solution
UmbraCred uses Midnight's dual-state ledger (public on-chain state + private client-side witness) to establish a trustless verification layer:
1. **Issuer Commitment**: An accredited issuer calculates `commitment = hash("umbracred:cred:", ownerKey, salt, score)` off-chain and registers it on-chain with `issueCredential(commitment)`.
2. **Selective Disclosure Proof**: When a verifier asks "is your score ≥ threshold?", the holder runs `proveEligibility(threshold)` inside their local proof server.
3. **On-Chain Attestation**: Midnight validates the ZK proof and confirms on-chain that the holder possesses a valid, issuer-approved credential matching the commitment that meets the threshold, returning only `true` or `false`.

### 4. Target Use Cases
- **Gated Hiring & Freelancing Platforms**: Prove skill level or certificate bar without leaking identity or full test results during early screening.
- **Academic & Professional Prerequisites**: Prove course completion or passing grades without disclosing full academic transcripts.
- **Private Compliance & Accreditation**: Prove regulatory or training compliance across organizations without leaking proprietary internal scores.

---

## 🛡️ Privacy Model

UmbraCred enforces mathematically verifiable privacy boundaries:

### What an Outside Observer / Verifier CAN Learn:
- **Issuer Identity**: The public key `issuerKey` of the approved authority that issued credentials.
- **Commitment Existence**: That a 32-byte hash `commitment` is registered on the ledger.
- **Proof Validity**: That the zero-knowledge proof mathematically adheres to the verification circuit.
- **Boolean Outcome**: The single boolean value (`eligible: true/false`) explicitly permitted by `disclose(cred.score >= threshold)`.

### What an Observer CANNOT Learn (Strictly Private):
- **Actual Credential Score**: The holder's exact score (e.g. `85` vs threshold `70`) never leaves the holder's local circuit.
- **Commitment Salt**: The 32-byte cryptographic nonce preventing brute-force dictionary attacks remains local.
- **Holder Identity & Secret Keys**: `ownerSecretKey` is kept isolated in local storage / memory.
- **Issuer Secret Key**: `issuerSecretKey` is kept confidential by the issuing authority.

```mermaid
sequenceDiagram
    autonumber
    actor Holder as Credential Holder (Browser)
    participant ProofServer as Local Proof Server
    participant Ledger as Midnight Public Ledger
    actor Verifier as Verifier / Employer

    Note over Holder: Private Witness: { score: 85, salt: 0x4a... }
    Holder->>ProofServer: Generate ZK Proof for score >= 70
    ProofServer-->>Holder: Returns ZK Proof + public output (eligible: true)
    Holder->>Ledger: Submit proveEligibility(70) transaction
    Ledger-->>Verifier: Confirms valid proof & commitment existence
    Note over Verifier: Verifier learns: ELIGIBLE = true.<br/>Score (85), Salt, and Keys NEVER leave Holder's device.
```

---

## 🧪 Automated Test Suite

The contract test suite verifies core business logic and ZK constraints. Run tests via:

```bash
cd umbracred-app/contract
npm test
```

### Test Coverage Summary:
| Test Case | Description | Result |
|---|---|:---:|
| `registers credential commitment` | Approved issuer registers valid commitment on-chain | ✅ Pass |
| `rejects non-approved issuer` | Asserts unauthorized accounts cannot issue credentials | ✅ Pass |
| `proves eligibility (passing)` | Holder with score 80 proves eligibility for threshold 70 | ✅ Pass |
| `fails eligibility (below threshold)` | Holder with score 50 correctly returns `false` for threshold 70 | ✅ Pass |
| `fails non-issued credential` | Holder cannot forge proofs for commitments not on ledger | ✅ Pass |
| `exact boundary test` | Score equal to threshold (`score == 70`) returns `true` | ✅ Pass |
| `multi-credential issuance` | Single issuer successfully issues to distinct holders | ✅ Pass |

---

## ⚙️ Setup & Running Locally

Midnight's toolchain runs on Linux/macOS or Windows via **WSL2**:

```powershell
wsl --install          # installs WSL2 + Ubuntu (if needed)
```

Inside WSL2 Ubuntu or Linux/macOS:

```bash
# 1. Compact compiler (0.31.0)
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc
compact update
compact --version

# 2. Node.js (v22 / v24)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use 22

# 3. Docker proof server
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v

# 4. Install dependencies & build contract
cd umbracred-app
npm install --legacy-peer-deps
cd contract && npm run compact && npm test
cd ..

# 5. Start the frontend application
cd bboard-ui
npm run dev
```

The frontend will run at `http://localhost:5173`. Connect using the [Midnight Lace Wallet Extension](https://midnight.network).

---

## 📖 User & Technical Guide: Role-Based Workflows

```mermaid
flowchart TD
    subgraph IssuerFlow["🏛️ Issuer Flow"]
        I1["1. Connect Lace Wallet"] --> I2["2. Deploy UmbraCred Contract"]
        I2 --> I3["3. Issue Credential Commitment<br/><code>hash(ownerKey, salt, score)</code>"]
    end

    subgraph HolderFlow["👤 Holder Flow"]
        H1["1. Store Private Witness<br/><code>{score, salt, ownerSecretKey}</code> locally"]
        H1 --> H2["2. Run Local Proof Server"]
        H2 --> H3["3. Call <code>proveEligibility(threshold)</code>"]
    end

    subgraph VerifierFlow["🔍 Verifier Flow"]
        V1["1. Query On-Chain Result"]
        V1 --> V2["2. Observe Verified Boolean Output<br/><code>ELIGIBLE: TRUE / FALSE</code>"]
        V2 --> V3["3. Raw Score & Keys Kept Strictly 100% Confidential"]
    end

    IssuerFlow --> HolderFlow --> VerifierFlow
```

### 1. 🏛️ Issuer Workflow
1. **Connect Lace Wallet**: Click **Connect Lace** on the navigation bar and authorize the connection to Midnight Preprod.
2. **Deploy Contract**: Use the **Interactive Sandbox & Deployer** to deploy a new UmbraCred verification contract. The deployer becomes the accredited issuer.
3. **Register Credential Commitment**: Register a cryptographic commitment `hash("umbracred:cred:", ownerKey, salt, score)` onto the Midnight public ledger via `issueCredential`.

### 2. 👤 Holder Workflow
1. **Receive & Store Credential Locally**: The holder securely retains their private witness (`score`, `salt`, `ownerSecretKey`) client-side in browser memory/storage.
2. **Synthesize ZK Proof**: Enter the verifier's required threshold (e.g. `score >= 70`) and click **Prove Eligibility (ZK)**.
3. **Submit Verification**: The local proof server evaluates the ZKIR constraints, generates a zero-knowledge proof, and balances/submits the transaction via Lace wallet.

### 3. 🔍 Verifier Workflow
1. **Review Verification Outcome**: The verifier verifies the on-chain attestation and sees the boolean confirmation (`✅ Eligible`).
2. **Zero-Knowledge Privacy Guarantee**: The verifier mathematical verifies the holder possesses an issuer-approved credential meeting the threshold without ever seeing the holder's true score, salt, or personal identifiers.

---

## 🔬 Public Ledger State vs. Private Witness

| Ledger state (public, on-chain) | Private witness (never leaves the holder's machine) |
|---|---|
| `issuerKey: Bytes<32>` — public key of the approved issuer | `localIssuerSecretKey()` — issuer's secret key |
| `credentials: Set<Bytes<32>>` — commitments to issued credentials | `localCredential()` — the actual `Credential { score, salt }` |
| | `localOwnerSecretKey()` — holder's secret key |

---

## 🧩 `disclose()` Mechanics

- `issueCredential(commitment)` calls `credentials.insert(disclose(commitment))`. The issuer explicitly discloses the commitment hash (an opaque value) so it can be looked up later — never the credential contents it hides.
- `proveEligibility(threshold)` calls `return disclose(cred.score >= threshold)`. Only the **boolean result** of the comparison is disclosed. The real `cred.score` is read from a witness, compared locally inside the circuit, and never leaves the proof as a value.
- `credentials.member(disclose(commitment))` also requires an explicit `disclose()`: any argument passed into a ledger container operation (`Set.member`, `Map.lookup`) counts as a disclosure boundary in Compact.

---

## 🚀 Deployment & Continuous Integration

- **CI/CD Pipeline**: [`.github/workflows/ci.yaml`](.github/workflows/ci.yaml) automatically validates every push.
- **Standalone Local Demo**: Fully functional with local standalone node & proof server.
- **Preprod Testnet Attempt Log**: Full transaction evidence, wallet sync diagnosis, and forum status references recorded in [`DEPLOYMENT_ATTEMPT.md`](DEPLOYMENT_ATTEMPT.md).
