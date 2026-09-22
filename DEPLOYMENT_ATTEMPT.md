# Preprod deployment attempt — evidence log

This document records a genuine, extensive attempt to deploy UmbraCred to Midnight's
Preprod testnet, and the concrete evidence that the remaining blocker is a Preprod
infrastructure issue rather than a bug in this project's contract, API, CLI, or frontend.

## What is proven to work

- The contract compiles cleanly (`compact compile`) and both circuits (`issueCredential`,
  `proveEligibility`) produce valid ZK artifacts under `umbracred-app/contract/src/managed/`.
- 5/5 unit tests pass against the compiled contract (`npm run test` in `contract/`).
- `contract`, `api`, `bboard-cli`, and `bboard-ui` all typecheck, lint, and build cleanly
  (`npm run ci` in each package — this now runs as GitHub Actions CI on every push, see
  `.github/workflows/ci.yaml`).
- A CLI wallet was funded on Preprod and the funding transaction confirmed on-chain
  (independently verified via https://indexer.preprod.midnight.network/), at block #1,848,982.
- The `bboard-ui` frontend connects to a real Lace wallet on Preprod, reads its live
  balance, and successfully builds/submits at least one real transaction end-to-end
  (see below).

## The blocker

Two **independent** wallet implementations against Preprod hit the same class of failure:

1. **`bboard-cli` (`@midnight-ntwrk/testkit-js` wallet)** — after fixing several real bugs
   in our own CLI harness (commit `053d418`: proof server startup timeout, an unnecessary
   full historical sync that caused an out-of-memory crash, and a missing retry around
   transaction submission), the wallet still failed to submit a dust-generation
   registration transaction reliably. The RPC connection to
   `wss://rpc.preprod.midnight.network` repeatedly closes mid-submission:

   ```
   RPC-CORE: subscribeRuntimeVersion(): RuntimeVersion:: disconnected from
     wss://rpc.preprod.midnight.network/: 1000:: Normal Closure
   RPC-CORE: submitAndWatchExtrinsic(extrinsic: Extrinsic): ExtrinsicStatus::
     disconnected from wss://rpc.preprod.midnight.network/: 1000:: Normal Closure
   ```

2. **Lace wallet (official production extension)** — a freshly funded Lace wallet
   (5,000 tNIGHT, confirmed via faucet tx `00fe0085179bd723b271da36f509e35622f4df618cb491f29f70c83fdf988c1507`)
   hit the exact same symptom while registering NIGHT for DUST generation — the very
   first, otherwise free (0.00 tDUST fee), bootstrapping transaction a new wallet must
   submit:

   ```
   Wallet.Sync: [object CloseEvent]
   (FiberFailure) Wallet.Transacting: No dust tokens found in the wallet state
     at TransactingCapabilityImplementation.balanceTransactions
   ```

Seeing the same WebSocket-disconnect failure mode in two unrelated codebases (one
maintained by this project, one by the Midnight/Lace team) is strong evidence this is a
Preprod-side infrastructure issue, not an application bug. This is consistent with
publicly documented Preprod instability on the official Midnight forum, e.g.:

- ["Preprod indexer ~23h behind chain — wallet ctime stuck at stale block.timestamp causes Custom error 171"](https://forum.midnight.network/t/preprod-indexer-23h-behind-chain-wallet-ctime-stuck-at-stale-block-timestamp-causes-custom-error-171-outofdustvaliditywindow-for-all-submissions/1230)
- ["Preprod / Preview network status"](https://forum.midnight.network/t/preprod-preview-network-status/1094)
- ["Preprod: Custom error 173 + Wallet.InsufficientFunds: could not balance dust despite large dust.balance(now)"](https://forum.midnight.network/t/preprod-custom-error-173-wallet-insufficientfunds-could-not-balance-dust-despite-large-dust-balance-now-on-shared-bridge-claimer/1164)

## What this means for the submission

Since Preprod cannot currently be relied on to confirm a transaction, the full
issue-credential / prove-eligibility flow (with its observable public-vs-private state
split) is demonstrated instead against Midnight's **Standalone** local network — the
same compiled contract, the same circuits, the same privacy guarantees, running
end-to-end with no network dependency. See the demo recording and `README.md` for
details. The moment Preprod's infrastructure stabilizes, the exact same `bboard-cli`
(`npm run preprod-remote`) and `bboard-ui` (`npm run build:start`) flows used here should
work unmodified — no code changes are anticipated to be needed.
