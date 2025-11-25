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
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import subcategoriaService from "@/api/subcategoriaService";
import { categoriaService } from "@/api/categoriaService";
import { useState, useEffect } from "react";

interface Subcategoria {
  subcategoriaId: number;
  nombre: string;
  descripcion: string;
  fechaHora: string;
  ubicacion: string;
  categoriaId?: number;
}

interface EventsRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EventsRegisterForm: React.FC<EventsRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([
    {
      subcategoriaId: Date.now(),
      nombre: "",
      descripcion: "",
      ubicacion: "",
      fechaHora: new Date().toISOString().slice(0, 16),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  // Buscar la categoría EVENTOS al cargar el componente
    useEffect(() => {
      const fetchCategoriaEventos = async () => {
        try {
          const response = await categoriaService.getCategoriaByNemonico(
            "EVENTOS"
          );
          if (response.data) {
            setCategoriaId(response.data.categoriaId);
          }
        } catch (error) {
          let errorMessage = "Error al cargar la categoría de eventos";
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            errorMessage = axiosError.response?.data?.message || errorMessage;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: "error",
          });
        }
      };

      if (open) {
        fetchCategoriaEventos();
      }
    }, [open]);

    const handleAddSubcategoria = () => {
      setSubcategorias([
        ...subcategorias,
        {
          subcategoriaId: Date.now() + subcategorias.length,
          nombre: "",
          descripcion: "",
          ubicacion: "",
          fechaHora: new Date().toISOString().slice(0, 16),
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
      field: keyof Subcategoria,
      value: string
    ) => {
      setSubcategorias(
        subcategorias.map((sub) =>
          sub.subcategoriaId === id ? { ...sub, [field]: value } : sub
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

      if (!categoriaId) {
        setSnackbar({
          open: true,
          message: "No se pudo determinar la categoría de eventos",
          severity: "error",
        });
        return;
      }

      // Validar campos requeridos
      const hasEmptyFields = subcategorias.some(
        (sub) =>
          !sub.nombre.trim() ||
          !sub.descripcion.trim() ||
          !sub.fechaHora ||
          !sub.ubicacion.trim()
      );

      if (hasEmptyFields) {
        setSnackbar({
          open: true,
          message:
            "Por favor complete todos los campos requeridos, incluyendo la ubicación",
          severity: "error",
        });
        return;
      }

      if (hasEmptyFields) {
        setSnackbar({
          open: true,
          message: "Por favor complete todos los campos requeridos",
          severity: "error",
        });
        return;
      }

      try {
        setLoading(true);

        // Preparar datos para el envío
        const subcategoriasToCreate = subcategorias.map((sub) => ({
          nombre: sub.nombre.trim(),
          descripcion: sub.descripcion.trim(),
          ubicacion: sub.ubicacion.trim(),
          fechaHora: sub.fechaHora,
          categoriaId: categoriaId,
        }));

        // Crear todas las subcategorías en una sola solicitud
        const response = await subcategoriaService.createMultipleSubcategorias({
          subcategorias: subcategoriasToCreate,
        });

        setSnackbar({
          open: true,
          message: response.message || "Eventos registrados exitosamente",
          severity: "success",
        });

        // Resetear el formulario
        setSubcategorias([
          {
            subcategoriaId: Date.now(),
            nombre: "",
            descripcion: "",
            ubicacion: "",
            fechaHora: new Date().toISOString().slice(0, 16),
          },
        ]);

        // Cerrar el diálogo después de un breve retraso
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } catch (error: any) {
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message || "Error al registrar los eventos",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    const areAllFieldsFilled = () => {
      const allFilled = subcategorias.every((sub) => {
        const isFilled =
          sub.nombre.trim() !== "" &&
          sub.descripcion.trim() !== "" &&
          sub.fechaHora &&
          sub.ubicacion.trim() !== "";
        return isFilled;
      });

      return allFilled;
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
              <Typography variant="h6">Registrar Eventos</Typography>
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
                    Información de los Eventos
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddSubcategoria}
                    disabled={loading}
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    Agregar otro evento
                  </Button>
                </Box>

                {subcategorias.map((subcategoria, index) => (
                  <Box
                    key={subcategoria.subcategoriaId}
                    sx={{
                      position: "relative",
                      mb: 3,
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 1,
                        "& .delete-button": {
                          opacity: 1,
                          visibility: "visible",
                        },
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Evento {index + 1}
                      </Typography>
                      {subcategorias.length > 1 && (
                        <IconButton
                          className="delete-button"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSubcategoria(
                              subcategoria.subcategoriaId
                            );
                          }}
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

                    <Box display="flex" gap={2} flexWrap="wrap">
                      <TextField
                        label="Nombre del evento"
                        value={subcategoria.nombre}
                        onChange={(e) =>
                          handleSubcategoriaChange(
                            subcategoria.subcategoriaId,
                            "nombre",
                            e.target.value
                          )
                        }
                        required
                        fullWidth
                        size="small"
                        margin="normal"
                        disabled={loading}
                      />

                      <TextField
                        fullWidth
                        label="Descripción"
                        variant="outlined"
                        margin="normal"
                        multiline
                        rows={2}
                        value={subcategoria.descripcion}
                        onChange={(e) =>
                          handleSubcategoriaChange(
                            subcategoria.subcategoriaId,
                            "descripcion",
                            e.target.value
                          )
                        }
                        required
                        disabled={loading}
                      />

                      <TextField
                        fullWidth
                        label="Ubicación del evento"
                        variant="outlined"
                        margin="normal"
                        value={subcategoria.ubicacion}
                        onChange={(e) =>
                          handleSubcategoriaChange(
                            subcategoria.subcategoriaId,
                            "ubicacion",
                            e.target.value
                          )
                        }
                        required
                        disabled={loading}
                        placeholder="Ej: Estadio Olímpico, Calle Principal #123"
                        helperText="Ingrese la dirección exacta del evento"
                      />

                      <TextField
                        label="Fecha y hora"
                        type="datetime-local"
                        value={subcategoria.fechaHora}
                        onChange={(e) =>
                          handleSubcategoriaChange(
                            subcategoria.subcategoriaId,
                            "fechaHora",
                            e.target.value
                          )
                        }
                        required
                        fullWidth
                        size="small"
                        margin="normal"
                        disabled={loading}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              <DialogActions sx={{ px: 0, justifyContent: "space-between" }}>
                <Button
                  onClick={onClose}
                  variant="outlined"
                  color="inherit"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={(() => {
                    const disabled =
                      loading || !categoriaId || !areAllFieldsFilled();
                    return disabled;
                  })()}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <AddIcon />
                  }
                >
                  {loading
                    ? "Registrando..."
                    : `Registrar ${subcategorias.length} ${
                        subcategorias.length > 1 ? "Eventos" : "Evento"
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

export default EventsRegisterForm;
