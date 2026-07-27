import React, { type PropsWithChildren, createContext } from 'react';
import { type DeployedCredentialAPIProvider, BrowserUmbraCredManager } from './BrowserUmbraCredManager';
import { type Logger } from 'pino';

/**
 * Encapsulates a deployed UmbraCred provider as a context object.
 */
export const DeployedCredentialContext = createContext<DeployedCredentialAPIProvider | undefined>(undefined);

/**
 * The props required by the {@link DeployedCredentialProvider} component.
 */
export type DeployedCredentialProviderProps = PropsWithChildren<{
  /** The `pino` logger to use. */
  logger: Logger;
}>;

/**
 * A React component that sets a new {@link BrowserUmbraCredManager} object as the currently
 * in-scope deployed UmbraCred provider.
 */
export const DeployedCredentialProvider: React.FC<Readonly<DeployedCredentialProviderProps>> = ({
  logger,
  children,
}) => (
  <DeployedCredentialContext.Provider value={new BrowserUmbraCredManager(logger)}>
    {children}
  </DeployedCredentialContext.Provider>
);
