import { createTheme, alpha } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    overline: {
      fontFamily: '"JetBrains Mono", monospace',
      letterSpacing: '0.12em',
      fontWeight: 700,
      textTransform: 'uppercase',
    },
    button: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
    body1: {
      color: '#dcd6fa',
    },
    body2: {
      color: '#b0a6e0',
    },
  },
  shape: {
    borderRadius: 16,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c5cff',
      light: '#a48eff',
      dark: '#5436d6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00f0ff',
      light: '#6effff',
      dark: '#00a8b3',
      contrastText: '#080712',
    },
    success: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
    },
    error: {
      main: '#ff3d71',
      light: '#ff7092',
      dark: '#c40046',
    },
    warning: {
      main: '#ffaa00',
      light: '#ffc94d',
      dark: '#c68400',
    },
    background: {
      default: '#070514',
      paper: '#110d28',
    },
    text: {
      primary: '#f4f1ff',
      secondary: '#9e93cc',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#070514',
          scrollbarColor: '#7c5cff #070514',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: '#070514',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            background: 'rgba(124, 92, 255, 0.4)',
            borderRadius: 4,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 13, 40, 0.75)',
          backdropFilter: 'blur(16px)',
          backgroundImage: 'linear-gradient(145deg, rgba(124, 92, 255, 0.08) 0%, rgba(0, 240, 255, 0.03) 100%)',
          border: '1px solid rgba(124, 92, 255, 0.22)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: 'rgba(124, 92, 255, 0.45)',
            boxShadow: '0 25px 60px rgba(124, 92, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 22px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'all 0.25s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c5cff 0%, #583be8 100%)',
          boxShadow: '0 8px 24px rgba(124, 92, 255, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8f72ff 0%, #684bf5 100%)',
            boxShadow: '0 12px 30px rgba(124, 92, 255, 0.55)',
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
          color: '#080712',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0, 240, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #33f3ff 0%, #00c2e8 100%)',
            boxShadow: '0 12px 30px rgba(0, 240, 255, 0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(124, 92, 255, 0.35)',
          '&:hover': {
            borderColor: '#7c5cff',
            backgroundColor: 'rgba(124, 92, 255, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(10, 8, 25, 0.6)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(124, 92, 255, 0.25)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(124, 92, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7c5cff',
            boxShadow: '0 0 0 3px rgba(124, 92, 255, 0.2)',
          },
        },
      },
    },
  },
});
