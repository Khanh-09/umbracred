import {
  UmbraCredAPI,
  type UmbraCredCircuitKeys,
  type UmbraCredProviders,
  type DeployedUmbraCredAPI,
  utils,
} from '../../../api/src/index';
import { type ContractAddress, fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  type Observable,
  take,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import { type Logger } from 'pino';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import semver from 'semver';
import {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { type UmbraCredPrivateState } from '@midnight-ntwrk/bboard-contract';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

/**
 * An in-progress UmbraCred deployment.
 */
export interface InProgressCredentialDeployment {
  readonly status: 'in-progress';
}

/**
 * A deployed UmbraCred deployment.
 */
export interface DeployedCredentialDeployment {
  readonly status: 'deployed';
  readonly api: DeployedUmbraCredAPI;
}

/**
 * A failed UmbraCred deployment.
 */
export interface FailedCredentialDeployment {
  readonly status: 'failed';
  readonly error: Error;
}

/**
 * An UmbraCred contract deployment.
 */
export type CredentialDeployment = InProgressCredentialDeployment | DeployedCredentialDeployment | FailedCredentialDeployment;

/**
 * Provides access to UmbraCred deployments.
 */
export interface DeployedCredentialAPIProvider {
  /**
   * Gets the observable set of contract deployments.
   */
  readonly credentialDeployments$: Observable<Array<Observable<CredentialDeployment>>>;

  /**
   * Deploys a new UmbraCred contract: this session becomes the approved issuer, and is issued a
   * credential with the given `score`.
   */
  readonly deploy: (score: bigint) => Observable<CredentialDeployment>;

  /**
   * Joins an already-deployed UmbraCred contract at `contractAddress`.
   */
  readonly join: (contractAddress: ContractAddress) => Observable<CredentialDeployment>;
}

/**
 * A {@link DeployedCredentialAPIProvider} that manages UmbraCred deployments in a browser setting.
 *
 * @remarks
 * {@link BrowserUmbraCredManager} configures and manages a connection to the Midnight Lace
 * wallet, along with a collection of additional providers that work in a web-browser setting.
 */
export class BrowserUmbraCredManager implements DeployedCredentialAPIProvider {
  readonly #credentialDeploymentsSubject: BehaviorSubject<Array<BehaviorSubject<CredentialDeployment>>>;
  #initializedProviders: Promise<UmbraCredProviders> | undefined;

  /**
   * Initializes a new {@link BrowserUmbraCredManager} instance.
   *
   * @param logger The `pino` logger to use for logging.
   */
  constructor(private readonly logger: Logger) {
    this.#credentialDeploymentsSubject = new BehaviorSubject<Array<BehaviorSubject<CredentialDeployment>>>([]);
    this.credentialDeployments$ = this.#credentialDeploymentsSubject;
  }

  /** @inheritdoc */
  readonly credentialDeployments$: Observable<Array<Observable<CredentialDeployment>>>;

  /** @inheritdoc */
  deploy(score: bigint): Observable<CredentialDeployment> {
    const deployments = this.#credentialDeploymentsSubject.value;
    const deployment = new BehaviorSubject<CredentialDeployment>({ status: 'in-progress' });

    void this.deployDeployment(deployment, score);

    this.#credentialDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  /** @inheritdoc */
  join(contractAddress: ContractAddress): Observable<CredentialDeployment> {
    const deployments = this.#credentialDeploymentsSubject.value;
    let deployment = deployments.find(
      (deployment) =>
        deployment.value.status === 'deployed' && deployment.value.api.deployedContractAddress === contractAddress,
    );

    if (deployment) {
      return deployment;
    }

    deployment = new BehaviorSubject<CredentialDeployment>({ status: 'in-progress' });

    void this.joinDeployment(deployment, contractAddress);

    this.#credentialDeploymentsSubject.next([...deployments, deployment]);

    return deployment;
  }

  private getProviders(): Promise<UmbraCredProviders> {
    return this.#initializedProviders ?? (this.#initializedProviders = initializeProviders(this.logger));
  }

  private async deployDeployment(deployment: BehaviorSubject<CredentialDeployment>, score: bigint): Promise<void> {
    try {
      const providers = await this.getProviders();
      const issuerSecretKey = utils.randomBytes(32);
      const ownerSecretKey = utils.randomBytes(32);
      const credential = { score, salt: utils.randomBytes(32) };
      const api = await UmbraCredAPI.deploy(providers, issuerSecretKey, ownerSecretKey, credential, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  private async joinDeployment(
    deployment: BehaviorSubject<CredentialDeployment>,
    contractAddress: ContractAddress,
  ): Promise<void> {
    try {
      const providers = await this.getProviders();
      const api = await UmbraCredAPI.join(providers, contractAddress, this.logger);

      deployment.next({
        status: 'deployed',
        api,
      });
    } catch (error: unknown) {
      deployment.next({
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

/** @internal */
const initializeProviders = async (logger: Logger): Promise<UmbraCredProviders> => {
  const networkId = import.meta.env.VITE_NETWORK_ID as NetworkId;
  const connectedAPI = await connectToWallet(logger, networkId);
  const zkConfigPath = window.location.origin;
  const keyMaterialProvider = new FetchZkConfigProvider<UmbraCredCircuitKeys>(zkConfigPath, fetch.bind(window));
  const config = await connectedAPI.getConfiguration();
  const inMemoryUmbraCredPrivateStateProvider = inMemoryPrivateStateProvider<string, UmbraCredPrivateState>();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  return {
    privateStateProvider: inMemoryUmbraCredPrivateStateProvider,
    zkConfigProvider: keyMaterialProvider,
    proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
        try {
          logger.info({ tx, ttl }, 'Balancing transaction via wallet');
          const serializedTx = toHex(tx.serialize());
          const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
            'signature',
            'proof',
            'binding',
            fromHex(received.tx),
          );
        } catch (e) {
          logger.error({ error: e }, 'Error balancing transaction via wallet');
          throw e;
        }
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        const txIdentifiers = tx.identifiers();
        const txId = txIdentifiers[0]; // Return the first transaction ID
        logger.info({ txIdentifiers }, 'Submitted transaction via wallet');
        return txId;
      },
    },
  };
};

/** @internal */
const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (!window.midnight) return undefined;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(wallet.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

/** @internal */
const connectToWallet = (logger: Logger, networkId: string): Promise<ConnectedAPI> => {
  return firstValueFrom(
    fnPipe(
      interval(100),
      map(() => getFirstCompatibleWallet()),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Check for wallet connector API');
      }),
      filter((connectorAPI): connectorAPI is InitialAPI => !!connectorAPI),
      tap((connectorAPI) => {
        logger.info(connectorAPI, 'Compatible wallet connector API found. Connecting.');
      }),
      take(1),
      timeout({
        first: 1_000,
        with: () =>
          throwError(() => {
            logger.error('Could not find wallet connector API');

            return new Error('Could not find Midnight Lace wallet. Extension installed?');
          }),
      }),
      concatMap(async (initialAPI) => {
        const connectedAPI = await initialAPI.connect(networkId);
        const connectionStatus = await connectedAPI.getConnectionStatus();
        logger.info(connectionStatus, 'Wallet connector API enabled status');
        return connectedAPI;
      }),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => {
            logger.error('Wallet connector API has failed to respond');

            return new Error('Midnight Lace wallet has failed to respond. Extension enabled?');
          }),
      }),
      catchError((error, apis) =>
        error
          ? throwError(() => {
              logger.error('Unable to enable connector API' + error);
              return new Error('Application is not authorized');
            })
          : apis,
      ),
    ),
  );
};
