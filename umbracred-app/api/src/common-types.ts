/**
 * Provides types and utilities for working with UmbraCred contracts.
 *
 * @packageDocumentation
 */

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { UmbraCredPrivateState, Contract, Witnesses } from '../../contract/src/index';

export const umbraCredPrivateStateKey = 'umbraCredPrivateState';
export type PrivateStateId = typeof umbraCredPrivateStateKey;

/**
 * The private states consumed throughout the application.
 */
export type PrivateStates = {
  readonly umbraCredPrivateState: UmbraCredPrivateState;
};

/**
 * Represents an UmbraCred contract and its private state.
 */
export type UmbraCredContract = Contract<UmbraCredPrivateState, Witnesses<UmbraCredPrivateState>>;

/**
 * The keys of the circuits exported from {@link UmbraCredContract}.
 */
export type UmbraCredCircuitKeys = Exclude<keyof UmbraCredContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link UmbraCredContract}.
 */
export type UmbraCredProviders = MidnightProviders<UmbraCredCircuitKeys, PrivateStateId, UmbraCredPrivateState>;

/**
 * An {@link UmbraCredContract} that has been deployed to the network.
 */
export type DeployedUmbraCredContract = FoundContract<UmbraCredContract>;

/**
 * The derived (public-only) state of an UmbraCred contract: what any observer can see.
 */
export type UmbraCredDerivedState = {
  readonly issuerKey: Uint8Array;
  readonly credentialCount: bigint;
};
