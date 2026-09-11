import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { MainLayout, CredentialCard, HeroSection, PrivacyInspector } from './components';
import { useDeployedCredentialContext } from './hooks';
import { type CredentialDeployment } from './contexts';
import { type Observable } from 'rxjs';
import ShieldIcon from '@mui/icons-material/SecurityOutlined';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';

const App: React.FC = () => {
  const credentialApiProvider = useDeployedCredentialContext();
  const [credentialDeployments, setCredentialDeployments] = useState<Array<Observable<CredentialDeployment>>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const studioRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subscription = credentialApiProvider.credentialDeployments$.subscribe(setCredentialDeployments);
    return () => {
      subscription.unsubscribe();
    };
  }, [credentialApiProvider]);

  const scrollToStudio = () => {
    setActiveTab(0);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPrivacy = () => {
    setActiveTab(1);
    privacyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <MainLayout>
      {/* Hero Section with Live Stats */}
      <HeroSection onDeployClick={scrollToStudio} onExploreClick={scrollToPrivacy} />

      {/* Main Interactive Studio Container */}
      <Container maxWidth="lg" sx={{ py: 6 }} ref={studioRef}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              background: 'rgba(17, 13, 40, 0.7)',
              p: 0.5,
              borderRadius: 3,
              border: '1px solid rgba(124, 92, 255, 0.25)',
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.92rem',
                minHeight: 44,
                px: 3,
                borderRadius: 2.5,
                color: 'rgba(215, 207, 255, 0.7)',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #7c5cff 0%, #5436d6 100%)',
                  boxShadow: '0 4px 14px rgba(124, 92, 255, 0.35)',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab icon={<DashboardIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Credential Studio & Contracts" />
            <Tab icon={<ShieldIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Zero-Knowledge Privacy Inspector" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Stack spacing={4} alignItems="center">
            {credentialDeployments.map((credentialDeployment, idx) => (
              <Box data-testid={`credential-${idx}`} key={`credential-${idx}`} sx={{ width: '100%' }}>
                <CredentialCard credentialDeployment$={credentialDeployment} />
              </Box>
            ))}
            <Box data-testid="credential-start" sx={{ width: '100%' }}>
              <CredentialCard />
            </Box>
          </Stack>
        )}

        {activeTab === 1 && (
          <Box ref={privacyRef}>
            <PrivacyInspector />
          </Box>
        )}
      </Container>
    </MainLayout>
  );
};

export default App;
