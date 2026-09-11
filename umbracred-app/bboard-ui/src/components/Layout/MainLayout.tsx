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

import React from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Provides master layout for the UmbraCred DApp.
 */
export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#070514',
        backgroundImage: `
          radial-gradient(circle at 15% 15%, rgba(124, 92, 255, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 85% 65%, rgba(0, 240, 255, 0.08) 0%, transparent 40%),
          linear-gradient(rgba(124, 92, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124, 92, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
        color: '#f4f1ff',
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

