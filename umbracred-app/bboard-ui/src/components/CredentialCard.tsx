import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
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
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyIcon from '@mui/icons-material/VpnKeyOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import { type UmbraCredDerivedState, type DeployedUmbraCredAPI } from '../../../api/src/index';
import { type UmbraCredPrivateState } from '@midnight-ntwrk/bboard-contract';
import { useDeployedCredentialContext } from '../hooks';
import { type CredentialDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { EmptyCardContent } from './CredentialCard.EmptyCardContent';

export interface CredentialCardProps {
  credentialDeployment$?: Observable<CredentialDeployment>;
}

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

  const onCreateCredential = useCallback(
    (score: string) => {
      setWorkingLabel('Deploying UmbraCred contract & registering issuer...');
      return credentialApiProvider.deploy(BigInt(score || '0'));
    },
    [credentialApiProvider],
  );

  const onJoinCredential = useCallback(
    (contractAddress: ContractAddress) => {
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
      setErrorMessage(error instanceof Error ? error.message : String(error));
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
      setErrorMessage(error instanceof Error ? error.message : String(error));
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
        credentialDeployment.error.message.length
          ? credentialDeployment.error.message
          : 'Encountered an unexpected error while interacting with Midnight.',
      );
      return;
    }

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
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
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
              </Stack>
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

            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<HowToRegIcon />}
              onClick={onIssueCredential}
              data-testid="credential-issue-btn"
              disabled={isWorking}
              sx={{ fontWeight: 700 }}
            >
              Issue Credential Commitment
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage(undefined)} sx={{ mb: 3, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage(undefined)} sx={{ mb: 3, borderRadius: 2 }}>
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
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <SecurityIcon sx={{ color: '#00f0ff' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  Zero-Knowledge Eligibility Gate
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: '#b0a6e0', mb: 2.5 }}>
                Prove to any verifier that your hidden credential satisfies <code style={{ color: '#00f0ff' }}>score &gt;= threshold</code> without disclosing the real score.
              </Typography>

              {/* Preset threshold pills */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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
              </Stack>

              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 7 }}>
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
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    startIcon={<BoltIcon />}
                    onClick={onProveEligibility}
                    disabled={!thresholdInput.length || isWorking}
                    data-testid="credential-prove-btn"
                    sx={{ py: 1.4, fontWeight: 700 }}
                  >
                    Prove Eligibility (ZK)
                  </Button>
                </Grid>
              </Grid>

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
            <Grid container spacing={2}>
              {/* Public Ledger Column */}
              <Grid size={{ xs: 12, md: 6 }}>
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
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <VisibilityIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: '#00f0ff', fontWeight: 700 }}>
                      What Any Observer Sees
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.6)', display: 'block', mb: 2 }}>
                    Public on-chain ledger state
                  </Typography>

                  {derivedState ? (
                    <Stack spacing={1.5}>
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
                    </Stack>
                  ) : (
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                  )}
                </Paper>
              </Grid>

              {/* Private Witness Column */}
              <Grid size={{ xs: 12, md: 6 }}>
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <VisibilityOffIcon sx={{ color: '#a48eff', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ color: '#a48eff', fontWeight: 700 }}>
                        Your Private Witness
                      </Typography>
                    </Stack>
                    <Button
                      size="small"
                      variant="text"
                      onClick={onTogglePrivateState}
                      data-testid="credential-toggle-private-state"
                      sx={{ fontSize: '0.75rem', p: 0.5, color: '#a48eff' }}
                    >
                      {showPrivateState ? 'Hide' : 'Inspect'}
                    </Button>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'rgba(215, 207, 255, 0.6)', display: 'block', mb: 2 }}>
                    Client-side browser state (Never sent on-chain)
                  </Typography>

                  <Collapse in={showPrivateState}>
                    {privateState ? (
                      <Stack spacing={1} sx={{ p: 1.5, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#00e676', fontFamily: '"JetBrains Mono", monospace' }} data-testid="private-score">
                          raw_score: {privateState.credential.score.toString()} / 100
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#b0a6e0', fontFamily: '"JetBrains Mono", monospace' }} data-testid="private-salt">
                          salt: 0x{toHex(privateState.credential.salt).slice(0, 12)}...
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#b0a6e0', fontFamily: '"JetBrains Mono", monospace' }} data-testid="private-owner-key">
                          owner_sk: 0x{toHex(privateState.ownerSecretKey).slice(0, 12)}...
                        </Typography>
                      </Stack>
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
              </Grid>
            </Grid>
          </CardContent>
        </React.Fragment>
      )}
    </Card>
  );
};
