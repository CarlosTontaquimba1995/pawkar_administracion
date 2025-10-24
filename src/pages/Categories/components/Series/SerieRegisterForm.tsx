import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { CreateSerieRequest } from "@/types/serie.types";
import { Subcategoria } from "@/types/subcategoria.types";
import { useState, useEffect } from "react";
import serieService from "@/api/serieService";

interface SerieRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategorias: Subcategoria[];
  subcategoriaId?: number;
}

interface SerieFormData extends Omit<CreateSerieRequest, "subcategoriaId"> {
  subcategoriaId: number;
  serieId: number;
  subcategoriaNombre?: string;
}

const SerieRegisterForm: React.FC<SerieRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
  subcategorias,
  subcategoriaId,
}) => {
  const [series, setSeries] = useState<SerieFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  useEffect(() => {
    if (open) {
      // Initialize with one empty series
      const defaultSubcategoriaId =
        subcategoriaId || subcategorias[0]?.subcategoriaId || 0;
      setSeries([
        {
          serieId: Date.now(),
          nombreSerie: "",
          subcategoriaId: defaultSubcategoriaId,
          subcategoriaNombre:
            subcategorias.find(
              (s) => s.subcategoriaId === defaultSubcategoriaId
            )?.nombre || "",
        },
      ]);
    }
  }, [open, subcategoriaId, subcategorias]);

  const handleAddSerie = () => {
    const defaultSubcategoriaId =
      subcategoriaId || subcategorias[0]?.subcategoriaId || 0;
    setSeries([
      ...series,
      {
        serieId: Date.now() + series.length,
        nombreSerie: "",
        subcategoriaId: defaultSubcategoriaId,
        subcategoriaNombre:
          subcategorias.find((s) => s.subcategoriaId === defaultSubcategoriaId)
            ?.nombre || "",
      },
    ]);
  };

  const handleRemoveSerie = (id: number) => {
    if (series.length > 1) {
      setSeries(series.filter((s) => s.serieId !== id));
    } else {
      // If it's the last item, just clear the fields
      setSeries([
        {
          ...series[0],
          serieId: Date.now(),
          nombreSerie: "",
          subcategoriaId:
            subcategoriaId || subcategorias[0]?.subcategoriaId || 0,
          subcategoriaNombre:
            subcategorias.find(
              (s) =>
                s.subcategoriaId === subcategoriaId ||
                subcategorias[0]?.subcategoriaId ||
                0
            )?.nombre || "",
        },
      ]);
    }
  };

  const handleSerieChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setSeries(
      series.map((s) => {
        if (s.serieId === id) {
          const updatedSerie = { ...s, [field]: value };

          // If subcategoriaId changed, update subcategoriaNombre
          if (field === "subcategoriaId" && typeof value === "number") {
            const subcategoria = subcategorias.find(
              (sub) => sub.subcategoriaId === value
            );
            if (subcategoria) {
              updatedSerie.subcategoriaNombre = subcategoria.nombre;
            }
          }

          return updatedSerie;
        }
        return s;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setSnackbar({
        open: true,
        message: "No se encontró el token de autenticación",
        severity: "error",
      });
      return;
    }

    // Validate all fields are filled
    const hasEmptyFields = series.some(
      (serie) => !serie.nombreSerie.trim()
    );

    if (hasEmptyFields) {
      setSnackbar({
        open: true,
        message: "Por favor complete todos los campos obligatorios",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Prepare series data for bulk creation
      const seriesToCreate = series.map((s) => ({
        nombreSerie: s.nombreSerie.trim(),
        subcategoriaId: s.subcategoriaId,
      }));

      // Create all series in a single request
      await serieService.createMultipleSeries({
        series: seriesToCreate,
      });

      setSnackbar({
        open: true,
        message: "Series registradas exitosamente",
        severity: "success",
      });

      // Call onSuccess to notify parent component
      onSuccess();

      // Reset form
      const defaultSubcategoriaId = subcategoriaId || subcategorias[0]?.subcategoriaId || 0;
      setSeries([
        {
          serieId: Date.now(),
          nombreSerie: "",
          subcategoriaId: defaultSubcategoriaId,
          subcategoriaNombre:
            subcategorias.find((s) => s.subcategoriaId === defaultSubcategoriaId)?.nombre || "",
        },
      ]);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("Error al crear las series:", error);
      const errorMessage = error.response?.data?.message || "Error al crear las series";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {subcategoriaId
                ? `Registrar Series para ${
                    subcategorias.find(
                      (s) => s.subcategoriaId === subcategoriaId
                    )?.nombre || "Subcategoría"
                  }`
                : "Registrar Nuevas Series"}
            </Typography>
            <IconButton onClick={onClose} size="small" disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Información de las Series
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddSerie}
                  disabled={loading}
                >
                  Agregar otra
                </Button>
              </Box>

              {series.map((serie, index) => (
                <Box
                  key={serie.serieId}
                  sx={{
                    position: "relative",
                    mb: 2,
                    "&:hover .delete-button": {
                      opacity: 1,
                      visibility: "visible",
                      transform: "translate(4px, -4px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      position: "relative",
                      overflow: "visible",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    {!subcategoriaId && (
                      <Box>
                        <TextField
                          select
                          fullWidth
                          label="Subcategoría"
                          value={serie.subcategoriaId || ""}
                          onChange={(e) =>
                            handleSerieChange(
                              serie.serieId,
                              "subcategoriaId",
                              Number(e.target.value)
                            )
                          }
                          size="small"
                          disabled={loading}
                          variant="outlined"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="" disabled>
                            Seleccione una subcategoría
                          </option>
                          {subcategorias.map((sub) => (
                            <option
                              key={`sub-${sub.subcategoriaId}`}
                              value={sub.subcategoriaId}
                            >
                              {sub.nombre}
                            </option>
                          ))}
                        </TextField>
                      </Box>
                    )}
                    <Box>
                      <TextField
                        fullWidth
                        label={`Serie ${index + 1}`}
                        value={serie.nombreSerie}
                        onChange={(e) =>
                          handleSerieChange(
                            serie.serieId,
                            "nombreSerie",
                            e.target.value
                          )
                        }
                        size="small"
                        disabled={loading}
                        required
                      />
                    </Box>
                  </Paper>
                  {series.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() => handleRemoveSerie(serie.serieId)}
                      sx={{
                        position: "absolute",
                        right: -12,
                        top: -12,
                        color: "white",
                        backgroundColor: "error.main",
                        opacity: 0,
                        visibility: "hidden",
                        transition: "all 0.2s ease",
                        zIndex: 1,
                        "&:hover": {
                          backgroundColor: "error.dark",
                          transform: "scale(1.1)",
                        },
                      }}
                      disabled={loading}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            <DialogActions sx={{ px: 0 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 1,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || series.length === 0}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 2,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {loading
                  ? "Guardando..."
                  : `Guardar ${series.length} ${
                      series.length === 1 ? "serie" : "series"
                    }`}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SerieRegisterForm;
