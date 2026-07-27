import * as UmbraCred from '../../contract/src/managed/umbra-cred/contract/index.js';

import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type UmbraCredDerivedState,
  type UmbraCredContract,
  type UmbraCredProviders,
  type DeployedUmbraCredContract,
  umbraCredPrivateStateKey,
} from './common-types.js';
import { CompiledUmbraCredContractContract } from '../../contract/src/index';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { map, tap, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { UmbraCredPrivateState, createUmbraCredPrivateState } from '../../contract/src/witnesses.js';

/**
 * An API for a deployed UmbraCred contract.
 */
export interface DeployedUmbraCredAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<UmbraCredDerivedState>;

  issueCredential: (commitment: Uint8Array) => Promise<void>;
  proveEligibility: (threshold: bigint) => Promise<boolean>;
  issueMyCredential: () => Promise<void>;
  getLocalPrivateState: () => Promise<UmbraCredPrivateState | null>;
}

/**
 * Provides an implementation of {@link DeployedUmbraCredAPI} by adapting a deployed UmbraCred
 * contract.
 *
 * @remarks
 * For this early-stage demo, one wallet session plays both the issuer and the credential holder,
 * so `UmbraCredPrivateState` bundles the issuer secret key, the holder secret key, and the
 * credential itself. A production version would keep these separate across distinct issuer and
 * holder identities.
 */
export class UmbraCredAPI implements DeployedUmbraCredAPI {
  /** @internal */
  private constructor(
    public readonly deployedContract: DeployedUmbraCredContract,
    private readonly providers: UmbraCredProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = providers.publicDataProvider
      .contractStateObservable(this.deployedContractAddress, { type: 'latest' })
      .pipe(
        map((contractState) => UmbraCred.ledger(contractState.data)),
        tap((ledgerState) =>
          logger?.trace({
            ledgerStateChanged: {
              ledgerState: {
                issuerKey: toHex(ledgerState.issuerKey),
                credentialCount: ledgerState.credentials.size(),
              },
            },
          }),
        ),
        map((ledgerState) => ({
          issuerKey: ledgerState.issuerKey,
          credentialCount: ledgerState.credentials.size(),
        })),
      );
  }

  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes based on the current public (ledger) state.
   * This is exactly what any outside observer can see: the approved issuer's public key, and
   * how many credential commitments have been registered — never a score, salt, or identity.
   */
  readonly state$: Observable<UmbraCredDerivedState>;

  /**
   * Registers a credential commitment on the ledger, as the approved issuer.
   *
   * @remarks
   * Fails during local circuit execution if the caller's issuer secret key does not match the
   * ledger's `issuerKey`.
   */
  async issueCredential(commitment: Uint8Array): Promise<void> {
    this.logger?.info('issuingCredential');

    const txData = await this.deployedContract.callTx.issueCredential(commitment);

    this.logger?.trace({
      transactionAdded: {
        circuit: 'issueCredential',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Proves that the holder's credential score meets `threshold`, without revealing the score.
   *
   * @returns Only the boolean result of the comparison — never the real score.
   */
  async proveEligibility(threshold: bigint): Promise<boolean> {
    this.logger?.info(`provingEligibility: threshold=${threshold}`);

    const txData = await this.deployedContract.callTx.proveEligibility(threshold);

    this.logger?.trace({
      transactionAdded: {
        circuit: 'proveEligibility',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });

    return txData.private.result;
  }

  /**
   * Reads back the private data this session holds locally — the real score, salt, and secret
   * keys that never touch the ledger. Exposed so a UI can demonstrate, side by side, what an
   * observer can see (via {@link state$}) versus what only this instance knows.
   */
  async getLocalPrivateState(): Promise<UmbraCredPrivateState | null> {
    return this.providers.privateStateProvider.get(umbraCredPrivateStateKey);
  }

  /**
   * Convenience wrapper around {@link issueCredential} that computes the commitment for this
   * session's own credential (from local private state) before submitting it.
   */
  async issueMyCredential(): Promise<void> {
    const privateState = await this.getLocalPrivateState();
    if (!privateState) {
      throw new Error('No private state available to issue a credential for.');
    }
    const commitment = UmbraCred.pureCircuits.credentialCommitment(privateState.credential, privateState.ownerSecretKey);
    await this.issueCredential(commitment);
  }

  /**
   * Deploys a new UmbraCred contract to the network.
   *
   * @param issuerSecretKey The secret key of the approved issuer, used to set the contract's
   * initial `issuerKey`.
   * @param ownerSecretKey The secret key of the credential holder for this session.
   * @param credential The credential this session's holder is issued.
   */
  static async deploy(
    providers: UmbraCredProviders,
    issuerSecretKey: Uint8Array,
    ownerSecretKey: Uint8Array,
    credential: UmbraCred.Credential,
    logger?: Logger,
  ): Promise<UmbraCredAPI> {
    logger?.info('deployContract');

    const initialIssuerKey = UmbraCred.pureCircuits.issuerPublicKey(issuerSecretKey);
    const deployedUmbraCredContract = await deployContract(providers, {
      compiledContract: CompiledUmbraCredContractContract,
      privateStateId: umbraCredPrivateStateKey,
      initialPrivateState: createUmbraCredPrivateState(issuerSecretKey, ownerSecretKey, credential),
      args: [initialIssuerKey],
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedUmbraCredContract.deployTxData.public,
      },
    });

    return new UmbraCredAPI(deployedUmbraCredContract, providers, logger);
  }

  /**
   * Finds an already deployed UmbraCred contract on the network, and joins it.
   */
  static async join(
    providers: UmbraCredProviders,
    contractAddress: ContractAddress,
    logger?: Logger,
  ): Promise<UmbraCredAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedUmbraCredContract = await findDeployedContract<UmbraCredContract>(providers, {
      contractAddress,
      compiledContract: CompiledUmbraCredContractContract,
      privateStateId: umbraCredPrivateStateKey,
      initialPrivateState: await UmbraCredAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedUmbraCredContract.deployTxData.public,
      },
    });

    return new UmbraCredAPI(deployedUmbraCredContract, providers, logger);
  }

  private static async getPrivateState(
    providers: UmbraCredProviders,
    contractAddress: ContractAddress,
  ): Promise<UmbraCredPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(umbraCredPrivateStateKey);
    return (
      existingPrivateState ??
      createUmbraCredPrivateState(utils.randomBytes(32), utils.randomBytes(32), {
        score: 0n,
        salt: utils.randomBytes(32),
      })
    );
  }
}

/**
 * A namespace that represents the exports from the `'utils'` sub-package.
 *
 * @public
 */
export * as utils from './utils/index.js';

export * from './common-types.js';
