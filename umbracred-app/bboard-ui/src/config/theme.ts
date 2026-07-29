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

import { createTheme, alpha } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    allVariants: {
      color: '#f2f0ff',
    },
    h1: { fontWeight: 700 },
    overline: { letterSpacing: 1.2, fontWeight: 600 },
  },
  shape: {
    borderRadius: 14,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#9d8cff',
      light: '#c3b8ff',
      dark: '#6f5cd1',
      contrastText: '#100c26',
    },
    secondary: {
      main: '#3fe3c9',
    },
    success: {
      main: '#3ddc84',
    },
    error: {
      main: '#ff6b7a',
    },
    warning: {
      main: '#ffb454',
    },
    background: {
      default: '#0e0b21',
      paper: '#1b1640',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1b1640',
          backgroundImage: `linear-gradient(160deg, ${alpha('#9d8cff', 0.12)}, transparent 60%)`,
          border: `1px solid ${alpha('#9d8cff', 0.25)}`,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: alpha('#9d8cff', 0.4),
        },
      },
    },
  },
});
