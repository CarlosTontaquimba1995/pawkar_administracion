import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  DialogTitle,
  Dialog,
  Divider,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import subcategoriaService from "@/api/subcategoriaService";
import { Categoria } from "@/types/categoria.types";

interface SubcategoriaEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategoriaId: number;
  categorias: Categoria[];
}

const SubcategoriaEditForm: React.FC<SubcategoriaEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  subcategoriaId,
  categorias,
}) => {
  const [subcategoria, setSubcategoria] = useState<{
    subcategoriaId: number;
    nombre: string;
    categoriaId: number;
  }>({
    subcategoriaId: 0,
    nombre: "",
    categoriaId: 0,
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const { token } = useAuth();

  // Fetch subcategory data when component mounts or subcategoriaId changes
  useEffect(() => {
    const fetchSubcategoriaData = async () => {
      if (!token || !open) return;

      try {
        setLoading(true);
        const response = await subcategoriaService.getSubcategoriaById(subcategoriaId);

        if (!response?.data) {
          throw new Error("No se encontraron datos de la subcategoría");
        }

        setSubcategoria({
          subcategoriaId: response.data.subcategoriaId,
          nombre: response.data.nombre,
          categoriaId: response.data.categoriaId,
        });
      } catch (error) {
        console.error("Error fetching subcategory data:", error);
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : "Error al cargar los datos de la subcategoría",
          severity: "error",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchSubcategoriaData();
    }
  }, [token, subcategoriaId, open]);

  const handleNameChange = (value: string) => {
    setSubcategoria((prev) => ({
      ...prev,
      nombre: value,
    }));
  };

  const handleCategoriaChange = (value: number) => {
    setSubcategoria((prev) => ({
      ...prev,
      categoriaId: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subcategoria.nombre.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre es requerido",
        severity: "error",
      });
      return;
    }

    if (!subcategoria.categoriaId) {
      setSnackbar({
        open: true,
        message: "Debe seleccionar una categoría",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await subcategoriaService.updateSubcategoria(
        subcategoria.subcategoriaId,
        {
          nombre: subcategoria.nombre,
          categoriaId: subcategoria.categoriaId,
        }
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || "Subcategoría actualizada correctamente",
          severity: "success",
        });

        // Close the dialog and refresh the subcategories list
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        throw new Error(response.message || "Error al actualizar la subcategoría");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error",
        });
      } else if (error.message) {
        setSnackbar({
          open: true,
          message: error.message,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Subcategoría</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              disabled={loading}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box mb={3}>
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                margin="normal"
                value={subcategoria.nombre}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
                required
                autoFocus
                sx={{ mt: 2 }}
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="categoria-select-label">Categoría</InputLabel>
                <Select
                  labelId="categoria-select-label"
                  id="categoria-select"
                  value={subcategoria.categoriaId}
                  label="Categoría"
                  onChange={(e) => handleCategoriaChange(Number(e.target.value))}
                  disabled={loading}
                >
                  <MenuItem value={0} disabled>
                    Seleccione una categoría
                  </MenuItem>
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria.categoriaId} value={categoria.categoriaId}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
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
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SubcategoriaEditForm;
