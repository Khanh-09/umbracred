import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Backdrop,
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Skeleton,
  TextField,
  Typography,
  Card,
} from '@mui/material';
import CopyIcon from '@mui/icons-material/ContentPasteOutlined';
import StopIcon from '@mui/icons-material/HighlightOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import { type UmbraCredDerivedState, type DeployedUmbraCredAPI } from '../../../api/src/index';
import { type UmbraCredPrivateState } from '@midnight-ntwrk/bboard-contract';
import { useDeployedCredentialContext } from '../hooks';
import { type CredentialDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { EmptyCardContent } from './CredentialCard.EmptyCardContent';

/** The props required by the {@link CredentialCard} component. */
export interface CredentialCardProps {
  /** The observable UmbraCred deployment. */
  credentialDeployment$?: Observable<CredentialDeployment>;
}

/**
 * Provides the UI for a deployed UmbraCred contract: issuing a credential, proving eligibility
 * against a threshold, and — to make the privacy model concrete — showing side by side what an
 * outside verifier can see versus what only this browser session's private state holds.
 *
 * @remarks
 * With no `credentialDeployment$` observable, the component renders a UI to deploy a new contract
 * (with a chosen score) or join an existing one.
 */
export const CredentialCard: React.FC<Readonly<CredentialCardProps>> = ({ credentialDeployment$ }) => {
  const credentialApiProvider = useDeployedCredentialContext();
  const [credentialDeployment, setCredentialDeployment] = useState<CredentialDeployment>();
  const [deployedAPI, setDeployedAPI] = useState<DeployedUmbraCredAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [derivedState, setDerivedState] = useState<UmbraCredDerivedState>();
  const [isWorking, setIsWorking] = useState(!!credentialDeployment$);

  const [thresholdInput, setThresholdInput] = useState('');
  const [eligibleResult, setEligibleResult] = useState<boolean>();

  const [showPrivateState, setShowPrivateState] = useState(false);
  const [privateState, setPrivateState] = useState<UmbraCredPrivateState | null>();

  const onCreateCredential = useCallback(
    (score: string) => credentialApiProvider.deploy(BigInt(score || '0')),
    [credentialApiProvider],
  );
  const onJoinCredential = useCallback(
    (contractAddress: ContractAddress) => credentialApiProvider.join(contractAddress),
    [credentialApiProvider],
  );

  const onIssueCredential = useCallback(async () => {
    if (!deployedAPI) {
      return;
    }
    try {
      setIsWorking(true);
      await deployedAPI.issueMyCredential();
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI]);

  const onProveEligibility = useCallback(async () => {
    if (!deployedAPI || !thresholdInput) {
      return;
    }
    try {
      setIsWorking(true);
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
    }
  }, [deployedAPI]);

  const onTogglePrivateState = useCallback(async () => {
    if (!showPrivateState && deployedAPI) {
      setPrivateState(await deployedAPI.getLocalPrivateState());
    }
    setShowPrivateState((prev) => !prev);
  }, [deployedAPI, showPrivateState]);

  useEffect(() => {
    if (!credentialDeployment$) {
      return;
    }
    const subscription = credentialDeployment$.subscribe(setCredentialDeployment);
    return () => {
      subscription.unsubscribe();
    };
  }, [credentialDeployment$]);

  useEffect(() => {
    if (!credentialDeployment) {
      return;
    }
    if (credentialDeployment.status === 'in-progress') {
      return;
    }

    setIsWorking(false);

    if (credentialDeployment.status === 'failed') {
      setErrorMessage(
        credentialDeployment.error.message.length ? credentialDeployment.error.message : 'Encountered an unexpected error.',
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
    <Card sx={{ position: 'relative', width: 340, minHeight: 300 }} color="primary">
      {!credentialDeployment$ && (
        <EmptyCardContent onCreateCallback={onCreateCredential} onJoinCallback={onJoinCredential} />
      )}

      {credentialDeployment$ && (
        <React.Fragment>
          <Backdrop
            sx={{ position: 'absolute', color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isWorking}
          >
            <CircularProgress data-testid="credential-working-indicator" />
          </Backdrop>
          <Backdrop
            sx={{ position: 'absolute', color: '#ff0000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={!!errorMessage}
            onClick={() => setErrorMessage(undefined)}
          >
            <StopIcon fontSize="large" />
            <Typography component="div" data-testid="credential-error-message">
              {errorMessage}
            </Typography>
          </Backdrop>
          <CardHeader
            titleTypographyProps={{ color: 'primary', variant: 'body2' }}
            title={toShortFormatContractAddress(deployedAPI?.deployedContractAddress) ?? 'Loading...'}
            action={
              deployedAPI?.deployedContractAddress ? (
                <IconButton title="Copy contract address" onClick={onCopyContractAddress}>
                  <CopyIcon fontSize="small" />
                </IconButton>
              ) : (
                <Skeleton variant="circular" width={20} height={20} />
              )
            }
          />
          <CardContent>
            <Typography variant="overline" color="primary" data-testid="credential-observer-label">
              What a verifier can see
            </Typography>
            {derivedState ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="primary" data-testid="credential-issuer-key">
                  Approved issuer: 0x{toHex(derivedState.issuerKey).slice(0, 12)}...
                </Typography>
                <Typography variant="body2" color="primary" data-testid="credential-count">
                  Credential commitments registered: {derivedState.credentialCount.toString()}
                </Typography>
              </Box>
            ) : (
              <Skeleton variant="rectangular" width={280} height={40} sx={{ mb: 2 }} />
            )}

            <Divider sx={{ my: 1 }} />

            <TextField
              id="threshold-prompt"
              data-testid="credential-threshold-prompt"
              variant="outlined"
              label="Prove score >= threshold"
              focused
              fullWidth
              size="small"
              color="primary"
              type="number"
              slotProps={{ htmlInput: { style: { color: 'black' } } }}
              onChange={(e) => {
                setThresholdInput(e.target.value);
                setEligibleResult(undefined);
              }}
              sx={{ mt: 1, mb: 1 }}
            />
            {eligibleResult !== undefined && (
              <Typography
                variant="body1"
                color={eligibleResult ? 'success.main' : 'error.main'}
                data-testid="credential-eligible-result"
              >
                {eligibleResult ? '✅ Eligible' : '❌ Not eligible'}
              </Typography>
            )}

            <Divider sx={{ my: 1 }} />

            <Button
              size="small"
              startIcon={showPrivateState ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={onTogglePrivateState}
              data-testid="credential-toggle-private-state"
            >
              {showPrivateState ? 'Hide' : 'Debug: show'} my private data
            </Button>
            <Collapse in={showPrivateState}>
              <Box sx={{ p: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 1, mt: 1 }}>
                <Typography variant="caption" sx={{ display: 'block' }} color="warning.main">
                  Never sent on-chain — only visible in this browser session:
                </Typography>
                {privateState ? (
                  <React.Fragment>
                    <Typography variant="caption" sx={{ display: 'block' }} data-testid="private-score">
                      score: {privateState.credential.score.toString()}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }} data-testid="private-salt">
                      salt: 0x{toHex(privateState.credential.salt).slice(0, 16)}...
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }} data-testid="private-owner-key">
                      ownerSecretKey: 0x{toHex(privateState.ownerSecretKey).slice(0, 16)}...
                    </Typography>
                  </React.Fragment>
                ) : (
                  <Typography variant="caption">No private state available.</Typography>
                )}
              </Box>
            </Collapse>
          </CardContent>
          <CardActions>
            {deployedAPI ? (
              <React.Fragment>
                <Button size="small" onClick={onIssueCredential} data-testid="credential-issue-btn">
                  Issue my credential
                </Button>
                <Button
                  size="small"
                  onClick={onProveEligibility}
                  disabled={!thresholdInput.length}
                  data-testid="credential-prove-btn"
                >
                  Prove eligibility
                </Button>
              </React.Fragment>
            ) : (
              <Skeleton variant="rectangular" width={200} height={20} />
            )}
          </CardActions>
        </React.Fragment>
      )}
    </Card>
  );
};

/** @internal */
const toShortFormatContractAddress = (contractAddress: ContractAddress | undefined): React.ReactElement | undefined =>
  contractAddress ? (
    <span data-testid="credential-address">
      0x{contractAddress?.replace(/^[A-Fa-f0-9]{6}([A-Fa-f0-9]{8}).*([A-Fa-f0-9]{8})$/g, '$1...$2')}
    </span>
  ) : undefined;
