import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { appColors as defaultColors, colorWithOpacity } from "@/theme/colors";

interface ThemeContextType {
  colors: typeof defaultColors;
  updateColors: (newColors: Partial<typeof defaultColors>) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState(() => {
    // Try to load saved theme from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("appTheme");
      return savedTheme ? JSON.parse(savedTheme) : defaultColors;
    }
    return defaultColors;
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("appTheme", JSON.stringify(colors));
  }, [colors]);

  const updateColors = (newColors: Partial<typeof defaultColors>) => {
    setColors((prev: typeof defaultColors) => ({
      ...prev,
      ...newColors,
      background: { ...prev.background, ...newColors.background },
      text: { ...prev.text, ...newColors.text },
      gradients: { ...prev.gradients, ...newColors.gradients },
    }));
  };

  const resetColors = () => {
    setColors(defaultColors);
  };

  // Create theme with current colors
  const theme = createTheme({
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
