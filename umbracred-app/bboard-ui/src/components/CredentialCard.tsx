import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';
import { type UmbraCredDerivedState, type DeployedUmbraCredAPI } from '../../../api/src/index';
import { type UmbraCredPrivateState } from '../../../contract/src/index';
import { useDeployedCredentialContext } from '../hooks';
import { type CredentialDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { EmptyCardContent } from './CredentialCard.EmptyCardContent';

export interface CredentialCardProps {
  credentialDeployment$?: Observable<CredentialDeployment>;
}

const formatFriendlyErrorMessage = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes('Failed Proof Server response') ||
    msg.includes('/proof-api/check') ||
    msg.includes('Failed to fetch') ||
    (msg.includes('prove') && msg.includes('fetch')) ||
    msg.includes('code="400"') ||
    msg.includes('code="502"') ||
    msg.includes('code="503"')
  ) {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return isLocal
      ? 'Proof Server is unreachable at http://localhost:6300. Please start the local Docker Proof Server ("docker run -p 6300:6300 midnightnetwork/proof-server") or start the gateway ("node server.js").'
      : 'Midnight Proof Server is unreachable from this domain. To generate ZK proofs, please run the local gateway ("npm run build:start") or set a custom Prover endpoint in settings.';
  }
  if (msg.includes('ERR_NETWORK_CHANGED') || msg.includes('Back-Forward Cache') || msg.includes('NetworkError')) {
    return 'Network connection changed or browser tab was paused. Please refresh the page and try again.';
  }
  if (msg.includes('proverServerUri')) {
    return 'Lace wallet did not provide a Midnight proof server endpoint. Please verify your Lace Wallet network settings.';
  }
  if (msg.includes('Credential commitment not found on ledger')) {
    return 'Credential has not been registered on the blockchain yet. Please click "Issue My Credential" to record your credential on the Midnight ledger before proving eligibility.';
  }
  if (msg.includes('No dust tokens found') || msg.includes('InsufficientFunds')) {
    return 'Insufficient DUST tokens in Lace Wallet. Open Lace -> DUST tab -> click "Register NIGHT for DUST generation" to generate gas tokens.';
  }
  if (msg.includes('Wallet is locked') || msg.includes('unlock the wallet')) {
    return 'Lace Wallet is locked. Please open the Lace extension and enter your password.';
  }
  return msg;
};

