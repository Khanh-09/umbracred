import React from 'react';
import { Box, Container, Divider, Link, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TwitterIcon from '@mui/icons-material/Twitter';

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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
            gap: 4,
            mb: 4,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
              <img src="/midnight-logo.png" alt="Midnight Logo" height={36} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                UmbraCred
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(215, 207, 255, 0.7)', maxWidth: 360, lineHeight: 1.6 }}>
              Confidential Zero-Knowledge credential verification built on Midnight Network with Compact Smart Contracts.
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#00f0ff', mb: 2, display: 'block' }}>
              PROTOCOL
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="https://midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Midnight Network
              </Link>
              <Link href="https://docs.midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Midnight Docs
              </Link>
              <Link href="https://indexer.preprod.midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Preprod Indexer
              </Link>
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#00f0ff', mb: 2, display: 'block' }}>
              RESOURCES
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="https://github.com/midnightntwrk/compact" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                Compact Compiler
              </Link>
              <Link href="https://github.com/midnightntwrk/dapp-connector-api" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                DApp Connector API
              </Link>
              <Link href="https://github.com/Khanh-09/umbracred" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                GitHub Repository
              </Link>
              <Link href="https://drive.google.com/file/d/1_F8idyxqCcIh4BAFLLuudWpen0NoQdP5/view?usp=drive_link" target="_blank" underline="hover" sx={{ color: '#ffdd80', fontSize: '0.88rem', fontWeight: 600 }}>
                🎬 Video Demo (Drive)
              </Link>
            </Box>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: '#00f0ff', mb: 2, display: 'block' }}>
              COMMUNITY
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <GitHubIcon sx={{ fontSize: 18, color: '#a48eff' }} />
                <Link href="https://github.com/Khanh-09/umbracred" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                  Open Source
                </Link>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <TwitterIcon sx={{ fontSize: 18, color: '#a48eff' }} />
                <Link href="https://x.com/UmbracedMish" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                  Product X (@UmbracedMish)
                </Link>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <MenuBookIcon sx={{ fontSize: 18, color: '#a48eff' }} />
                <Link href="https://midnight.network" target="_blank" underline="hover" sx={{ color: '#b0a6e0', fontSize: '0.88rem' }}>
                  Lace Wallet
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(124, 92, 255, 0.15)', mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.5)' }}>
            © {new Date().getFullYear()} UmbraCred • Released under the MIT License • Built for Midnight Hackathon
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.5)', fontFamily: '"JetBrains Mono", monospace' }}>
            Compact v0.31.0 • Midnight.js v4.1.1
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
