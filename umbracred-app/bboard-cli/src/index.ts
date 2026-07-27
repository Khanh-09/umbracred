/*
 * This file is the main driver for the UmbraCred CLI.
 * The entry point is the run function, at the end of the file.
 * We expect the startup files (standalone.ts, preview.ts, preprod.ts) to
 * call run with some specific configuration that sets the network addresses
 * of the servers this file relies on.
 */

import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import {
  UmbraCredAPI,
  type UmbraCredDerivedState,
  umbraCredPrivateStateKey,
  type UmbraCredProviders,
  type DeployedUmbraCredContract,
  type PrivateStateId,
} from '../../api/src/index';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import {
  ledger,
  pureCircuits,
  type Ledger,
} from '../../contract/src/managed/umbra-cred/contract/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { type Logger } from 'pino';
import { type Config, StandaloneConfig } from './config.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { assertIsContractAddress, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider';
import { randomBytes } from '../../api/src/utils';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { syncWallet, waitForUnshieldedFunds } from './wallet-utils';
import { generateDust } from './generate-dust';
import { UmbraCredPrivateState } from '../../contract/src/witnesses.js';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

/* **********************************************************************
 * getUmbraCredLedgerState: a helper that queries the current state of
 * the data on the ledger, for a specific UmbraCred contract.
 */

export const getUmbraCredLedgerState = async (
  providers: UmbraCredProviders,
  contractAddress: ContractAddress,
): Promise<Ledger | null> => {
  assertIsContractAddress(contractAddress);
  const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
  return contractState != null ? ledger(contractState.data) : null;
};

/* **********************************************************************
 * deployOrJoin: returns a contract, by prompting the user about
 * whether to deploy a new one or join an existing one and then
 * calling the appropriate helper.
 */

const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new UmbraCred contract (you become the approved issuer, and hold a credential)
  2. Join an existing UmbraCred contract
  3. Exit
Which would you like to do? `;

const deployOrJoin = async (
  providers: UmbraCredProviders,
  rli: Interface,
  logger: Logger,
): Promise<UmbraCredAPI | null> => {
  let api: UmbraCredAPI | null = null;

  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1': {
        const scoreAnswer = await rli.question('What score should your credential have (0-65535)? ');
        const score = BigInt(scoreAnswer || '0');
        const issuerSecretKey = randomBytes(32);
        const ownerSecretKey = randomBytes(32);
        const credential = { score, salt: randomBytes(32) };
        api = await UmbraCredAPI.deploy(providers, issuerSecretKey, ownerSecretKey, credential, logger);
        logger.info(`Deployed contract at address: ${api.deployedContractAddress}`);
        return api;
      }
      case '2':
        api = await UmbraCredAPI.join(providers, await rli.question('What is the contract address (in hex)? '), logger);
        logger.info(`Joined contract at address: ${api.deployedContractAddress}`);
        return api;
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

/* **********************************************************************
 * displayLedgerState: shows the values of each of the fields declared
 * by the contract to be in the ledger state — exactly what any observer
 * can see: the approved issuer's public key, and how many credential
 * commitments have been registered.
 */

const displayLedgerState = async (
  providers: UmbraCredProviders,
  deployedUmbraCredContract: DeployedUmbraCredContract,
  logger: Logger,
): Promise<void> => {
  const contractAddress = deployedUmbraCredContract.deployTxData.public.contractAddress;
  const ledgerState = await getUmbraCredLedgerState(providers, contractAddress);
  if (ledgerState === null) {
    logger.info(`There is no UmbraCred contract deployed at ${contractAddress}`);
  } else {
    logger.info(`Approved issuer key is: '${toHex(ledgerState.issuerKey)}'`);
    logger.info(`Credential commitments registered: ${ledgerState.credentials.size()}`);
  }
};

/* **********************************************************************
 * displayPrivateState: shows the hex-formatted private data this DApp
 * instance holds — the real score/salt/keys that never touch the ledger.
 */

const displayPrivateState = async (providers: UmbraCredProviders, logger: Logger): Promise<void> => {
  const privateState = await providers.privateStateProvider.get(umbraCredPrivateStateKey);
  if (privateState === null) {
    logger.info(`There is no existing UmbraCred private state`);
  } else {
    logger.info(`Current credential score is: ${privateState.credential.score}`);
    logger.info(`Current credential salt is: ${toHex(privateState.credential.salt)}`);
    logger.info(`Current owner secret key is: ${toHex(privateState.ownerSecretKey)}`);
    logger.info(`Current issuer secret key is: ${toHex(privateState.issuerSecretKey)}`);
  }
};

/* **********************************************************************
 * displayDerivedState: shows the values of derived (public) state, as
 * streamed from the ledger.
 */

const displayDerivedState = (derivedState: UmbraCredDerivedState | undefined, logger: Logger) => {
  if (derivedState === undefined) {
    logger.info(`No UmbraCred state currently available`);
  } else {
    logger.info(`Approved issuer key is: '${toHex(derivedState.issuerKey)}'`);
    logger.info(`Credential commitments registered: ${derivedState.credentialCount}`);
  }
};

/* **********************************************************************
 * mainLoop: the main interactive menu of the UmbraCred CLI.
 * Before starting the loop, the user is prompted to deploy a new
 * contract or join an existing one.
 */

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Issue my credential (register its commitment on the ledger, as the approved issuer)
  2. Prove eligibility against a threshold (discloses only true/false)
  3. Display the current ledger state (known by everyone)
  4. Display the current private state (known only to this DApp instance)
  5. Display the current derived state (known only to this DApp instance)
  6. Exit
Which would you like to do? `;

