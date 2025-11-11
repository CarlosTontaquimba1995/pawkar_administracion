import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  ColorLens as ColorLensIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import { useThemeConfig } from "@/contexts/ThemeContext";

// Simple color picker component to avoid external dependencies
const ColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        onClick={() => setShowPicker(!showPicker)}
        sx={{
          width: 30,
          height: 30,
          borderRadius: "4px",
          bgcolor: color,
          border: "1px solid rgba(0,0,0,0.2)",
          cursor: "pointer",
          "&:hover": {
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          },
        }}
      />
      {showPicker && (
        <Box
          sx={{
            position: "absolute",
            zIndex: 1,
            top: 40,
            left: 0,
            bgcolor: "background.paper",
            p: 1,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            style={{ width: "100%", height: 40, border: "none" }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              marginTop: 8,
              padding: 4,
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

interface ThemeConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const ThemeConfigDialog = ({ open, onClose }: ThemeConfigDialogProps) => {
  const { colors, updateColors, resetColors } = useThemeConfig();
  const [localColors, setLocalColors] = useState({
    primary: colors.primary,
    secondary: colors.secondary,
    accent1: colors.accent1,
    accent2: colors.accent2,
    background: colors.background.default,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
  });

  // Update local colors when theme changes
  useEffect(() => {
    setLocalColors({
      primary: colors.primary,
      secondary: colors.secondary,
      accent1: colors.accent1,
      accent2: colors.accent2,
      background:
        typeof colors.background === "string"
          ? colors.background
          : colors.background.default,
      textPrimary:
        typeof colors.text === "string" ? colors.text : colors.text.primary,
      textSecondary:
        typeof colors.text === "string" ? colors.text : colors.text.secondary,
    });
  }, [colors]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    if (open) {
      setLocalColors({
        primary: colors.primary,
        secondary: colors.secondary,
        accent1: colors.accent1,
        accent2: colors.accent2,
        background: colors.background.default,
        textPrimary: colors.text.primary,
        textSecondary: colors.text.secondary,
      });
    }
  }, [open, colors]);

  const handleColorChange = (field: string, value: string) => {
    setLocalColors((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    try {
      // Create a new colors object with the updated values
      const updatedColors = {
        ...colors,
        primary: localColors.primary,
        secondary: localColors.secondary,
        accent1: localColors.accent1,
        accent2: localColors.accent2,
        background: {
          default: localColors.background,
          paper: colors.background.paper || "#FFFFFF",
          dark: colors.background.dark || "#121212",
          light: colors.background.light || "#F5F5F5",
        },
        text: {
          primary: localColors.textPrimary,
          secondary: localColors.textSecondary,
          disabled: colors.text?.disabled || "rgba(0, 0, 0, 0.38)",
          white: colors.text?.white || "#FFFFFF",
          onPrimary: colors.text?.onPrimary || "#FFFFFF",
          onSecondary: colors.text?.onSecondary || "#FFFFFF",
        },
        gradients: colors.gradients || {
          primary: `linear-gradient(135deg, ${localColors.primary} 0%, ${localColors.primary}80 100%)`,
          secondary: `linear-gradient(135deg, ${localColors.secondary} 0%, ${localColors.secondary}80 100%)`,
          accent: `linear-gradient(135deg, ${localColors.accent1} 0%, ${localColors.accent2} 100%)`,
          soft: `linear-gradient(135deg, #F5F3F8 0%, #FFFFFF 100%)`,
        },
      };

      updateColors(updatedColors);
      setSnackbarMessage("Tema guardado correctamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error("Error saving theme:", error);
      setSnackbarMessage("Error al guardar el tema");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleReset = () => {
    resetColors();
    setSnackbarMessage("Tema restablecido a los valores predeterminados");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    onClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const colorFields = [
    { id: "primary", label: "Color Primario", value: localColors.primary },
    {
      id: "secondary",
      label: "Color Secundario",
      value: localColors.secondary,
    },
    { id: "accent1", label: "Acento 1", value: localColors.accent1 },
    { id: "accent2", label: "Acento 2", value: localColors.accent2 },
  ];

  const otherFields = [
    { id: "background", label: "Fondo", value: localColors.background },
    {
      id: "textPrimary",
      label: "Texto Principal",
      value: localColors.textPrimary,
    },
    {
      id: "textSecondary",
      label: "Texto Secundario",
      value: localColors.textSecondary,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Configuración del Tema</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ minWidth: 500, overflow: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <Typography variant="subtitle1" gutterBottom>
              Colores Principales
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {colorFields.map((field) => (
                <Box
                  key={field.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {field.label}
                  </Typography>
                  <ColorPicker
                    color={
                      typeof colors[field.id as keyof typeof colors] ===
                      "string"
                        ? (colors[field.id as keyof typeof colors] as string)
                        : (
                            colors[field.id as keyof typeof colors] as {
                              default?: string;
                            }
                          )?.default || "#000000"
                    }
                    onChange={(color) => handleColorChange(field.id, color)}
                  />
                </Box>
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Otros Colores
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {otherFields.map((field) => (
                <Box
                  key={field.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {field.label}
                  </Typography>
                  <ColorPicker
                    color={(() => {
                      const colorValue =
                        colors[field.id as keyof typeof colors];
                      if (typeof colorValue === "string") {
                        return colorValue;
                      } else if (
                        colorValue &&
                        typeof colorValue === "object" &&
                        "default" in colorValue
                      ) {
                        return colorValue.default;
                      }
                      return "#000000";
                    })()}
                    onChange={(color) => handleColorChange(field.id, color)}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            <Typography variant="subtitle1" gutterBottom>
              Vista Previa
            </Typography>
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "background.paper",
                color: "text.primary",
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ color: colors.primary }}>
                Título Principal
              </Typography>
              <Typography variant="body1">
                Este es un texto de ejemplo para mostrar el color de texto
                principal.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este es un texto secundario con un color más claro.
              </Typography>

              <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: colors.primary,
                    "&:hover": { bgcolor: `${colors.primary}CC` },
                  }}
                >
                  Botón Primario
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    color: colors.secondary,
                    borderColor: colors.secondary,
                    "&:hover": {
                      borderColor: `${colors.secondary}CC`,
                      bgcolor: `${colors.secondary}10`,
                    },
                  }}
                >
                  Botón Secundario
                </Button>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "rgba(0,0,0,0.05)",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.secondary, mb: 1 }}
                >
                  Tarjeta de Ejemplo
                </Typography>
                <Typography variant="body2">
                  Este es un ejemplo de un componente de tarjeta con colores
                  personalizados.
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: "auto",
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  Vista previa en tiempo real
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button onClick={handleReset} startIcon={<ResetIcon />} color="inherit">
          Restablecer
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<ColorLensIcon />}
          >
            Aplicar Tema
          </Button>
        </Box>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ThemeConfigDialog;
