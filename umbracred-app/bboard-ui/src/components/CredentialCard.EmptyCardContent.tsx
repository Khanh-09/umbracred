import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { CardActions, CardContent, IconButton, Tooltip, Typography } from '@mui/material';
import AddCredentialIcon from '@mui/icons-material/PostAddOutlined';
import CreateIcon from '@mui/icons-material/AddCircleOutlined';
import JoinIcon from '@mui/icons-material/AddLinkOutlined';
import { TextPromptDialog } from './TextPromptDialog';

/**
 * The props required by the {@link EmptyCardContent} component.
 *
 * @internal
 */
export interface EmptyCardContentProps {
  /** A callback that will be called (with a credential score) to deploy a new UmbraCred contract. */
  onCreateCallback: (score: string) => void;
  /** A callback that will be called to join an existing UmbraCred contract. */
  onJoinCallback: (contractAddress: ContractAddress) => void;
}

/**
 * Used when there is no contract deployment to render a UI allowing the user to deploy or join an
 * UmbraCred contract.
 *
 * @internal
 */
export const EmptyCardContent: React.FC<Readonly<EmptyCardContentProps>> = ({ onCreateCallback, onJoinCallback }) => {
  const [scorePromptOpen, setScorePromptOpen] = useState(false);
  const [addressPromptOpen, setAddressPromptOpen] = useState(false);

  return (
    <React.Fragment>
      <CardContent>
        <Typography align="center" variant="h1" color="primary.dark">
          <AddCredentialIcon fontSize="large" />
        </Typography>
        <Typography align="center" variant="body2" color="primary.dark">
          Deploy a new UmbraCred contract, or join an existing one...
        </Typography>
      </CardContent>
      <CardActions disableSpacing sx={{ justifyContent: 'center' }}>
        <Tooltip title="Deploy a new contract (you become the approved issuer)">
          <IconButton
            data-testid="credential-deploy-btn"
            onClick={() => {
              setScorePromptOpen(true);
            }}
          >
            <CreateIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Join an existing contract">
          <IconButton
            data-testid="credential-join-btn"
            onClick={() => {
              setAddressPromptOpen(true);
            }}
          >
            <JoinIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
      <TextPromptDialog
        prompt="What score should your credential have? (0-65535)"
        isOpen={scorePromptOpen}
        onCancel={() => {
          setScorePromptOpen(false);
        }}
        onSubmit={(text) => {
          setScorePromptOpen(false);
          onCreateCallback(text);
        }}
      />
      <TextPromptDialog
        prompt="Enter contract address"
        isOpen={addressPromptOpen}
        onCancel={() => {
          setAddressPromptOpen(false);
        }}
        onSubmit={(text) => {
          setAddressPromptOpen(false);
          onJoinCallback(text);
        }}
      />
    </React.Fragment>
  );
};
