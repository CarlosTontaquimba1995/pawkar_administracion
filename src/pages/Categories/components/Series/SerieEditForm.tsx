import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "@/contexts/AuthContext";
import serieService from "@/api/serieService";
import subcategoriaService from "@/api/subcategoriaService";
import { Subcategoria } from "@/types/subcategoria.types";
import { UpdateSerieRequest } from "@/types/serie.types";

interface SerieEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serieId: number;
}

const SerieEditForm: React.FC<SerieEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  serieId,
}) => {
  const [formData, setFormData] = useState<UpdateSerieRequest>({
    nombreSerie: "",
    subcategoriaId: 0,
  });

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const { token } = useAuth();

  // Fetch series data and subcategorias when component mounts or serieId changes
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !open) return;

      try {
        setLoading(true);

        // Fetch serie data
        const serieResponse = await serieService.getSerieById(serieId);

        if (!serieResponse?.data) {
          throw new Error("No se encontraron datos de la serie");
        }

        // Fetch subcategorias
        const subcategoriasResponse =
          await subcategoriaService.getSubcategorias();

        if (subcategoriasResponse.data) {
          setSubcategorias(subcategoriasResponse.data);
        }

        setFormData({
          nombreSerie: serieResponse.data.nombreSerie || "",
          subcategoriaId: serieResponse.data.subcategoriaId || 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : "Error al cargar los datos de la serie",
          severity: "error",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (open && serieId > 0) {
      fetchData();
    }
  }, [token, serieId, open, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombreSerie?.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre es requerido",
        severity: "error",
      });
      return;
    }

    if (!formData.subcategoriaId) {
      setSnackbar({
        open: true,
        message: "Debe seleccionar una subcategoría",
        severity: "error",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await serieService.updateSerie(serieId, formData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || "Serie actualizada correctamente",
          severity: "success",
        });

        // Close the dialog and refresh the series list after a short delay
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        throw new Error(response.message || "Error al actualizar la serie");
      }
    } catch (error: any) {
      console.error("Error updating serie:", error);

      // Handle API errors
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error al actualizar la serie",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Editar Serie</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              disabled={submitting}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent>
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <TextField
                  label="Nombre de la serie"
                  name="nombreSerie"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={formData.nombreSerie}
                  onChange={handleInputChange}
                  required
                />

                <TextField
                  select
                  label="Subcategoría"
                  name="subcategoriaId"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={formData.subcategoriaId}
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value={0} disabled>
                    Seleccione una subcategoría
                  </MenuItem>
                  {subcategorias.map((subcategoria) => (
                    <MenuItem
                      key={subcategoria.subcategoriaId}
                      value={subcategoria.subcategoriaId}
                    >
                      {subcategoria.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for feedback */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SerieEditForm;
