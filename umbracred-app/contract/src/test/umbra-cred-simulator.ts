import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  type Credential,
  ledger,
  pureCircuits,
} from "../managed/umbra-cred/contract/index.js";
import { type UmbraCredPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the UmbraCred contract in tests.
 */
export class UmbraCredSimulator {
  readonly contract: Contract<UmbraCredPrivateState>;
  circuitContext: CircuitContext<UmbraCredPrivateState>;

  constructor(
    issuerSecretKey: Uint8Array,
    ownerSecretKey: Uint8Array,
    credential: Credential,
  ) {
    this.contract = new Contract<UmbraCredPrivateState>(witnesses);
    const initialIssuerKey = pureCircuits.issuerPublicKey(issuerSecretKey);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext(
        { issuerSecretKey, ownerSecretKey, credential },
        "0".repeat(64),
      ),
      initialIssuerKey,
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): UmbraCredPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public setPrivateState(privateState: UmbraCredPrivateState) {
    this.circuitContext.currentPrivateState = privateState;
  }

  public issueCredential(commitment: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.issueCredential(
      this.circuitContext,
      commitment,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public proveEligibility(threshold: bigint): boolean {
    const result = this.contract.impureCircuits.proveEligibility(
      this.circuitContext,
      threshold,
    );
    this.circuitContext = result.context;
    return result.result;
  }

  public commitmentFor(
    credential: Credential,
    ownerKey: Uint8Array,
  ): Uint8Array {
    return pureCircuits.credentialCommitment(credential, ownerKey);
  }
}
