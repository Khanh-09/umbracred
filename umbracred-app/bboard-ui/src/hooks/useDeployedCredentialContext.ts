import { useContext } from 'react';
import { DeployedCredentialContext, type DeployedCredentialAPIProvider } from '../contexts';

/**
 * Retrieves the currently in-scope deployed UmbraCred provider.
 *
 * @returns The currently in-scope {@link DeployedCredentialAPIProvider} implementation.
 *
 * @internal
 */
export const useDeployedCredentialContext = (): DeployedCredentialAPIProvider => {
  const context = useContext(DeployedCredentialContext);

  if (!context) {
    throw new Error('A <DeployedCredentialProvider /> is required.');
  }

  return context;
};
