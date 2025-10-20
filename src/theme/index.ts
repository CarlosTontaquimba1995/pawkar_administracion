import { createTheme } from '@mui/material/styles';
import { appColors, colorWithOpacity } from './colors';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      colors: typeof appColors;
      colorWithOpacity: typeof colorWithOpacity;
    };
  }
  interface ThemeOptions {
    custom?: {
      colors?: typeof appColors;
      colorWithOpacity?: typeof colorWithOpacity;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: appColors.primary,
      light: appColors.primaryLight,
      dark: appColors.primaryDark,
      contrastText: appColors.white,
    },
    secondary: {
      main: appColors.secondary,
      light: appColors.secondaryLight,
      dark: appColors.secondaryDark,
      contrastText: appColors.white,
    },
    background: {
      default: appColors.background.default,
      paper: appColors.background.paper,
    },
    success: {
      main: appColors.success,
      contrastText: appColors.white,
    },
    error: {
      main: appColors.error,
      contrastText: appColors.white,
    },
    warning: {
      main: appColors.warning,
      contrastText: appColors.white,
    },
    info: {
      main: appColors.info,
      contrastText: appColors.white,
    },
    text: {
      primary: appColors.text.primary,
      secondary: appColors.text.secondary,
      disabled: appColors.text.disabled,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  custom: {
    colors: appColors,
    colorWithOpacity: colorWithOpacity,
  },
});

export default theme;
