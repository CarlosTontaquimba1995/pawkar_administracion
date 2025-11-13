import { useState } from "react";
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
  Paper,
  Divider,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  alpha,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  RestartAlt as ResetIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  ColorLens as ColorLensIcon,
} from "@mui/icons-material";
import { useThemeConfig } from "@/contexts/ThemeContext";

interface ColorField {
  id: string;
  label: string;
  value: string;
}

interface ThemeConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const ThemeConfigDialog = ({ open, onClose }: ThemeConfigDialogProps) => {
  const theme = useTheme();
  const { colors, updateColors, resetColors } = useThemeConfig();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [activeTab, setActiveTab] = useState("colors");

  const handleColorChange = (id: string, color: string) => {
    updateColors({ [id]: color });
  };

  const handleSave = () => {
    setSnackbarMessage("Tema guardado exitosamente");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    onClose();
  };

  const handleReset = () => {
    resetColors();
    setSnackbarMessage("Tema restablecido a los valores predeterminados");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };


  const colorFields: ColorField[] = [
    { id: "primary", label: "Primario", value: colors.primary as string },
    { id: "secondary", label: "Secundario", value: colors.secondary as string },
    { id: "accent1", label: "Acento 1", value: colors.accent1 as string },
    { id: "accent2", label: "Acento 2", value: colors.accent2 as string },
  ];

