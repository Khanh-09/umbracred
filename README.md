# UmbraCred

Confidential credential verification on [Midnight](https://midnight.network). An issuer commits a credential to the ledger without revealing its contents; the holder later proves the credential meets a public threshold (e.g. "score ≥ 70") without ever revealing the real score, the credential type, or their identity.

## Product idea

Hiring platforms, gated courses, and private communities all need a way to check "does this person hold a valid credential above some bar?" without forcing the person to hand over the underlying document (transcript, certificate, score report). UmbraCred lets an approved issuer register a cryptographic commitment to a credential on Midnight's public ledger, and lets the holder generate a zero-knowledge proof that they know a credential matching that commitment and satisfying a threshold — the verifier learns only the yes/no answer, never the private details.

## Status

🌑 **Level 1 — New Moon.** Toolchain set up, first contract written, compiled, and deployed to Preview/Preprod.

## Setup

Midnight's toolchain runs on Linux/macOS only. On Windows, use **WSL2**:

```powershell
wsl --install          # installs WSL2 + Ubuntu, requires a reboot
```

Inside the WSL2 Ubuntu shell:

```bash
# 1. Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc
compact update
compact --version

# 2. Node 22 (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22

# 3. Docker Desktop (installed on Windows, enable WSL2 integration in Settings > Resources > WSL Integration)
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v

# 4. Scaffold the app and compile the contract
npx create-mn-app umbracred-app
cp contracts/umbra-cred.compact umbracred-app/contracts/
cd umbracred-app
npm run setup
```

`compact compile` output should list the generated circuits, and a `managed/` directory (circuits + proving/verifying keys) will appear next to the contract source.

## Public ledger state vs. private witness

| Ledger state (public, on-chain) | Private witness (never leaves the holder's machine) |
|---|---|
| `issuerKey: Bytes<32>` — public key of the approved issuer | `localIssuerSecretKey()` — issuer's secret key |
| `credentials: Set<Bytes<32>>` — commitments to issued credentials | `localCredential()` — the actual `Credential { score, salt }` |
| | `localOwnerSecretKey()` — holder's secret key |

The ledger only ever sees a *commitment* (a hash) — never the score, the salt, or either party's secret key.

## `disclose()` — what becomes public, on purpose

- `issueCredential(commitment)` calls `credentials.insert(disclose(commitment))`. The issuer explicitly discloses the commitment hash (an opaque value) so it can be looked up later — never the credential contents it hides.
- `proveEligibility(threshold)` calls `return disclose(cred.score >= threshold)`. Only the **boolean result** of the comparison is disclosed. The real `cred.score` is read from a witness, compared locally inside the circuit, and never leaves the proof as a value — only "did it pass the threshold" does.
- Membership checks (`credentials.member(commitment)`) and the issuer-key check in `issueCredential` happen inside `assert()` and are not disclosed — they can fail the proof without revealing why beyond "assertion failed".

## Contract

See [contracts/umbra-cred.compact](contracts/umbra-cred.compact). Circuits:

- `issueCredential(commitment)` — approved issuer registers a credential commitment.
- `proveEligibility(threshold)` — holder proves their credential's score meets `threshold`, disclosing only `true`/`false`.
- `issuerPublicKey`, `credentialCommitment` — pure helper circuits used to derive the issuer's public key and a credential's commitment hash from witness data.

## Roadmap

- 🌒 Level 2 — wire a frontend, connect Lace on Preprod, call `proveEligibility` from the UI.
- 🌓 Level 3 — multi-issuer support, expiry + revocation, tests, CI/CD. See [PROJECT_PLAN.md](PROJECT_PLAN.md) for the full plan.

## Deployment

- Network: _TODO after `npm run setup`_
- Contract address: _TODO_

<!-- Screenshot: `compact compile` output listing circuits -->
<!-- Screenshot: deployed contract with address -->
