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
import { Subcategoria } from "@/types/subcategoria.types";
import { Categoria } from "@/types/categoria.types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import categoriaService from "@/api/categoriaService";
import subcategoriaService from "@/api/subcategoriaService";

interface RegisterSubcategoriaFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoriaId?: number;
}

const RegisterSubcategoriaForm: React.FC<RegisterSubcategoriaFormProps> = ({
  open,
  onClose,
  onSuccess,
  categoriaId,
}) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([
    {
      subcategoriaId: Date.now(),
      nombre: "",
      categoriaId: categoriaId || 0,
      descripcion: "",
      categoriaNombre: "",
    },
  ]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  useEffect(() => {
    if (open) {
      if (!categoriaId) {
        fetchCategorias();
      }
      // Initialize with one empty subcategory
      setSubcategorias([
        {
          subcategoriaId: Date.now(),
          nombre: "",
          categoriaId: categoriaId || 0,
          descripcion: "",
          categoriaNombre: "",
        },
      ]);
    }
  }, [open, categoriaId]);

  const fetchCategorias = async () => {
    if (categoriaId) return;

    try {
      const response = await categoriaService.getCategorias();
      // The API returns data in the response.data array
      // Each item has categoriaId and nombre
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategorias(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar las categorías",
        severity: "error",
      });
    }
  };

  const handleAddSubcategoria = () => {
    setSubcategorias([
      ...subcategorias,
      {
        subcategoriaId: Date.now() + subcategorias.length,
        nombre: "",
        categoriaId: categoriaId || 0,
        descripcion: "",
        categoriaNombre: "",
      },
    ]);
  };

  const handleRemoveSubcategoria = (id: number) => {
    if (subcategorias.length > 1) {
      setSubcategorias(
        subcategorias.filter((sub) => sub.subcategoriaId !== id)
      );
    }
  };

  const handleSubcategoriaChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setSubcategorias(
      subcategorias.map((sub) => {
        if (sub.subcategoriaId === id) {
          // Handle categoriaId specifically to ensure it's a number
          if (field === "categoriaId") {
            const numValue = Number(value);
            return {
              ...sub,
              [field]: isNaN(numValue) ? 0 : numValue,
              categoriaNombre:
                categorias.find(
                  (cat) => (cat.categoriaId || cat.categoriaId) === numValue
                )?.nombre || "",
            };
          }
          return { ...sub, [field]: value };
        }
        return sub;
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

    // Validate all subcategories have names and a category selected
    const hasEmptyFields = subcategorias.some(
      (sub) => !sub.nombre.trim() || !sub.categoriaId
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

      // Prepare subcategories data for bulk creation
      const subcategoriasToCreate = subcategorias.map((sub) => ({
        nombre: sub.nombre.trim(),
        categoriaId: sub.categoriaId,
        descripcion: sub.descripcion.trim(),
      }));

      // Create all subcategories in a single request
      await subcategoriaService.createMultipleSubcategorias({
        subcategorias: subcategoriasToCreate,
      });

      setSnackbar({
        open: true,
        message: `Se ${subcategorias.length > 1 ? "agregaron" : "agregó"} ${
          subcategorias.length
        } ${
          subcategorias.length > 1 ? "subcategorías" : "subcategoría"
        } exitosamente`,
        severity: "success",
      });

      // Reset form
      setSubcategorias([
        {
          subcategoriaId: Date.now(),
          nombre: "",
          categoriaId: categoriaId || 0,
          descripcion: "",
          categoriaNombre: "",
        },
      ]);

      // Notify parent component
      onSuccess();
    } catch (error: any) {
      console.error("Error al crear subcategorías:", error);
      const errorMessage =
        error.response?.data?.message || "Error al crear las subcategorías";
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
            <Typography variant="h6">Registrar Subcategorías</Typography>
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
                  Información de las Subcategorías
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddSubcategoria}
                  disabled={loading}
                >
                  Agregar otra
                </Button>
              </Box>

              {subcategorias.map((subcategoria, index) => (
                <Box
                  key={subcategoria.subcategoriaId}
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
                    {!categoriaId && (
                      <Box>
                        <TextField
                          select
                          fullWidth
                          label="Categoría"
                          value={subcategoria.categoriaId || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleSubcategoriaChange(
                              subcategoria.subcategoriaId,
                              "categoriaId",
                              value
                            );
                          }}
                          size="small"
                          disabled={loading}
                          key={`categoria-select-${subcategoria.subcategoriaId}`}
                          variant="outlined"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="" disabled>
                            Seleccione una categoría
                          </option>
                          {Array.isArray(categorias) &&
                            categorias.map((cat) => {
                              const id = cat.categoriaId || cat.categoriaId;
                              return (
                                <option key={`cat-${id}`} value={id}>
                                  {cat.nombre}
                                </option>
                              );
                            })}
                        </TextField>
                      </Box>
                    )}
                    <Box>
                      <TextField
                        fullWidth
                        label={`Subcategoría ${index + 1}`}
                        value={subcategoria.nombre}
                        onChange={(e) =>
                          handleSubcategoriaChange(
                            subcategoria.subcategoriaId,
                            "nombre",
                            e.target.value
                          )
                        }
                        size="small"
                        disabled={loading}
                      />
                    </Box>
                  </Paper>
                  {subcategorias.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() =>
                        handleRemoveSubcategoria(subcategoria.subcategoriaId)
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
                color="primary"
                disabled={
                  loading ||
                  subcategorias.length === 0 ||
                  subcategorias.some(
                    (sub) =>
                      !sub.nombre.trim() ||
                      sub.categoriaId === undefined ||
                      sub.categoriaId <= 0
                  )
                }
                startIcon={
                  loading ? <CircularProgress size={20} /> : <AddIcon />
                }
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
                  ? "Registrando..."
                  : `Registrar ${subcategorias.length} ${
                      subcategorias.length > 1
                        ? "Subcategorías"
                        : "Subcategoría"
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
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegisterSubcategoriaForm;
