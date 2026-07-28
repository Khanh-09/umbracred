/*
 * This file is part of example-bboard.
 * Copyright (C) Midnight Foundation
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { UnshieldedTokenType } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { type FacadeState, type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { type ShieldedWalletAPI, type ShieldedWalletState } from '@midnight-ntwrk/wallet-sdk-shielded';
import { type UnshieldedWalletAPI, type UnshieldedWalletState } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as Rx from 'rxjs';

import { FaucetClient, type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { Logger } from 'pino';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

/**
 * Submits a transaction, retrying a few times on failure.
 *
 * @remarks
 * Preprod's public RPC endpoint periodically drops its WebSocket connection with a "Normal
 * Closure" close code right as a transaction is submitted over it, causing an otherwise-valid
 * submission to fail outright. A short retry with backoff gives the underlying provider time to
 * re-establish its connection before the next attempt.
 */
export const submitTransactionWithRetry = async (
  logger: Logger,
  submit: () => Promise<string>,
  attempts = 5,
  initialDelayMs = 8_000,
  perAttemptTimeoutMs = 25_000,
): Promise<string> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // A dead WebSocket connection can leave submit() hanging forever instead of rejecting -
      // race it against a timeout so a stuck attempt doesn't block every subsequent retry too.
      return await Promise.race([
        submit(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error(`Attempt timed out after ${perAttemptTimeoutMs}ms`)), perAttemptTimeoutMs),
        ),
      ]);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Transaction submission attempt ${attempt}/${attempts} failed: ${message}`);
      if (attempt < attempts) {
        const delayMs = initialDelayMs * attempt;
        logger.info(`Waiting ${delayMs}ms before retrying to give the connection time to recover...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
};

export const getInitialShieldedState = async (
  logger: Logger,
  wallet: ShieldedWalletAPI,
): Promise<ShieldedWalletState> => {
  logger.info('Getting initial state of wallet...');
  return Rx.firstValueFrom(wallet.state);
};

export const getInitialUnshieldedState = async (
  logger: Logger,
  wallet: UnshieldedWalletAPI,
): Promise<UnshieldedWalletState> => {
  logger.info('Getting initial state of wallet...');
  return Rx.firstValueFrom(wallet.state);
};

const isProgressStrictlyComplete = (progress: unknown): boolean => {
  if (!progress || typeof progress !== 'object') {
    return false;
  }
  const candidate = progress as { isStrictlyComplete?: unknown };
  if (typeof candidate.isStrictlyComplete !== 'function') {
    return false;
  }
  return (candidate.isStrictlyComplete as () => boolean)();
};

const isFacadeStateSynced = (state: FacadeState): boolean =>
  isProgressStrictlyComplete(state.shielded.state.progress) &&
  isProgressStrictlyComplete(state.dust.state.progress) &&
  isProgressStrictlyComplete(state.unshielded.progress);

