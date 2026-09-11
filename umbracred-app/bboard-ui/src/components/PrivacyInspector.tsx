import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';

export const PrivacyInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Chip
          icon={<CodeIcon sx={{ fontSize: '1rem !important', color: '#7c5cff !important' }} />}
          label="Zero-Knowledge Architecture"
          size="small"
          sx={{
            background: 'rgba(124, 92, 255, 0.1)',
            border: '1px solid rgba(124, 92, 255, 0.3)',
            color: '#d7cfff',
            fontFamily: '"JetBrains Mono", monospace',
            mb: 1.5,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
          Interactive Privacy & Disclosure Inspector
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(215, 207, 255, 0.75)', maxWidth: 680, mx: 'auto' }}>
          Explore the exact boundary between Midnight’s public on-chain ledger and off-chain private witness data.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          background: 'rgba(17, 13, 40, 0.85)',
          border: '1px solid rgba(124, 92, 255, 0.25)',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: '1px solid rgba(124, 92, 255, 0.2)',
            px: 3,
            pt: 1,
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'rgba(215, 207, 255, 0.6)',
              '&.Mui-selected': { color: '#00f0ff' },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00f0ff',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab label="State Separation (Public vs Private)" />
          <Tab label="Circuit: proveEligibility()" />
          <Tab label="Circuit: issueCredential()" />
          <Tab label="ZK Sequence Flow" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Card
                sx={{
                  background: 'rgba(0, 240, 255, 0.04)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <VisibilityIcon sx={{ color: '#00f0ff', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ color: '#00f0ff', fontWeight: 700 }}>
                      Public On-Chain Ledger State
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(215, 207, 255, 0.8)', mb: 3 }}>
                    Stored permanently on Midnight’s public ledger. Visible to any validator or verifier.
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                      <Typography variant="caption" sx={{ color: '#00f0ff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                        export ledger issuerKey: Bytes&lt;32&gt;;
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0a6e0', mt: 0.5 }}>
                        Public cryptographic key of the accredited issuing organization.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                      <Typography variant="caption" sx={{ color: '#00f0ff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                        export ledger credentials: Set&lt;Bytes&lt;32&gt;&gt;;
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0a6e0', mt: 0.5 }}>
                        Set of opaque 32-byte commitment hashes. No score, salt, or holder names are visible.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                      <Typography variant="caption" sx={{ color: '#00f0ff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                        disclose(cred.score &gt;= threshold) -&gt; Boolean
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0a6e0', mt: 0.5 }}>
                        The sole public output of a verification transaction: true or false.
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: 'rgba(124, 92, 255, 0.05)',
                  border: '1px solid rgba(124, 92, 255, 0.35)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <VisibilityOffIcon sx={{ color: '#a48eff', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ color: '#a48eff', fontWeight: 700 }}>
                      Private Off-Chain Witnesses (100% Confidential)
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(215, 207, 255, 0.8)', mb: 3 }}>
                    Resides exclusively in local browser/wallet memory. Never broadcast to the network.
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, border: '1px solid rgba(124, 92, 255, 0.2)' }}>
                      <Typography variant="caption" sx={{ color: '#a48eff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                        witness localCredential(): Credential &#123; score, salt &#125;;
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0a6e0', mt: 0.5 }}>
                        The real raw score (e.g. 85/100) and random 32-byte salt protecting preimage security.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, border: '1px solid rgba(124, 92, 255, 0.2)' }}>
                      <Typography variant="caption" sx={{ color: '#a48eff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                        witness localOwnerSecretKey(): Bytes&lt;32&gt;;
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0a6e0', mt: 0.5 }}>
                        The holder's secret key proving exclusive ownership over the commitment.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, background: 'rgba(0, 0, 0, 0.3)', borderRadius: 2, border: '1px solid rgba(124, 92, 255, 0.2)' }}>
                      <Typography variant="caption" sx={{ color: '#a48eff', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
                        witness localIssuerSecretKey(): Bytes&lt;32&gt;;
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#b0a6e0', mt: 0.5 }}>
                        The issuer's signing secret key; only authorized issuers can mint new commitments.
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#00f0ff', fontWeight: 700, mb: 1 }}>
                Selective Disclosure Circuit: proveEligibility()
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0a6e0', mb: 3 }}>
                Notice how <code style={{ color: '#00f0ff' }}>disclose()</code> is deliberately wrapped around the boolean comparison, preventing any score value leakage.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: '#0a0818',
                  border: '1px solid rgba(124, 92, 255, 0.25)',
                  borderRadius: 3,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  color: '#e2dcff',
                  overflowX: 'auto',
                }}
              >
                <div><span style={{ color: '#7c5cff' }}>export circuit</span> <span style={{ color: '#00f0ff' }}>proveEligibility</span>(threshold: <span style={{ color: '#ffaa00' }}>Uint&lt;16&gt;</span>): <span style={{ color: '#ffaa00' }}>Boolean</span> &#123;</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#9e93cc' }}>// 1. Fetch private witnesses locally</span></div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#7c5cff' }}>const</span> cred = <span style={{ color: '#00f0ff' }}>localCredential</span>();</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#7c5cff' }}>const</span> ownerKey = <span style={{ color: '#00f0ff' }}>localOwnerSecretKey</span>();</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#9e93cc' }}>// 2. Cryptographically re-derive commitment hash</span></div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#7c5cff' }}>const</span> commitment = <span style={{ color: '#00f0ff' }}>credentialCommitment</span>(cred, ownerKey);</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#9e93cc' }}>// 3. Verify commitment exists on public ledger</span></div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#ff3d71' }}>assert</span>(credentials.<span style={{ color: '#00f0ff' }}>member</span>(<span style={{ color: '#00e676' }}>disclose</span>(commitment)), <span style={{ color: '#ffc94d' }}>"Credential commitment not found"</span>);</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#9e93cc' }}>// 4. Return ONLY the boolean evaluation - score never leaves circuit!</span></div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#7c5cff' }}>return</span> <span style={{ color: '#00e676', fontWeight: 'bold' }}>disclose</span>(cred.score &gt;= threshold);</div>
                <div>&#125;</div>
              </Paper>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#00f0ff', fontWeight: 700, mb: 1 }}>
                Issuance Circuit: issueCredential()
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0a6e0', mb: 3 }}>
                The issuer registers an opaque hash on the ledger. Only the accredited authority whose secret key matches <code style={{ color: '#00f0ff' }}>issuerKey</code> can register commitments.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: '#0a0818',
                  border: '1px solid rgba(124, 92, 255, 0.25)',
                  borderRadius: 3,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  color: '#e2dcff',
                  overflowX: 'auto',
                }}
              >
                <div><span style={{ color: '#7c5cff' }}>export circuit</span> <span style={{ color: '#00f0ff' }}>issueCredential</span>(commitment: <span style={{ color: '#ffaa00' }}>Bytes&lt;32&gt;</span>): [] &#123;</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#9e93cc' }}>// 1. Authenticate issuer secret key against registered issuerKey</span></div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#ff3d71' }}>assert</span>(</div>
                <div style={{ paddingLeft: '48px' }}>issuerKey == <span style={{ color: '#00f0ff' }}>issuerPublicKey</span>(<span style={{ color: '#00f0ff' }}>localIssuerSecretKey</span>()),</div>
                <div style={{ paddingLeft: '48px' }}><span style={{ color: '#ffc94d' }}>"Only the approved issuer can issue a credential"</span></div>
                <div style={{ paddingLeft: '24px' }}>);</div>
                <div style={{ paddingLeft: '24px' }}><span style={{ color: '#9e93cc' }}>// 2. Insert opaque commitment hash into public ledger set</span></div>
                <div style={{ paddingLeft: '24px' }}>credentials.<span style={{ color: '#00f0ff' }}>insert</span>(<span style={{ color: '#00e676', fontWeight: 'bold' }}>disclose</span>(commitment));</div>
                <div>&#125;</div>
              </Paper>
            </Box>
          )}

          {activeTab === 3 && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: '#7c5cff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  1
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Off-Chain Commitment Generation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0a6e0' }}>
                    Issuer computes <code style={{ color: '#00f0ff' }}>commitment = hash(tag, ownerKey, salt, score)</code>. Only this hash is broadcast to Midnight.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: '#7c5cff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  2
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    Local Zero-Knowledge Proving
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0a6e0' }}>
                    Holder runs <code style={{ color: '#00f0ff' }}>proveEligibility(threshold)</code> against their local Midnight Proof Server container.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: '#00e676', color: '#080712', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  3
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    On-Chain Verification & Finality
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0a6e0' }}>
                    Midnight consensus verifies the zk-SNARK proof. The verifier receives an infallible attestation that the credential meets the threshold.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </Box>
      </Paper>
    </Container>
  );
};