const mainLoop = async (providers: UmbraCredProviders, rli: Interface, logger: Logger): Promise<void> => {
  const umbraCredApi = await deployOrJoin(providers, rli, logger);
  if (umbraCredApi === null) {
    return;
  }
  let currentState: UmbraCredDerivedState | undefined;
  const stateObserver = {
    next: (state: UmbraCredDerivedState) => (currentState = state),
  };
  const subscription = umbraCredApi.state$.subscribe(stateObserver);
  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      try {
        switch (choice) {
          case '1': {
            const privateState = await providers.privateStateProvider.get(umbraCredPrivateStateKey);
            if (privateState === null) {
              logger.error('No private state available to issue a credential for.');
              break;
            }
            const commitment = pureCircuits.credentialCommitment(
              privateState.credential,
              privateState.ownerSecretKey,
            );
            await umbraCredApi.issueCredential(commitment);
            break;
          }
          case '2': {
            const thresholdAnswer = await rli.question('What threshold should be proven against (0-65535)? ');
            const eligible = await umbraCredApi.proveEligibility(BigInt(thresholdAnswer || '0'));
            logger.info(`Eligible: ${eligible}`);
            break;
          }
          case '3':
            await displayLedgerState(providers, umbraCredApi.deployedContract, logger);
            break;
          case '4':
            await displayPrivateState(providers, logger);
            break;
          case '5':
            displayDerivedState(currentState, logger);
            break;
          case '6':
            logger.info('Exiting...');
            return;
          default:
            logger.error(`Invalid choice: ${choice}`);
        }
      } catch (e) {
        logError(logger, e);
        logger.info('Returning to main menu...');
      }
    }
  } finally {
    subscription.unsubscribe();
  }
};

/* ***********************************************************************
 * This seed gives access to tokens minted in the genesis block of a local development node - only
 * used in standalone networks to build a wallet with initial funds.
 */
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

/* **********************************************************************
 * buildWallet: unless running in a standalone (offline) mode,
 * prompt the user to tell us whether to create a new wallet
 * or recreate one from a prior seed.
 */

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<string | undefined> => {
  if (config instanceof StandaloneConfig) {
    return GENESIS_MINT_WALLET_SEED;
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return toHex(randomBytes(32));
      case '2':
        return await rli.question('Enter your wallet seed: ');
      case '3':
        logger.info('Exiting...');
        return undefined;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

/* **********************************************************************
 * run: the main entry point that starts the whole UmbraCred CLI.
 *
 * If called with a Docker environment argument, the application
 * will wait for Docker to be ready before doing anything else.
 */

export const run = async (config: Config, testEnv: TestEnvironment, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  const providersToBeStopped: MidnightWalletProvider[] = [];
  try {
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);
    const seed = await buildWallet(config, rli, logger);
    if (seed === undefined) {
      return;
    }
    const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
    providersToBeStopped.push(walletProvider);
    const walletFacade: WalletFacade = walletProvider.wallet;

    await walletProvider.start();

    const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfiguration, unshieldedToken());
    const nightBalance = unshieldedState.balances[unshieldedToken().raw];
    if (nightBalance === undefined) {
      logger.info('No funds received, exiting...');
      return;
    }
    logger.info(`Your NIGHT wallet balance is: ${nightBalance}`);

    if (config.generateDust) {
      const dustGeneration = await generateDust(logger, seed, unshieldedState, walletFacade);
      if (dustGeneration) {
        logger.info(`Submitted dust generation registration transaction: ${dustGeneration}`);
        await syncWallet(logger, walletFacade);
      }
    }

    const zkConfigProvider = new NodeZkConfigProvider<'issueCredential' | 'proveEligibility'>(config.zkConfigPath);
    const providers: UmbraCredProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, UmbraCredPrivateState>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => {
          return 'UmbraCred-Test-2026!';
        },
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };
    await mainLoop(providers, rli, logger);
  } catch (e) {
    logError(logger, e);
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logError(logger, e);
    } finally {
      try {
        for (const wallet of providersToBeStopped) {
          logger.info('Stopping wallet...');
          await wallet.stop();
        }
        if (testEnv) {
          logger.info('Stopping test environment...');
          await testEnv.shutdown();
        }
      } catch (e) {
        logError(logger, e);
      }
    }
  }
};

function logError(logger: Logger, e: unknown) {
  if (e instanceof Error) {
    logger.error(`Found error '${e.message}'`);
    logger.debug(`${e.stack}`);
  } else {
    logger.error(`Found error (unknown type)`);
  }
}
