import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { appColors as defaultColors, colorWithOpacity } from "@/theme/colors";
import configuracionService from "@/api/configuracionService";
import { UpdateConfiguracionRequest } from "@/types/configuracion.types";
import { Box, CircularProgress } from "@mui/material";

interface ThemeContextType {
  colors: typeof defaultColors;
  updateColors: (newColors: Partial<typeof defaultColors>) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<typeof defaultColors>(defaultColors);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await configuracionService.getConfiguracion();
        if (response.success && response.data) {
          const { primario, secundario, acento1, acento2 } = response.data;
          setColors((prevColors) => ({
            ...prevColors,
            primary: primario,
            secondary: secundario,
            accent1: acento1,
            accent2: acento2,
          }));
        } else {
          // Fallback to default colors if no theme is saved
          setColors(defaultColors);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
        setColors(defaultColors);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const updateColors = useCallback(
    async (newColors: Partial<typeof defaultColors>) => {
      try {
        // Update local state immediately for better UX
        setColors((prev: typeof defaultColors) => ({
          ...prev,
          ...newColors,
          background: { ...prev.background, ...newColors.background },
          text: { ...prev.text, ...newColors.text },
          gradients: { ...prev.gradients, ...newColors.gradients },
        }));

        // Prepare the update request
        const updateData: UpdateConfiguracionRequest = {
          primario: newColors.primary || defaultColors.primary,
          secundario: newColors.secondary || defaultColors.secondary,
          acento1: newColors.accent1 || defaultColors.accent1,
          acento2: newColors.accent2 || defaultColors.accent2,
        };

        // Save to backend
        await configuracionService.updateConfiguracion(updateData);
      } catch (error) {
        console.error("Error updating theme configuration:", error);
        throw error;
      }
    },
    []
  );

  const resetColors = useCallback(async () => {
    try {
      // Reset to default colors
      setColors(defaultColors);

      // Update backend with default colors
      const updateData: UpdateConfiguracionRequest = {
        primario: defaultColors.primary,
        secundario: defaultColors.secondary,
        acento1: defaultColors.accent1,
        acento2: defaultColors.accent2,
      };

      await configuracionService.updateConfiguracion(updateData);
    } catch (error) {
      console.error("Error resetting theme:", error);
      throw error;
    }
  }, []);

  // Create theme with current colors
  const theme = createTheme({
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          variant: "contained",
          color: "primary",
        },
        styleOverrides: {
          // Base styles for all buttons
          root: {
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "none",
              transform: "translateY(-1px)",
            },
            "&.Mui-disabled": {
              backgroundColor: "action.disabledBackground",
              color: "action.disabled",
            },
          },
          // Contained buttons (primary action)
          contained: {
            backgroundColor: colors.primary,
            color: colors.white,
            "&:hover": {
              backgroundColor: colors.secondary,
              color: colors.white,
            },
            "&.MuiButton-containedPrimary": {
              "&:hover": {
                backgroundColor: colors.secondary,
              },
            },
            "&.MuiButton-containedSecondary": {
              "&:hover": {
                backgroundColor: colors.primary,
              },
            },
          },
          // Outlined buttons
          outlined: {
            borderColor: colors.primary,
            color: colors.primary,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "transparent",
              borderColor: colors.secondary,
              color: colors.secondary,
            },
          },
          // Text buttons
          text: {
            color: colors.primary,
            "&:hover": {
              backgroundColor: colorWithOpacity.primary[10],
              color: colors.secondary,
            },
          },
        },
      },
    },
    palette: {
      gradients: {
        primary: colors.gradients.primary,
        secondary: colors.gradients.secondary,
        accent: colors.gradients.accent,
        soft: colors.gradients.soft,
      },
      primary: {
        main: colors.primary,
        light: colors.primaryLight,
        dark: colors.primaryDark,
        contrastText: colors.white,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondaryLight,
        dark: colors.secondaryDark,
        contrastText: colors.white,
      },
      success: { main: colors.success },
      error: { main: colors.error },
      warning: { main: colors.warning },
      info: { main: colors.info },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
    },
    custom: {
      colors,
      colorWithOpacity,
    },
  });

  // Show loading state while theme is being loaded
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeContext.Provider value={{ colors, updateColors, resetColors }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeConfig = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
