// This file is part of midnightntwrk/example-bboard.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState, useCallback } from 'react';
import { AppBar, Box, Button, Chip, CircularProgress, Tooltip, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useDeployedCredentialContext } from '../../hooks';
import { type WalletState } from '../../contexts';

/**
 * An application header for UmbraCred with Lace wallet connection and network indicators.
 */
export const Header: React.FC = () => {
  const credentialApiProvider = useDeployedCredentialContext();
  const [walletState, setWalletState] = useState<WalletState>({ status: 'disconnected' });

  useEffect(() => {
    const subscription = credentialApiProvider.walletState$.subscribe(setWalletState);
    return () => {
      subscription.unsubscribe();
    };
  }, [credentialApiProvider]);

  const handleConnect = useCallback(() => {
    void credentialApiProvider.connectWallet();
  }, [credentialApiProvider]);

  const handleDisconnect = useCallback(() => {
    credentialApiProvider.disconnectWallet();
  }, [credentialApiProvider]);

  const networkName = import.meta.env.VITE_NETWORK_ID || 'preprod';

  return (
    <AppBar
      position="static"
      data-testid="header"
      sx={{
        backgroundColor: 'rgba(14, 11, 33, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(157, 140, 255, 0.25)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 6 },
        py: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
        data-testid="header-logo"
      >
        <img src="/midnight-logo.png" alt="logo-image" height={48} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: '#f0eefc', lineHeight: 1.2 }}>
            UmbraCred
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.7)', display: { xs: 'none', sm: 'block' } }}>
            Zero-Knowledge Credential Verification
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`Network: ${networkName}`}
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'rgba(157, 140, 255, 0.4)',
            color: '#d7cfff',
            fontWeight: 500,
            fontSize: '0.75rem',
            display: { xs: 'none', md: 'inline-flex' },
          }}
        />

        {walletState.status === 'connected' && (
          <React.Fragment>
            <Tooltip title={walletState.address ?? 'Connected Wallet'}>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#4caf50 !important' }} />}
                label={
                  walletState.address
                    ? `${walletState.address.slice(0, 8)}...${walletState.address.slice(-6)}`
                    : 'Lace Connected'
                }
                color="primary"
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: 'rgba(76, 175, 80, 0.15)',
                  border: '1px solid rgba(76, 175, 80, 0.4)',
                  color: '#e8f5e9',
                  fontWeight: 600,
                }}
              />
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={handleDisconnect}
              startIcon={<PowerSettingsNewIcon />}
              data-testid="header-disconnect-btn"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffb4ab',
                '&:hover': {
                  borderColor: '#ff897d',
                  backgroundColor: 'rgba(255, 84, 73, 0.1)',
                },
              }}
            >
              Disconnect
            </Button>
          </React.Fragment>
        )}

        {walletState.status === 'connecting' && (
          <Button
            variant="contained"
            size="small"
            disabled
            startIcon={<CircularProgress size={16} color="inherit" />}
            sx={{ backgroundColor: 'rgba(157, 140, 255, 0.3)' }}
          >
            Connecting...
          </Button>
        )}

        {walletState.status === 'disconnected' && (
          <Button
            variant="contained"
            size="small"
            onClick={handleConnect}
            startIcon={<AccountBalanceWalletIcon />}
            data-testid="header-connect-btn"
            sx={{
              backgroundColor: '#6c5ce7',
              color: '#ffffff',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#5843d8',
              },
            }}
          >
            Connect Lace
          </Button>
        )}

        {walletState.status === 'error' && (
          <React.Fragment>
            <Tooltip title={walletState.error || 'Connection error'}>
              <Chip
                icon={<ErrorOutlineIcon sx={{ fontSize: '1rem !important', color: '#ff897d !important' }} />}
                label="Lace Error"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 84, 73, 0.15)',
                  border: '1px solid rgba(255, 84, 73, 0.4)',
                  color: '#ffb4ab',
                }}
              />
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              onClick={handleConnect}
              data-testid="header-retry-btn"
              sx={{
                borderColor: 'rgba(157, 140, 255, 0.4)',
                color: '#d7cfff',
              }}
            >
              Retry
            </Button>
          </React.Fragment>
        )}
      </Box>
    </AppBar>
  );
};
