import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { MainLayout, CredentialCard } from './components';
import { useDeployedCredentialContext } from './hooks';
import { type CredentialDeployment } from './contexts';
import { type Observable } from 'rxjs';

/**
 * The root UmbraCred application component.
 *
 * @remarks
 * The {@link App} component requires a `<DeployedCredentialProvider />` parent in order to
 * retrieve information about current UmbraCred deployments.
 */
const App: React.FC = () => {
  const credentialApiProvider = useDeployedCredentialContext();
  const [credentialDeployments, setCredentialDeployments] = useState<Array<Observable<CredentialDeployment>>>([]);

  useEffect(() => {
    const subscription = credentialApiProvider.credentialDeployments$.subscribe(setCredentialDeployments);

    return () => {
      subscription.unsubscribe();
    };
  }, [credentialApiProvider]);

  return (
    <Box sx={{ background: '#000', minHeight: '100vh' }}>
      <MainLayout>
        {credentialDeployments.map((credentialDeployment, idx) => (
          <div data-testid={`credential-${idx}`} key={`credential-${idx}`}>
            <CredentialCard credentialDeployment$={credentialDeployment} />
          </div>
        ))}
        <div data-testid="credential-start">
          <CredentialCard />
        </div>
      </MainLayout>
    </Box>
  );
};

export default App;
