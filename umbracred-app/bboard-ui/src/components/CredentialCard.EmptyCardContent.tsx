import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggestOutlined';
import { TextPromptDialog } from './TextPromptDialog';

export interface EmptyCardContentProps {
  onCreateCallback: (score: string) => void;
  onJoinCallback: (contractAddress: ContractAddress) => void;
}

export const EmptyCardContent: React.FC<Readonly<EmptyCardContentProps>> = ({
  onCreateCallback,
  onJoinCallback,
}) => {
  const [scorePromptOpen, setScorePromptOpen] = useState(false);
  const [addressPromptOpen, setAddressPromptOpen] = useState(false);

  return (
    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Chip
          icon={<RocketLaunchIcon sx={{ fontSize: '1rem !important', color: '#00f0ff !important' }} />}
          label="Interactive Sandbox & Deployer"
          size="small"
          sx={{
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            fontFamily: '"JetBrains Mono", monospace',
            mb: 1.5,
          }}
        />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>
          Deploy or Join a Credential Contract
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(215, 207, 255, 0.75)', maxWidth: 520, mx: 'auto' }}>
          Select a pre-configured scenario to test Zero-Knowledge selective disclosure instantly, or deploy with custom parameters.
        </Typography>
      </Box>

      {/* Preset Quick Launch Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            onClick={() => onCreateCallback('92')}
            sx={{
              p: 2.5,
              background: 'rgba(124, 92, 255, 0.08)',
              border: '1px solid rgba(124, 92, 255, 0.3)',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'rgba(124, 92, 255, 0.18)',
                borderColor: '#7c5cff',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 24px rgba(124, 92, 255, 0.25)',
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <VerifiedUserIcon sx={{ color: '#00e676' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                Senior Engineer Preset
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#b0a6e0', mb: 2 }}>
              Score: <strong style={{ color: '#00e676' }}>92 / 100</strong> • Top-tier candidate benchmark for senior hiring gates.
            </Typography>
            <Button size="small" variant="contained" color="primary" fullWidth>
              Deploy Candidate (Score 92)
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            onClick={() => onCreateCallback('75')}
            sx={{
              p: 2.5,
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'rgba(0, 240, 255, 0.12)',
                borderColor: '#00f0ff',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 24px rgba(0, 240, 255, 0.25)',
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <SchoolIcon sx={{ color: '#00f0ff' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                Course Graduate Preset
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#b0a6e0', mb: 2 }}>
              Score: <strong style={{ color: '#00f0ff' }}>75 / 100</strong> • Standard certification benchmark for prerequisites.
            </Typography>
            <Button size="small" variant="contained" color="secondary" fullWidth>
              Deploy Graduate (Score 75)
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: 'rgba(124, 92, 255, 0.15)' }}>
        <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.5)', px: 1 }}>
          OR CUSTOM DEPLOYMENT
        </Typography>
      </Divider>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<SettingsSuggestIcon />}
          onClick={() => setScorePromptOpen(true)}
          data-testid="credential-deploy-btn"
          sx={{ py: 1.2, px: 3 }}
        >
          Custom Score Deploy
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LinkIcon />}
          onClick={() => setAddressPromptOpen(true)}
          data-testid="credential-join-btn"
          sx={{ py: 1.2, px: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          Join Existing Contract
        </Button>
      </Stack>

      <TextPromptDialog
        prompt="Enter custom credential score (0 - 65535):"
        isOpen={scorePromptOpen}
        onCancel={() => setScorePromptOpen(false)}
        onSubmit={(text) => {
          setScorePromptOpen(false);
          onCreateCallback(text);
        }}
      />
      <TextPromptDialog
        prompt="Enter deployed Midnight contract address:"
        isOpen={addressPromptOpen}
        onCancel={() => setAddressPromptOpen(false)}
        onSubmit={(text) => {
          setAddressPromptOpen(false);
          onJoinCallback(text);
        }}
      />
    </CardContent>
  );
};
