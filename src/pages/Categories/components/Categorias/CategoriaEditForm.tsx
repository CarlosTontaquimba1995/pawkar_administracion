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
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import categoriaService from "@/api/categoriaService";

interface CategoriaEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoriaId: number;
}

const CategoriaEditForm: React.FC<CategoriaEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  categoriaId,
}) => {
  const [categoria, setCategoria] = useState<{
    categoriaId: number;
    nombre: string;
  }>({
    categoriaId: 0,
    nombre: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const { token } = useAuth();

  // Fetch category data when component mounts or categoryId changes
  useEffect(() => {
    const fetchCategoriaData = async () => {
      if (!token || !open) return;

      try {
        setLoading(true);
        const response = await categoriaService.getCategoriaById(categoriaId);

        if (!response?.data) {
          throw new Error("No se encontraron datos de la categoría");
        }

        setCategoria({
          categoriaId: response.data.categoriaId,
          nombre: response.data.nombre,
        });
      } catch (error) {
        console.error("Error fetching category data:", error);
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : "Error al cargar los datos de la categoría",
          severity: "error",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCategoriaData();
    }
  }, [token, categoriaId, open]);

  const handleNameChange = (value: string) => {
    setCategoria((prev) => ({
      ...prev,
      nombre: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoria.nombre.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre es requerido",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await categoriaService.updateCategoria(
        categoria.categoriaId,
        {
          nombre: categoria.nombre,
        }
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || "Categoría actualizada correctamente",
          severity: "success",
        });

        // Close the dialog and refresh the categories list
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        throw new Error(response.message || "Error al actualizar la categoría");
      }
    } catch (error: any) {
      console.error("Error updating category:", error);

      // Handle 400 Bad Request with custom message
      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: error.message || "Error al actualizar la categoría",
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Editar Categoría</Typography>
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
                value={categoria.nombre}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
                required
                autoFocus
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} disabled={loading} variant="outlined">
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

export default CategoriaEditForm;
