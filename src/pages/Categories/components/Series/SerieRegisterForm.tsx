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
          nombre: "",
          descripcion: "",
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
        nombre: "",
        descripcion: "",
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
          nombre: "",
          descripcion: "",
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

    try {
      setLoading(true);

      // Filter out empty series
      const validSeries = series.filter((s) => s.nombre.trim() !== "");

      if (validSeries.length === 0) {
        setSnackbar({
          open: true,
          message: "Por favor ingrese al menos una serie válida",
          severity: "error",
        });
        return;
      }

      // Prepare series data for bulk creation
      const seriesToCreate = validSeries.map((s) => ({
        nombre: s.nombre.trim(),
        descripcion: s.descripcion.trim(),
        subcategoriaId: s.subcategoriaId,
      }));

      // Create all series in a single request
      await serieService.createMultipleSeries({
        series: seriesToCreate,
      });

      setSnackbar({
        open: true,
        message: `Se crearon ${validSeries.length} ${
          validSeries.length === 1 ? "serie" : "series"
        } exitosamente`,
        severity: "success",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating series:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Error al crear las series. Por favor, intente nuevamente.",
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
      >
        <form onSubmit={handleSubmit}>
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
              <IconButton
                onClick={onClose}
                disabled={loading}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Complete los campos para cada serie. Puede agregar múltiples
                series a la vez.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSerie}
                disabled={loading}
                sx={{ mt: 1, mb: 2 }}
              >
                Agregar Otra Serie
              </Button>
            </Box>

            {series.map((serie, index) => (
              <Paper
                key={serie.serieId}
                variant="outlined"
                sx={{ p: 2, mb: 2, position: "relative" }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSerie(serie.serieId)}
                  disabled={loading}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "error.main",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Serie {index + 1}
                </Typography>

                <Box
                  display="grid"
                  gap={2}
                  gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                >
                  <TextField
                    label="Nombre de la serie"
                    value={serie.nombre}
                    onChange={(e) =>
                      handleSerieChange(serie.serieId, "nombre", e.target.value)
                    }
                    fullWidth
                    margin="normal"
                    required
                    disabled={loading}
                    size="small"
                  />

                  <TextField
                    select
                    label="Subcategoría"
                    value={serie.subcategoriaId}
                    onChange={(e) =>
                      handleSerieChange(
                        serie.serieId,
                        "subcategoriaId",
                        Number(e.target.value)
                      )
                    }
                    fullWidth
                    margin="normal"
                    required
                    disabled={
                      loading || subcategorias.length === 0 || !!subcategoriaId
                    }
                    SelectProps={{
                      native: true,
                    }}
                    size="small"
                  >
                    {!subcategoriaId && (
                      <option value="">Seleccione una subcategoría</option>
                    )}
                    {subcategorias.map((sub) => (
                      <option
                        key={sub.subcategoriaId}
                        value={sub.subcategoriaId}
                      >
                        {sub.nombre}
                      </option>
                    ))}
                  </TextField>
                </Box>

                <TextField
                  label="Descripción (Opcional)"
                  value={serie.descripcion}
                  onChange={(e) =>
                    handleSerieChange(
                      serie.serieId,
                      "descripcion",
                      e.target.value
                    )
                  }
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  disabled={loading}
                  size="small"
                />
              </Paper>
            ))}
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              color="inherit"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || series.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading
                ? "Guardando..."
                : `Guardar ${series.length} ${
                    series.length === 1 ? "serie" : "series"
                  }`}
            </Button>
          </DialogActions>
        </form>
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
