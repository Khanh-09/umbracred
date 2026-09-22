import { UmbraCredSimulator } from "./umbra-cred-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { pureCircuits } from "../managed/umbra-cred/contract/index.js";

setNetworkId("undeployed");

describe("UmbraCred smart contract", () => {
  it("registers a credential commitment when the approved issuer issues it", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 80n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);

    const ledgerState = simulator.issueCredential(commitment);
    expect(ledgerState.credentials.member(commitment)).toEqual(true);
  });

  it("rejects issuing a credential from a non-approved issuer", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 80n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    simulator.setPrivateState({
      ...simulator.getPrivateState(),
      issuerSecretKey: randomBytes(32),
    });
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);

    expect(() => simulator.issueCredential(commitment)).toThrow(
      "failed assert: Only the approved issuer can issue a credential",
    );
  });

  it("proves eligibility when the holder's score meets the threshold", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 80n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);
    simulator.issueCredential(commitment);

    expect(simulator.proveEligibility(70n)).toEqual(true);
  });

  it("fails eligibility when the holder's score is below the threshold", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 50n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);
    simulator.issueCredential(commitment);

    expect(simulator.proveEligibility(70n)).toEqual(false);
  });

  it("passes eligibility when score exactly equals the threshold (boundary test)", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 70n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);
    simulator.issueCredential(commitment);

    expect(simulator.proveEligibility(70n)).toEqual(true);
  });

  it("supports issuing multiple credentials for distinct holders under one issuer", () => {
    const issuerSecretKey = randomBytes(32);
    const owner1 = randomBytes(32);
    const owner2 = randomBytes(32);
    const cred1 = { score: 95n, salt: randomBytes(32) };
    const cred2 = { score: 60n, salt: randomBytes(32) };

    const simulator = new UmbraCredSimulator(issuerSecretKey, owner1, cred1);
    const commitment1 = simulator.commitmentFor(cred1, owner1);
    const commitment2 = simulator.commitmentFor(cred2, owner2);

    simulator.issueCredential(commitment1);
    const ledgerState = simulator.issueCredential(commitment2);

    expect(ledgerState.credentials.member(commitment1)).toEqual(true);
    expect(ledgerState.credentials.member(commitment2)).toEqual(true);
  });

  it("allows approved issuer to revoke an issued credential and records revocation", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 90n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);
    simulator.issueCredential(commitment);

    const ledgerAfterRevoke = simulator.revokeCredential(commitment);
    expect(ledgerAfterRevoke.revocations.member(commitment)).toEqual(true);
  });

  it("fails proveEligibility when the credential has been revoked", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 90n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);
    simulator.issueCredential(commitment);

    // Initial eligibility passes
    expect(simulator.proveEligibility(70n)).toEqual(true);

    // Issuer revokes credential
    simulator.revokeCredential(commitment);

    // Now eligibility proof must fail with revoked assertion
    expect(() => simulator.proveEligibility(70n)).toThrow(
      "failed assert: Credential has been revoked",
    );
  });

  it("rejects revoking a credential from an unauthorized entity", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 85n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const commitment = simulator.commitmentFor(credential, ownerSecretKey);
    simulator.issueCredential(commitment);

    simulator.setPrivateState({
      ...simulator.getPrivateState(),
      issuerSecretKey: randomBytes(32),
    });

    expect(() => simulator.revokeCredential(commitment)).toThrow(
      "failed assert: Only the approved issuer can revoke a credential",
    );
  });

  it("rejects revoking a non-existent credential", () => {
    const issuerSecretKey = randomBytes(32);
    const ownerSecretKey = randomBytes(32);
    const credential = { score: 85n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      issuerSecretKey,
      ownerSecretKey,
      credential,
    );
    const nonExistentCommitment = randomBytes(32);

    expect(() => simulator.revokeCredential(nonExistentCommitment)).toThrow(
      "failed assert: Cannot revoke a non-existent credential commitment",
    );
  });

  it("allows the approved issuer to rotate issuer key and issue credentials with new key", () => {
    const oldIssuerSecret = randomBytes(32);
    const newIssuerSecret = randomBytes(32);
    const newIssuerPublicKey = pureCircuits.issuerPublicKey(newIssuerSecret);

    const ownerSecret = randomBytes(32);
    const credential = { score: 88n, salt: randomBytes(32) };
    const simulator = new UmbraCredSimulator(
      oldIssuerSecret,
      ownerSecret,
      credential,
    );

    // Update key
    const ledgerAfterRotation = simulator.updateIssuerKey(newIssuerPublicKey);
    expect(ledgerAfterRotation.issuerKey).toEqual(newIssuerPublicKey);

    // Switch simulator issuer key to the new key
    simulator.setPrivateState({
      ...simulator.getPrivateState(),
      issuerSecretKey: newIssuerSecret,
    });

    const commitment = simulator.commitmentFor(credential, ownerSecret);
    const ledgerAfterIssue = simulator.issueCredential(commitment);
    expect(ledgerAfterIssue.credentials.member(commitment)).toEqual(true);
  });
});
