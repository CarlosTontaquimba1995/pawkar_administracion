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
  Divider,
  Paper,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "../../../../contexts/AuthContext";
import { categoriaService } from "../../../../api/categoriaService";
import { Categoria } from "@/types/categoria.types";
import { useState } from "react";

interface CategoriaRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CategoriaRegisterForm: React.FC<CategoriaRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [categorias, setCategorias] = useState<Categoria[]>([
    { categoriaId: Date.now(), nombre: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  const handleAddCategoria = () => {
    setCategorias([
      ...categorias,
      { categoriaId: Date.now() + categorias.length, nombre: "" },
    ]);
  };

  const handleRemoveCategoria = (id: number) => {
    if (categorias.length > 1) {
      setCategorias(categorias.filter((cat) => cat.categoriaId !== id));
    }
  };

  const handleCategoriaChange = (id: number, value: string) => {
    setCategorias(
      categorias.map((cat) =>
        cat.categoriaId === id ? { ...cat, nombre: value } : cat
      )
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

    // Validate all categories have names
    const hasEmptyNames = categorias.some((cat) => !cat.nombre.trim());
    if (hasEmptyNames) {
      setSnackbar({
        open: true,
        message: "Por favor complete todos los nombres de categoría",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare categories data for bulk creation
      const categoriasToCreate = categorias.map((cat) => ({
        nombre: cat.nombre.trim(),
      }));

      // Create all categories in a single request
      const response = await categoriaService.createCategoriasBulk({
        categorias: categoriasToCreate,
      });

      setSnackbar({
        open: true,
        message: response.message || "Categorías registradas exitosamente",
        severity: "success",
      });
      // Reset form
      setCategorias([{ categoriaId: Date.now(), nombre: "" }]);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error al registrar categorias",
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
        onClose={onClose}
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
            <Typography variant="h6">Registrar Categorías</Typography>
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
                  Información de las Categorías
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddCategoria}
                  disabled={loading}
                  sx={{
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  Agregar otra
                </Button>
              </Box>

              {categorias.map((categoria, index) => (
                <Box
                  key={categoria.categoriaId}
                  sx={{
                    position: "outlined",
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
                      alignItems: "center",
                      gap: 2,
                      position: "relative",
                      overflow: "visible",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <TextField
                        fullWidth
                        label={`Categoría ${index + 1}`}
                        value={categoria.nombre}
                        onChange={(e) =>
                          handleCategoriaChange(
                            categoria.categoriaId,
                            e.target.value
                          )
                        }
                        size="small"
                        disabled={loading}
                      />
                    </Box>
                  </Paper>
                  {categorias.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() =>
                        handleRemoveCategoria(categoria.categoriaId)
                      }
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
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} variant="outlined" disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <AddIcon />
                }
              >
                {loading
                  ? "Registrando..."
                  : `Registrar ${categorias.length} ${
                      categorias.length > 1 ? "Categorías" : "Categoría"
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CategoriaRegisterForm;
