import React from 'react';
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/SecurityOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/VerifiedOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrowOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';

interface HeroSectionProps {
  onExploreClick: () => void;
  onDeployClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, onDeployClick }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 4, md: 6 },
        pb: { xs: 5, md: 7 },
        borderBottom: '1px solid rgba(124, 92, 255, 0.15)',
        background: 'radial-gradient(ellipse at 50% -20%, rgba(124, 92, 255, 0.18) 0%, rgba(7, 5, 20, 0) 70%)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: 860, mx: 'auto', mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center', mb: 2.5 }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '1rem !important', color: '#00f0ff !important' }} />}
              label="Midnight Zero-Knowledge Protocol"
              size="small"
              sx={{
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00f0ff',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.78rem',
              }}
            />
            <Chip
              icon={<LockIcon sx={{ fontSize: '1rem !important', color: '#a48eff !important' }} />}
              label="Selective Disclosure v1.0"
              size="small"
              sx={{
                background: 'rgba(124, 92, 255, 0.1)',
                border: '1px solid rgba(124, 92, 255, 0.3)',
                color: '#d7cfff',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.78rem',
              }}
            />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.4rem', sm: '3.4rem', md: '4rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              mb: 2.5,
              background: 'linear-gradient(135deg, #ffffff 30%, #c4b8ff 70%, #00f0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Prove Eligibility without Disclosing Credentials
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: 'rgba(215, 207, 255, 0.82)',
              lineHeight: 1.6,
              mb: 4,
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            UmbraCred allows an accredited issuer to commit credentials to Midnight's ledger.
            Holders generate cryptographic Zero-Knowledge proofs that their score meets any threshold —
            <strong> the verifier learns only a boolean yes/no, never the underlying score, salt, or identity.</strong>
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', mb: 5 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onDeployClick}
              startIcon={<PlayArrowIcon />}
              sx={{ px: 3.5, py: 1.3, fontSize: '0.98rem', fontWeight: 700 }}
            >
              Launch Credential Studio
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={onExploreClick}
              startIcon={<VisibilityOffIcon />}
              sx={{ px: 3, py: 1.3, fontSize: '0.98rem', color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)' }}
            >
              Inspect ZK Privacy Model
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="https://drive.google.com/file/d/1_F8idyxqCcIh4BAFLLuudWpen0NoQdP5/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                px: 3,
                py: 1.3,
                fontSize: '0.98rem',
                color: '#ffdd80',
                borderColor: 'rgba(255, 221, 128, 0.4)',
                background: 'rgba(255, 221, 128, 0.05)',
                '&:hover': {
                  borderColor: '#ffdd80',
                  background: 'rgba(255, 221, 128, 0.12)',
                },
              }}
            >
              🎬 Watch Video Demo (HD)
            </Button>
          </Box>

          {/* 3-Step User Onboarding Flow */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4, textAlign: 'left' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                background: 'rgba(124, 92, 255, 0.08)',
                border: '1px solid rgba(124, 92, 255, 0.3)',
                borderRadius: 2.5,
              }}
            >
              <Typography variant="overline" sx={{ color: '#00f0ff', fontWeight: 800, letterSpacing: '0.1em' }}>
                STEP 1 • CONNECT
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mt: 0.5, mb: 0.5 }}>
                Connect Midnight Lace
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.75)', lineHeight: 1.5, display: 'block' }}>
                Connect your Lace extension on Preprod testnet to load your shielded address.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                background: 'rgba(124, 92, 255, 0.08)',
                border: '1px solid rgba(124, 92, 255, 0.3)',
                borderRadius: 2.5,
              }}
            >
              <Typography variant="overline" sx={{ color: '#a48eff', fontWeight: 800, letterSpacing: '0.1em' }}>
                STEP 2 • COMMIT
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mt: 0.5, mb: 0.5 }}>
                Issue Credential Commitment
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.75)', lineHeight: 1.5, display: 'block' }}>
                Issuer registers hash commitment on-chain. Score &amp; salt stay strictly in local browser state.
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.2,
                background: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                borderRadius: 2.5,
              }}
            >
              <Typography variant="overline" sx={{ color: '#00e676', fontWeight: 800, letterSpacing: '0.1em' }}>
                STEP 3 • VERIFY (ZK)
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mt: 0.5, mb: 0.5 }}>
                Prove Score &gt;= Threshold
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.75)', lineHeight: 1.5, display: 'block' }}>
                Select threshold (e.g. 70) and generate ZK proof. Verifier receives boolean only.
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Live Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'rgba(17, 13, 40, 0.6)',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              borderRadius: 3,
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <BoltIcon sx={{ color: '#00f0ff', fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.7)', fontWeight: 600 }}>
                PROVING SPEED
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
              ~1.2s Local ZK
            </Typography>
            <Typography variant="caption" sx={{ color: '#00f0ff' }}>
              Client-side Docker proof server
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'rgba(17, 13, 40, 0.6)',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              borderRadius: 3,
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <ShieldIcon sx={{ color: '#7c5cff', fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.7)', fontWeight: 600 }}>
                PRIVACY BOUNDARY
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
              100% Zero-Knowledge
            </Typography>
            <Typography variant="caption" sx={{ color: '#a48eff' }}>
              Score never broadcast on-chain
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'rgba(17, 13, 40, 0.6)',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              borderRadius: 3,
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <VerifiedIcon sx={{ color: '#00e676', fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.7)', fontWeight: 600 }}>
                COMPACT CIRCUITS
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
              2 Active ZKIRs
            </Typography>
            <Typography variant="caption" sx={{ color: '#00e676' }}>
              issueCredential + proveEligibility
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              background: 'rgba(17, 13, 40, 0.6)',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              borderRadius: 3,
              textAlign: 'left',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LockIcon sx={{ color: '#ffaa00', fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.7)', fontWeight: 600 }}>
                NETWORK TARGET
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
              Preprod & Standalone
            </Typography>
            <Typography variant="caption" sx={{ color: '#ffaa00' }}>
              Lace Wallet DApp Connector
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
