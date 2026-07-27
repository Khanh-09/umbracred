// This file is part of umbracred-app.
// Licensed under the Apache License, Version 2.0.

/*
 * This file defines the shape of UmbraCred's private state, and the
 * witness functions that expose it to the contract's circuits.
 */

import { Credential, Ledger } from "./managed/umbra-cred/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

/* **********************************************************************
 * A holder's private state: their own secret key, the credential they
 * were issued (score + salt), and, only for whoever plays the issuer
 * role (e.g. in the CLI/tests), the issuer's secret key.
 */
export type UmbraCredPrivateState = {
  readonly issuerSecretKey: Uint8Array;
  readonly ownerSecretKey: Uint8Array;
  readonly credential: Credential;
};

export const createUmbraCredPrivateState = (
  issuerSecretKey: Uint8Array,
  ownerSecretKey: Uint8Array,
  credential: Credential,
): UmbraCredPrivateState => ({
  issuerSecretKey,
  ownerSecretKey,
  credential,
});

export const witnesses = {
  localIssuerSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, UmbraCredPrivateState>): [
    UmbraCredPrivateState,
    Uint8Array,
  ] => [privateState, privateState.issuerSecretKey],

  localOwnerSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, UmbraCredPrivateState>): [
    UmbraCredPrivateState,
    Uint8Array,
  ] => [privateState, privateState.ownerSecretKey],

  localCredential: ({
    privateState,
  }: WitnessContext<Ledger, UmbraCredPrivateState>): [
    UmbraCredPrivateState,
    Credential,
  ] => [privateState, privateState.credential],
};