  const otherFields: ColorField[] = [
    {
      id: "text.primary",
      label: "Texto Principal",
      value: (colors.text as any)?.primary || "#000000",
    },
    {
      id: "text.secondary",
      label: "Texto Secundario",
      value: (colors.text as any)?.secondary || "#666666",
    },
    {
      id: "background.default",
      label: "Fondo",
      value: (colors.background as any)?.default || "#ffffff",
    },
    {
      id: "background.paper",
      label: "Superficie",
      value: (colors.background as any)?.paper || "#f5f5f5",
    },
  ];

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setSnackbarMessage(`Color copiado: ${color}`);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: 24,
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          width: { xs: '98vw', sm: '95vw', md: '90vw', lg: '85vw' },
          maxWidth: 1400,
          m: 1,
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            p: 2,
          },
        },
      }}
      TransitionProps={{ timeout: 200 }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'background.default',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <PaletteIcon color="primary" />
          <Typography variant="h6" component="div">
            Personalizar Tema
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            width: '100%',
            maxHeight: 'calc(95vh - 150px)',
            overflow: 'hidden',
            '& > *': {
              flex: '1 1 auto',
              overflow: 'hidden',
              minWidth: 0,
            },
          }}
        >
          {/* Sidebar de navegación */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflow: 'hidden',
              borderRight: '1px solid',
              borderColor: { xs: 'divider', sm: 'divider' },
              maxWidth: { xs: '100%', sm: 300 },
              minWidth: { xs: '100%', sm: 250 },
              borderBottom: { xs: '1px solid', sm: 'none' },
            }}
          >
            <List disablePadding sx={{ p: 1.5 }}>
              <ListItemButton
                selected={activeTab === "colors"}
                onClick={() => setActiveTab("colors")}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1.5,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  <PaletteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Colores"
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                />
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    opacity: activeTab === 'colors' ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                    ml: 1,
                  }}
                />
              </ListItemButton>
              <ListItemButton
                selected={activeTab === "typography"}
                onClick={() => setActiveTab("typography")}
                disabled
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  opacity: 0.6,
                  '&:hover': {
                    bgcolor: 'transparent',
                    cursor: 'not-allowed',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <TextFieldsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>Tipografía</span>
                      <Box
                        sx={{
                          ml: 1,
                          fontSize: 10,
                          fontWeight: 600,
                          bgcolor: 'divider',
                          color: 'text.secondary',
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 4,
                          lineHeight: 1.2,
                        }}
                      >
                        Próximamente
                      </Box>
                    </Box>
                  }
                  primaryTypographyProps={{
                    variant: "body2",
                    color: 'text.secondary',
                  }}
                />
              </ListItemButton>
            </List>
          </Box>

          {/* Contenido principal */}
          <Box sx={{ 
            flex: 1, 
            p: { xs: 1.5, sm: 2, md: 3 },
            overflowY: "auto",
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100%',
            '& > *': {
              minWidth: 0, // Evita desbordamiento horizontal
            },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.divider,
              borderRadius: '3px',
              '&:hover': {
                background: theme.palette.text.secondary,
              },
            },
          }}>
            {activeTab === "colors" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", lg: "row" },
                  gap: { xs: 2, md: 3 },
                  width: '100%',
                  '& > *': {
                    flex: 1,
                    minWidth: 0, // Evita desbordamiento
                  },
                }}
              >
                <Box sx={{
                  width: '100%',
                  flex: '1 1 50%',
                  minWidth: 0, // Asegura que el contenido no desborde
                  pr: { md: 1.5 },
                  '& > *': {
                    maxWidth: '100%',
                  },
                }}>
                  <Card
                    variant="outlined"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      borderColor: "divider",
                      boxShadow: "none",
                    }}
                  >
                    <CardHeader
                      title="Colores Principales"
                      titleTypographyProps={{
                        variant: "subtitle1",
                        fontWeight: "600",
                      }}
                      sx={{ pb: 1, px: 2.5, pt: 2.5 }}
                    />
                    <CardContent sx={{ pt: 0, px: 2.5, pb: "16px !important" }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        {colorFields.map((field) => (
                          <Box
                            key={field.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              mb: 1.5,
                              p: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight="500"
                                sx={{ mb: 0.5 }}
                              >
                                {field.label}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "4px",
                                    bgcolor: field.value,
                                    border: "1px solid",
                                    borderColor: "divider",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: 11,
                                    bgcolor: 'action.selected',
                                    px: 0.75,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                    color: 'text.secondary',
                                  }}
                                >
                                  {field.value.toUpperCase()}
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Tooltip title="Cambiar color">
                                <Box
                                  sx={{
                                    position: 'relative',
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box
                                    component="input"
                                    type="color"
                                    value={field.value}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                      handleColorChange(field.id, e.target.value)
                                    }
                                    style={{
                                      position: "absolute",
                                      width: "100%",
                                      height: "100%",
                                      opacity: 0,
                                      cursor: "pointer",
                                      zIndex: 2,
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      width: '100%',
                                      height: '100%',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      backgroundColor: field.value,
                                      borderRadius: 'inherit',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: `0 4px 12px ${alpha(field.value, 0.3)}`,
                                        borderColor: 'primary.main',
                                      },
                                      '&:active': {
                                        transform: 'scale(0.98)',
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.2) 100%)',
                                        opacity: 0.5,
                                        pointerEvents: 'none',
                                      }}
                                    />
                                    <ColorLensIcon
                                      fontSize="small"
                                      sx={{
                                        color: "common.white",
                                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                                        position: 'relative',
                                        zIndex: 1,
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Tooltip>
                              <Tooltip title="Copiar color">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    copyToClipboard(field.value)
                                  }
                                  sx={{
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                    },
                                  }}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: "divider",
                      boxShadow: "none",
                    }}
                  >
                    <CardHeader
                      title="Colores de Texto y Fondo"
                      titleTypographyProps={{
                        variant: "subtitle1",
                        fontWeight: "600",
                      }}
                      sx={{ pb: 1, px: 2.5, pt: 2.5 }}
                    />
                    <CardContent sx={{ pt: 0, px: 2.5, pb: "16px !important" }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        {otherFields.map((field) => {
                          const currentColor = (() => {
                            const colorValue =
                              colors[
                                field.id.split(".")[0] as keyof typeof colors
                              ];
                            if (typeof colorValue === "string") {
                              return colorValue;
                            } else if (
                              colorValue &&
                              typeof colorValue === "object" &&
                              field.id.split(".")[1] in colorValue
                            ) {
                              return (colorValue as any)[
                                field.id.split(".")[1]
                              ];
                            }
                            return "#000000";
                          })();

                          return (
                            <Box
                              key={field.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                mb: 1.5,
                                p: 0.5,
                                borderRadius: 1,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight="500"
                                  sx={{ mb: 0.5 }}
                                >
                                  {field.label}
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "4px",
                                      bgcolor: currentColor,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      bgcolor: 'action.selected',
                                      px: 0.75,
                                      py: 0.25,
                                      borderRadius: 0.5,
                                      color: 'text.secondary',
                                    }}
                                  >
                                    {currentColor.toUpperCase()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                  sx={{
                                    position: 'relative',
                                    width: 36,
                                    height: 36,
                                    mr: 1,
                                  }}
                                >
                                  <Box
                                    component="input"
                                    type="color"
                                    value={currentColor}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                      handleColorChange(
                                        field.id.split(".")[0],
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      position: "absolute",
                                      width: "100%",
                                      height: "100%",
                                      opacity: 0,
                                      cursor: "pointer",
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      backgroundColor: currentColor,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                                      },
                                    }}
                                  >
                                    <ColorLensIcon
                                      fontSize="small"
                                      sx={{
                                        color: "white",
                                        filter:
                                          "drop-shadow(0 0 1px rgba(0,0,0,0.5))",
                                        opacity: 0.8,
                                      }}
                                    />
                                  </Box>
                                </Box>
                                <Tooltip title="Copiar color">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      copyToClipboard(currentColor)
                                    }
                                    sx={{
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{
                  width: '100%',
                  flex: '1 1 50%',
                  minWidth: 0, // Asegura que el contenido no desborde
                  pr: { md: 1.5 },
                  '& > *': {
                    maxWidth: '100%',
                  },
                }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      borderColor: "divider",
                      boxShadow: "none",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardHeader
                      title={
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          color="text.primary"
                        >
                          <CheckCircleIcon color="primary" fontSize="small" />
                          <span>Vista Previa</span>
                        </Box>
                      }
                      titleTypographyProps={{
                        variant: "subtitle1",
                        fontWeight: "600",
                      }}
                      sx={{ pb: 1, px: 2.5, pt: 2.5 }}
                    />
                    <CardContent
                      sx={{
                        flex: 1,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          p: 3,
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          color: "text.primary",
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2.5,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "primary.main",
                              fontWeight: "700",
                              mb: 1,
                            }}
                          >
                            Título Principal
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ mb: 2, lineHeight: 1.6 }}
                          >
                            Este es un texto de ejemplo para mostrar el color de
                            texto principal.
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.6 }}
                          >
                            Este es un texto secundario con un color más claro
                            que se utiliza para información adicional.
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CheckCircleIcon />}
                            sx={{
                              textTransform: "none",
                              fontWeight: "500",
                              borderRadius: 2,
                              boxShadow: "none",
                              "&:hover": {
                                boxShadow: `0 4px 12px ${alpha(
                                  colors.primary as string,
                                  0.2
                                )}`,
                              },
                            }}
                          >
                            Acción Principal
                          </Button>

                          <Button
                            variant="outlined"
                            color="secondary"
                            sx={{
                              textTransform: "none",
                              fontWeight: "500",
                              borderRadius: 2,
                              borderWidth: 1.5,
                              "&:hover": {
                                borderWidth: 1.5,
                              },
                            }}
                          >
                            Acción Secundaria
                          </Button>
                        </Box>

                        <Paper
                          elevation={0}
                          sx={{
                            mt: 2,
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: "primary.main",
                              boxShadow: `0 4px 12px ${alpha(
                                colors.primary as string,
                                0.08
                              )}`,
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" mb={1}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                bgcolor: "primary.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "primary.contrastText",
                                mr: 2,
                                flexShrink: 0,
                              }}
                            >
                              <PaletteIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight="600"
                                sx={{ color: "text.primary" }}
                              >
                                Tarjeta de Ejemplo
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Personaliza los colores a tu gusto
                              </Typography>
                            </Box>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, pl: 6, color: "text.secondary" }}
                          >
                            Los cambios se aplicarán en tiempo real a medida que
                            ajustas los colores.
                          </Typography>
                        </Paper>

                        <Box
                          sx={{
                            mt: "auto",
                            pt: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              fontSize: "0.7rem",
                              color: "text.secondary",
                            }}
                          >
                            <CheckCircleIcon
                              color="primary"
                              fontSize="inherit"
                            />
                            Vista previa en tiempo real
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {["primary", "secondary", "accent1", "accent2"].map(
                              (color) => (
                                <Box
                                  key={color}
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "2px",
                                    bgcolor: `${
                                      colors[color as keyof typeof colors]
                                    }`,
                                    border: "1px solid",
                                    borderColor: "divider",
                                  }}
                                />
                              )
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Tooltip title="Restablecer a los valores por defecto">
          <Button
            onClick={handleReset}
            startIcon={<ResetIcon />}
            color="inherit"
            sx={{
              textTransform: "none",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            Restablecer
          </Button>
        </Tooltip>
        <Box display="flex" gap={1}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: "none",
              px: 2,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<ColorLensIcon />}
            sx={{
              textTransform: "none",
              px: 3,
              fontWeight: "500",
              borderRadius: 2,
              boxShadow: "none",
              "&:hover": {
                boxShadow: `0 4px 12px ${alpha(colors.primary as string, 0.2)}`,
              },
            }}
          >
            Aplicar Cambios
          </Button>
        </Box>
      </DialogActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            boxShadow: theme.shadows[6],
            minWidth: 'auto',
          },
        }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: '100%',
            alignItems: 'center',
            '& .MuiAlert-message': {
              py: 1,
            },
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <CloseIcon fontSize="inherit" />,
          }}
        >
          {snackbarMessage}
            {snackbarSeverity === "success" && (
              <CheckCircleIcon fontSize="inherit" sx={{ mr: 1 }} />
            )}
            {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ThemeConfigDialog;
