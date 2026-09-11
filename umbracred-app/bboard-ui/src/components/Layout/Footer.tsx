import React from 'react';
import { Box, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'rgba(10, 7, 26, 0.95)',
        borderTop: '1px solid rgba(124, 92, 255, 0.2)',
        pt: 6,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <img src="/midnight-logo.png" alt="Midnight Logo" height={36} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                UmbraCred
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(215, 207, 255, 0.7)', maxWidth: 360, lineHeight: 1.6 }}>
              Confidential Zero-Knowledge credential verification built on Midnight Network with Compact Smart Contracts.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', mb: 2, display: 'block' }}>
              PROTOCOL
            </Typography>
            <Stack spacing={1}>
              <Link href="https://midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Midnight Network
              </Link>
              <Link href="https://docs.midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Midnight Docs
              </Link>
              <Link href="https://preprod.midnightexplorer.com" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Preprod Explorer
              </Link>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', mb: 2, display: 'block' }}>
              RESOURCES
            </Typography>
            <Stack spacing={1}>
              <Link href="https://github.com/midnightntwrk/compact" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Compact Compiler
              </Link>
              <Link href="https://github.com/midnightntwrk/dapp-connector-api" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                DApp Connector API
              </Link>
              <Link href="https://github.com/Khanh-09/umbracred" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                GitHub Repository
              </Link>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="overline" sx={{ color: '#00f0ff', mb: 2, display: 'block' }}>
              COMMUNITY
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <GitHubIcon sx={{ fontSize: 18, color: '#a48eff' }} />
                <Link href="https://github.com/Khanh-09/umbracred" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                  Open Source
                </Link>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <MenuBookIcon sx={{ fontSize: 18, color: '#a48eff' }} />
                <Link href="https://midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                  Lace Wallet
                </Link>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(124, 92, 255, 0.15)', mb: 3 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.5)' }}>
            © {new Date().getFullYear()} UmbraCred • Released under the MIT License • Built for Midnight Hackathon
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.5)', fontFamily: '"JetBrains Mono", monospace' }}>
            Compact v0.31.0 • Midnight.js v4.1.1
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