export const syncWallet = (logger: Logger, wallet: WalletFacade, throttleTime = 2_000) => {
  logger.info('Syncing wallet...');

  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state: FacadeState) => {
        const shieldedSynced = isProgressStrictlyComplete(state.shielded.state.progress);
        const unshieldedSynced = isProgressStrictlyComplete(state.unshielded.progress);
        const dustSynced = isProgressStrictlyComplete(state.dust.state.progress);
        logger.debug(
          `Wallet synced state emission: { shielded=${shieldedSynced}, unshielded=${unshieldedSynced}, dust=${dustSynced} }`,
        );
      }),
      // A full sync of shielded/dust history can take a long time on a long-lived public
      // testnet - log a periodic heartbeat at info level (not just debug) so a long wait is
      // visibly still making progress rather than looking indistinguishable from a hang.
      Rx.throttleTime(20_000),
      Rx.tap((state: FacadeState) => {
        const done = (p: unknown) => (isProgressStrictlyComplete(p) ? 'done' : 'syncing...');
        logger.info(
          `Sync progress - shielded: ${done(state.shielded.state.progress)}, dust: ${done(state.dust.state.progress)}, unshielded: ${done(state.unshielded.progress)}`,
        );
      }),
      Rx.throttleTime(throttleTime),
      Rx.tap((state: FacadeState) => {
        const shieldedSynced = isProgressStrictlyComplete(state.shielded.state.progress);
        const unshieldedSynced = isProgressStrictlyComplete(state.unshielded.progress);
        const dustSynced = isProgressStrictlyComplete(state.dust.state.progress);
        const isSynced = shieldedSynced && dustSynced && unshieldedSynced;

        logger.debug(
          `Wallet synced state emission (synced=${isSynced}): { shielded=${shieldedSynced}, unshielded=${unshieldedSynced}, dust=${dustSynced} }`,
        );
      }),
      Rx.filter((state: FacadeState) => isFacadeStateSynced(state)),
      Rx.tap(() => logger.info('Sync complete')),
      Rx.tap((state: FacadeState) => {
        const shieldedBalances = state.shielded.balances || {};
        const unshieldedBalances = state.unshielded.balances || {};
        const dustBalances = state.dust.balance(new Date(Date.now())) || 0n;

        logger.info(
          `Wallet balances after sync - Shielded: ${JSON.stringify(shieldedBalances)}, Unshielded: ${JSON.stringify(unshieldedBalances)}, Dust: ${dustBalances}`,
        );
      }),
    ),
  );
};

export const waitForUnshieldedFunds = async (
  logger: Logger,
  wallet: WalletFacade,
  env: EnvironmentConfiguration,
  tokenType: UnshieldedTokenType,
  fundFromFaucet = false,
  throttleTime = 2_000,
): Promise<UnshieldedWalletState> => {
  const initialState = await getInitialUnshieldedState(logger, wallet.unshielded);
  const unshieldedAddress = UnshieldedAddress.codec.encode(getNetworkId(), initialState.address);
  logger.info(`Using unshielded address: ${unshieldedAddress.toString()} waiting for funds...`);
  if (fundFromFaucet && env.faucet) {
    logger.info('Requesting tokens from faucet...');
    await new FaucetClient(env.faucet, logger).requestTokens(unshieldedAddress.toString());
  }
  const initialBalance = initialState.balances[tokenType.raw];
  if (initialBalance === undefined || initialBalance === 0n) {
    logger.info(`Your wallet initial balance is: 0 (not yet initialized)`);
    logger.info(`Waiting to receive tokens...`);
    return Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.tap((state: FacadeState) => {
          const balance = state.unshielded.balances[tokenType.raw] ?? 0n;
          logger.debug(
            `Wallet funds state emission: { unshieldedSynced=${isProgressStrictlyComplete(state.unshielded.progress)}, balance=${balance.toString()} }`,
          );
        }),
        Rx.throttleTime(throttleTime),
        // Only the unshielded progress needs to be complete to trust an unshielded balance -
        // waiting on shielded/dust sync too means scanning the entire shielded Merkle tree
        // history first, which is unnecessarily slow on a long-lived public testnet.
        Rx.filter(
          (state: FacadeState) =>
            isProgressStrictlyComplete(state.unshielded.progress) &&
            (state.unshielded.balances[tokenType.raw] ?? 0n) > 0n,
        ),
        Rx.tap(() => logger.info('Sync complete')),
        Rx.tap((state: FacadeState) => {
          const shieldedBalances = state.shielded.balances || {};
          const unshieldedBalances = state.unshielded.balances || {};
          const dustBalances = state.dust.balance(new Date(Date.now())) || 0n;

          logger.info(
            `Wallet balances after sync - Shielded: ${JSON.stringify(shieldedBalances)}, Unshielded: ${JSON.stringify(unshieldedBalances)}, Dust: ${dustBalances}`,
          );
        }),
        Rx.map((state: FacadeState) => state.unshielded),
      ),
    );
  }
  return initialState;
};