export const CredentialCard: React.FC<Readonly<CredentialCardProps>> = ({ credentialDeployment$ }) => {
  const credentialApiProvider = useDeployedCredentialContext();
  const [credentialDeployment, setCredentialDeployment] = useState<CredentialDeployment>();
  const [deployedAPI, setDeployedAPI] = useState<DeployedUmbraCredAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [derivedState, setDerivedState] = useState<UmbraCredDerivedState>();
  const [isWorking, setIsWorking] = useState(!!credentialDeployment$);
  const [workingLabel, setWorkingLabel] = useState<string>('Processing...');
  const [copied, setCopied] = useState(false);

  const [thresholdInput, setThresholdInput] = useState('70');
  const [eligibleResult, setEligibleResult] = useState<boolean>();

  const [showPrivateState, setShowPrivateState] = useState(false);
  const [privateState, setPrivateState] = useState<UmbraCredPrivateState | null>();
  const [isProverDialogOpen, setIsProverDialogOpen] = useState(false);
  const [customProverUrl, setCustomProverUrl] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('umbra_prover_url') || '' : '',
  );

  const handleSaveProver = () => {
    if (customProverUrl.trim()) {
      localStorage.setItem('umbra_prover_url', customProverUrl.trim());
    } else {
      localStorage.removeItem('umbra_prover_url');
    }
    setIsProverDialogOpen(false);
    window.location.reload();
  };

  const handleUseDockerLocal = () => {
    localStorage.setItem('umbra_prover_url', 'http://localhost:6300');
    setCustomProverUrl('http://localhost:6300');
    setIsProverDialogOpen(false);
    window.location.reload();
  };

  const handleResetDefault = () => {
    localStorage.removeItem('umbra_prover_url');
    setCustomProverUrl('');
    setIsProverDialogOpen(false);
    window.location.reload();
  };

  const onCreateCredential = useCallback(
    (score: string) => {
      setErrorMessage(undefined);
      setSuccessMessage(undefined);
      setWorkingLabel('Deploying UmbraCred contract & registering issuer...');
      return credentialApiProvider.deploy(BigInt(score || '0'));
    },
    [credentialApiProvider],
  );

  const onJoinCredential = useCallback(
    (contractAddress: ContractAddress) => {
      setErrorMessage(undefined);
      setSuccessMessage(undefined);
      setWorkingLabel('Joining deployed Midnight contract...');
      return credentialApiProvider.join(contractAddress);
    },
    [credentialApiProvider],
  );

  const onIssueCredential = useCallback(async () => {
    if (!deployedAPI) return;
    try {
      setWorkingLabel('Registering credential commitment on-chain...');
      setIsWorking(true);
      setErrorMessage(undefined);
      await deployedAPI.issueMyCredential();
      setSuccessMessage('Credential commitment successfully registered on Midnight ledger!');
    } catch (error: unknown) {
      setErrorMessage(formatFriendlyErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI]);

  const onProveEligibility = useCallback(async () => {
    if (!deployedAPI || !thresholdInput) return;
    try {
      setWorkingLabel(`Generating ZK proof for score >= ${thresholdInput}...`);
      setIsWorking(true);
      setErrorMessage(undefined);
      setEligibleResult(undefined);
      const result = await deployedAPI.proveEligibility(BigInt(thresholdInput));
      setEligibleResult(result);
    } catch (error: unknown) {
      setErrorMessage(formatFriendlyErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI, thresholdInput]);

  const onCopyContractAddress = useCallback(async () => {
    if (deployedAPI) {
      await navigator.clipboard.writeText(deployedAPI.deployedContractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [deployedAPI]);

  const onTogglePrivateState = useCallback(async () => {
    if (!showPrivateState && deployedAPI) {
      setPrivateState(await deployedAPI.getLocalPrivateState());
    }
    setShowPrivateState((prev) => !prev);
  }, [deployedAPI, showPrivateState]);

  useEffect(() => {
    if (!credentialDeployment$) return;
    const subscription = credentialDeployment$.subscribe(setCredentialDeployment);
    return () => {
      subscription.unsubscribe();
    };
  }, [credentialDeployment$]);

  useEffect(() => {
    if (!credentialDeployment) return;
    if (credentialDeployment.status === 'in-progress') return;

    setIsWorking(false);

    if (credentialDeployment.status === 'failed') {
      setErrorMessage(
        formatFriendlyErrorMessage(credentialDeployment.error)
      );
      return;
    }

    setErrorMessage(undefined);
    setDeployedAPI(credentialDeployment.api);
    const subscription = credentialDeployment.api.state$.subscribe(setDerivedState);
    return () => {
      subscription.unsubscribe();
    };
  }, [credentialDeployment]);

  return (
    <Card
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 780,
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      {!credentialDeployment$ && (
        <EmptyCardContent onCreateCallback={onCreateCredential} onJoinCallback={onJoinCredential} />
      )}

      {credentialDeployment$ && (
        <React.Fragment>
          {/* Progress / Spinner Overlay */}
          <Backdrop
            sx={{
              position: 'absolute',
              color: '#ffffff',
              zIndex: (theme) => theme.zIndex.drawer + 2,
              backgroundColor: 'rgba(7, 5, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              flexDirection: 'column',
              gap: 2,
              p: 3,
              textAlign: 'center',
            }}
            open={isWorking}
          >
            <CircularProgress size={52} sx={{ color: '#00f0ff' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
              {workingLabel}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.7)', maxWidth: 400 }}>
              Midnight Proof Server is synthesizing ZKIR constraints and evaluating private witnesses...
            </Typography>
          </Backdrop>

          {/* Header Bar */}
          <Box
            sx={{
              p: 3,
              pb: 2,
              borderBottom: '1px solid rgba(124, 92, 255, 0.2)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', mb: 0.5 }}>
                <Chip
                  label="ACTIVE CONTRACT"
                  size="small"
                  sx={{
                    background: 'rgba(0, 230, 118, 0.15)',
                    border: '1px solid rgba(0, 230, 118, 0.4)',
                    color: '#00e676',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.6)' }}>
                  Midnight Compact v0.31
                </Typography>
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 600,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {deployedAPI?.deployedContractAddress ? (
                  `0x${deployedAPI.deployedContractAddress.slice(0, 10)}...${deployedAPI.deployedContractAddress.slice(-8)}`
                ) : (
                  <Skeleton width={180} />
                )}
                {deployedAPI && (
                  <Tooltip title={copied ? 'Copied!' : 'Copy full address'}>
                    <IconButton size="small" onClick={onCopyContractAddress} sx={{ color: '#00f0ff' }}>
                      {copied ? <CheckCircleIcon fontSize="small" sx={{ color: '#00e676' }} /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                )}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<HowToRegIcon />}
                onClick={onIssueCredential}
                disabled={isWorking || !deployedAPI}
                data-testid="credential-issue-btn"
                sx={{ fontWeight: 600 }}
              >
                Register Credential
              </Button>
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Status alerts */}
            {errorMessage && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setErrorMessage(undefined)}
                action={
                  errorMessage.includes('Proof Server') || errorMessage.includes('Prover') ? (
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => setIsProverDialogOpen(true)}
                      sx={{
                        fontWeight: 700,
                        textTransform: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 1.5,
                        px: 1.5,
                        '&:hover': { background: 'rgba(255, 255, 255, 0.15)' },
                      }}
                    >
                      Fix / Setup Prover
                    </Button>
                  ) : undefined
                }
              >
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(undefined)}>
                {successMessage}
              </Alert>
            )}

            {/* Verification Studio Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                background: 'rgba(124, 92, 255, 0.06)',
                border: '1px solid rgba(124, 92, 255, 0.3)',
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ color: '#00f0ff' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  Zero-Knowledge Eligibility Gate
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0a6e0', mb: 2.5 }}>
                Prove to any verifier that your hidden credential satisfies <code style={{ color: '#00f0ff' }}>score &gt;= threshold</code> without disclosing the real score.
              </Typography>

              {/* Preset threshold pills */}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.6)', alignSelf: 'center', mr: 0.5 }}>
                  PRESETS:
                </Typography>
                {['50', '70', '80', '90'].map((bar) => (
                  <Chip
                    key={bar}
                    label={`≥ ${bar}`}
                    size="small"
                    onClick={() => {
                      setThresholdInput(bar);
                      setEligibleResult(undefined);
                    }}
                    variant={thresholdInput === bar ? 'filled' : 'outlined'}
                    color={thresholdInput === bar ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace' }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, gap: 2, alignItems: 'center' }}>
                <TextField
                  id="threshold-prompt"
                  data-testid="credential-threshold-prompt"
                  variant="outlined"
                  label="Minimum Required Score Bar (Threshold)"
                  fullWidth
                  size="medium"
                  type="number"
                  value={thresholdInput}
                  onChange={(e) => {
                    setThresholdInput(e.target.value);
                    setEligibleResult(undefined);
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<BoltIcon />}
                  onClick={onProveEligibility}
                  disabled={!thresholdInput.length || isWorking}
                  data-testid="credential-prove-btn"
                  sx={{ py: 1.4, px: 3, fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Prove Eligibility (ZK)
                </Button>
              </Box>

              {/* Proof Result Display */}
              {eligibleResult !== undefined && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2.5,
                    borderRadius: 2.5,
                    background: eligibleResult ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 61, 113, 0.12)',
                    border: `1px solid ${eligibleResult ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 61, 113, 0.4)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  {eligibleResult ? (
                    <CheckCircleIcon sx={{ fontSize: 36, color: '#00e676' }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 36, color: '#ff3d71' }} />
                  )}
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: eligibleResult ? '#00e676' : '#ff3d71', lineHeight: 1.2 }}
                      data-testid="credential-eligible-result"
                    >
                      {eligibleResult ? 'VERIFIED: ELIGIBLE' : 'VERIFIED: NOT ELIGIBLE'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ffffff', mt: 0.5 }}>
                      {eligibleResult
                        ? `ZK Proof Validated on Midnight: Credential score meets or exceeds ${thresholdInput}. Raw score remains 100% private.`
                        : `ZK Proof Validated on Midnight: Credential score is below ${thresholdInput}.`}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Observable Privacy Split Card */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Public Ledger Column */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  background: 'rgba(0, 240, 255, 0.03)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', mb: 1.5 }}>
                  <VisibilityIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ color: '#00f0ff', fontWeight: 700 }}>
                    What Any Observer Sees
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.6)', display: 'block', mb: 2 }}>
                  Public on-chain ledger state
                </Typography>

                {derivedState ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#b0a6e0' }}>
                        Approved Issuer Public Key:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#ffffff' }} data-testid="credential-issuer-key">
                        0x{toHex(derivedState.issuerKey).slice(0, 14)}...
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#b0a6e0' }}>
                        Commitments Registered:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#00f0ff' }} data-testid="credential-count">
                        {derivedState.credentialCount.toString()} commitment(s)
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                )}
              </Paper>

              {/* Private Witness Column */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  background: 'rgba(124, 92, 255, 0.05)',
                  border: '1px solid rgba(124, 92, 255, 0.25)',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                    <VisibilityOffIcon sx={{ color: '#a48eff', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#a48eff', fontWeight: 700 }}>
                      Your Private Witness
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    onClick={onTogglePrivateState}
                    data-testid="credential-toggle-private-state"
                    sx={{ fontSize: '0.75rem', p: 0.5, color: '#a48eff' }}
                  >
                    {showPrivateState ? 'Hide' : 'Inspect'}
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.6)', display: 'block', mb: 2 }}>
                  Client-side browser state (Never sent on-chain)
                </Typography>

                <Collapse in={showPrivateState}>
                  {privateState ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#00e676', fontFamily: '"JetBrains Mono", monospace' }} data-testid="private-score">
                        raw_score: {privateState.credential.score.toString()} / 100
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b0a6e0', fontFamily: '"JetBrains Mono", monospace' }} data-testid="private-salt">
                        salt: 0x{toHex(privateState.credential.salt).slice(0, 12)}...
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#b0a6e0', fontFamily: '"JetBrains Mono", monospace' }} data-testid="private-owner-key">
                        owner_sk: 0x{toHex(privateState.ownerSecretKey).slice(0, 12)}...
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#ffaa00' }}>
                      Loading local witness data...
                    </Typography>
                  )}
                </Collapse>
                {!showPrivateState && (
                  <Typography variant="body2" sx={{ color: '#b0a6e0', fontStyle: 'italic' }}>
                    Protected by Midnight ZK circuits. Click "Inspect" to view local witnesses.
                  </Typography>
                )}
              </Paper>
            </Box>
          </CardContent>
        </React.Fragment>
      )}

      {/* Prover Setup & Configuration Dialog */}
      <Dialog
        open={isProverDialogOpen}
        onClose={() => setIsProverDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#120f29',
              backgroundImage: 'none',
              border: '1px solid rgba(124, 92, 255, 0.4)',
              color: '#ffffff',
              borderRadius: 3,
              p: 1,
              minWidth: { xs: 320, sm: 520 },
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SettingsIcon sx={{ color: '#00f0ff' }} /> Midnight ZK Proof Server Setup
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <Typography variant="body2" sx={{ color: 'rgba(215, 207, 255, 0.85)' }}>
            Midnight executes Zero-Knowledge circuits client-side to keep your private score &amp; salt confidential.
          </Typography>

          <Box sx={{ p: 2, background: 'rgba(0, 240, 255, 0.08)', borderRadius: 2, border: '1px solid rgba(0, 240, 255, 0.25)' }}>
            <Typography variant="subtitle2" sx={{ color: '#00f0ff', fontWeight: 700, mb: 1 }}>
              💡 Option 1: Run Local Docker Prover (Recommended)
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.8)', display: 'block', mb: 1 }}>
              Run this command in terminal to start the official Midnight proof server:
            </Typography>
            <Box
              sx={{
                p: 1.2,
                background: '#070514',
                borderRadius: 1.5,
                border: '1px solid rgba(124, 92, 255, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#00e676', fontWeight: 600 }}>
                docker run -d -p 6300:6300 midnightnetwork/proof-server
              </Typography>
              <IconButton
                size="small"
                onClick={() => navigator.clipboard.writeText('docker run -d -p 6300:6300 midnightnetwork/proof-server')}
                sx={{ color: '#00f0ff', ml: 1 }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={handleUseDockerLocal}
              sx={{ mt: 1.5, borderColor: '#00f0ff', color: '#00f0ff', textTransform: 'none', fontWeight: 600 }}
            >
              Use http://localhost:6300
            </Button>
          </Box>

          <Box sx={{ p: 2, background: 'rgba(124, 92, 255, 0.08)', borderRadius: 2, border: '1px solid rgba(124, 92, 255, 0.25)' }}>
            <Typography variant="subtitle2" sx={{ color: '#d7cfff', fontWeight: 700, mb: 1 }}>
              🌐 Option 2: Custom / Remote Prover URL
            </Typography>
            <TextField
              label="Prover Server Endpoint"
              placeholder="e.g. http://localhost:6300 or https://your-prover-host"
              value={customProverUrl}
              onChange={(e) => setCustomProverUrl(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: 'rgba(124, 92, 255, 0.4)' },
                  '&:hover fieldset': { borderColor: '#7c5cff' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(215, 207, 255, 0.7)' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleResetDefault} color="inherit" sx={{ color: 'rgba(215, 207, 255, 0.6)' }}>
            Reset to Default
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setIsProverDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSaveProver} variant="contained" sx={{ background: 'linear-gradient(135deg, #7c5cff 0%, #5436d6 100%)' }}>
              Save &amp; Reload
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
