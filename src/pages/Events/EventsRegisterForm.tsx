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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import subcategoriaService from "@/api/subcategoriaService";
import { categoriaService } from "@/api/categoriaService";
import { ubicacionService } from "@/api/ubicacionService";
import { Ubicacion } from "@/types/ubicacion.types";
import {
  Subcategoria,
  CreateSubcategoriaRequest,
} from "@/types/subcategoria.types";

import { useState, useEffect } from "react";

type SubcategoriaConArtistas = Subcategoria & {
  artistas?: Subcategoria[];
};

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
  const initialSubcategoria: SubcategoriaConArtistas = {
    subcategoriaId: Date.now(),
    nombre: "",
    descripcion: "",
    ubicacion: "",
    fechaHora: new Date().toISOString().slice(0, 16),
    proximo: true,
    categoriaId: 0, // This will be set when categoria is loaded
    categoriaNombre: "",
    latitud: undefined,
    longitud: undefined,
    artistas: [],
  };

  const [subcategorias, setSubcategorias] = useState<SubcategoriaConArtistas[]>(
    [initialSubcategoria]
  );

  interface ArtistaFormData {
    nombre: string;
    descripcion: string;
    fechaHora: string;
  }

  const [currentArtista, setCurrentArtista] = useState<ArtistaFormData>({
    nombre: "",
    descripcion: "",
    fechaHora: new Date().toISOString().slice(0, 16),
  });

  const [loading, setLoading] = useState(false);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  // Cargar ubicaciones
  const fetchUbicaciones = async () => {
    try {
      setLoadingUbicaciones(true);
      const response = await ubicacionService.getUbicaciones();
      if (response.success && response.data) {
        setUbicaciones(response.data);
      }
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar las ubicaciones",
        severity: "error",
      });
    } finally {
      setLoadingUbicaciones(false);
    }
  };

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
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { message?: string } };
          };
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
      fetchUbicaciones();
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
        proximo: true,
        categoriaId: categoriaId || 0,
        categoriaNombre: "",
        latitud: undefined,
        longitud: undefined,
      },
    ]);
  };

  const handleAddArtista = (subcategoriaId: number) => {
    const parentEvent = subcategorias.find(
      (sub) => sub.subcategoriaId === subcategoriaId
    );

    if (!parentEvent || !currentArtista.nombre?.trim()) return;

    const newArtista: Subcategoria = {
      ...currentArtista,
      subcategoriaId: Date.now(),
      categoriaId: parentEvent.categoriaId || 0,
      categoriaNombre: parentEvent.categoriaNombre || "",
      ubicacion: parentEvent.ubicacion || "",
      latitud: parentEvent.latitud,
      longitud: parentEvent.longitud,
      proximo: true,
    };

    setSubcategorias(
      subcategorias.map((sub) =>
        sub.subcategoriaId === subcategoriaId
          ? {
              ...sub,
              artistas: [...(sub.artistas || []), newArtista],
            }
          : sub
      )
    );

    // Reset form with default values
    setCurrentArtista({
      nombre: "",
      descripcion: "",
      fechaHora: parentEvent.fechaHora || new Date().toISOString().slice(0, 16),
    });
  };

  const handleRemoveArtista = (subcategoriaId: number, artistaId: number) => {
    setSubcategorias(
      subcategorias.map((sub) =>
        sub.subcategoriaId === subcategoriaId
          ? {
              ...sub,
              artistas: (sub.artistas || []).filter(
                (artista) => artista.subcategoriaId !== artistaId
              ),
            }
          : sub
      )
    );
  };

  const handleArtistaChange = (
    field: keyof ArtistaFormData,
    value: string | number
  ) => {
    setCurrentArtista((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    field: keyof Omit<
      Subcategoria,
      | "subcategoriaId"
      | "categoriaId"
      | "categoriaNombre"
      | "proximo"
      | "artistas"
    >,
    value: any,
    ubicacionData?: { latitud?: number; longitud?: number }
  ) => {
    // Ensure value is never null for required fields
    if (field === "fechaHora" && value === null) {
      value = new Date().toISOString().slice(0, 16);
    }
    setSubcategorias(
      subcategorias.map((sub) =>
        sub.subcategoriaId === id
          ? {
              ...sub,
              [field]: value,
              ...(ubicacionData?.latitud && { latitud: ubicacionData.latitud }),
              ...(ubicacionData?.longitud && {
                longitud: ubicacionData.longitud,
              }),
            }
          : sub
      )
    );
  };

  const handleUbicacionChange = (id: number, value: string) => {
    const selectedUbicacion = ubicaciones.find((u) => u.descripcion === value);
    handleSubcategoriaChange(id, "ubicacion", value, {
      latitud: selectedUbicacion?.latitud,
      longitud: selectedUbicacion?.longitud,
    });
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
        !sub.nombre?.trim() ||
        !sub.descripcion?.trim() ||
        !sub.fechaHora ||
        !sub.ubicacion?.trim()
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
      const subcategoriasToCreate = subcategorias.map((sub) => {
        const subData: CreateSubcategoriaRequest = {
          nombre: sub.nombre.trim(),
          descripcion: sub.descripcion.trim(),
          ubicacion: sub.ubicacion?.trim() || "",
          latitud: sub.latitud,
          longitud: sub.longitud,
          fechaHora: sub.fechaHora || new Date().toISOString().slice(0, 16),
          categoriaId: categoriaId || 0,
        };
        return subData;
      });

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
          proximo: true,
          categoriaId: categoriaId || 0,
          categoriaNombre: "",
          artistas: [],
          latitud: undefined,
          longitud: undefined,
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
        sub.nombre?.trim() !== "" &&
        sub.descripcion?.trim() !== "" &&
        sub.fechaHora &&
        sub.ubicacion?.trim() !== "";
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
                          handleRemoveSubcategoria(subcategoria.subcategoriaId);
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

                    <FormControl fullWidth margin="normal" required>
                      <InputLabel
                        id={`ubicacion-label-${subcategoria.subcategoriaId}`}
                      >
                        Ubicación del evento
                      </InputLabel>
                      <Select
                        labelId={`ubicacion-label-${subcategoria.subcategoriaId}`}
                        id={`ubicacion-${subcategoria.subcategoriaId}`}
                        value={subcategoria.ubicacion}
                        label="Ubicación del evento"
                        onChange={(e) =>
                          handleUbicacionChange(
                            subcategoria.subcategoriaId,
                            e.target.value
                          )
                        }
                        disabled={loading || loadingUbicaciones}
                      >
                        {loadingUbicaciones ? (
                          <MenuItem disabled>
                            <Box
                              display="flex"
                              justifyContent="center"
                              width="100%"
                            >
                              <CircularProgress size={24} />
                            </Box>
                          </MenuItem>
                        ) : ubicaciones.length > 0 ? (
                          ubicaciones.map((ubicacion) => (
                            <MenuItem
                              key={ubicacion.id}
                              value={ubicacion.descripcion}
                            >
                              {ubicacion.descripcion}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>
                            No hay ubicaciones disponibles
                          </MenuItem>
                        )}
                      </Select>
                      {!loadingUbicaciones && (
                        <Typography variant="caption" color="textSecondary">
                          Seleccione una ubicación de la lista
                        </Typography>
                      )}
                    </FormControl>

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

                    {/* Sección de Artistas */}
                    <Card
                      variant="outlined"
                      sx={{ width: "100%", mt: 2, borderColor: "divider" }}
                    >
                      <CardHeader
                        title="Artistas"
                        titleTypographyProps={{
                          variant: "subtitle2",
                          color: "text.secondary",
                        }}
                      />
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 200 }}>
                            <TextField
                              label="Nombre del artista"
                              value={currentArtista.nombre}
                              onChange={(e) =>
                                handleArtistaChange("nombre", e.target.value)
                              }
                              fullWidth
                              size="small"
                              margin="none"
                            />
                          </Box>
                          <Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() =>
                                handleAddArtista(subcategoria.subcategoriaId)
                              }
                              disabled={!currentArtista.nombre.trim()}
                              startIcon={<PersonIcon />}
                              sx={{ height: "40px" }}
                            >
                              Agregar Artista
                            </Button>
                          </Box>
                          <Box
                            sx={{
                              width: { xs: "100%", sm: "calc(33.33% - 16px)" },
                            }}
                          >
                            <TextField
                              label="Fecha y hora"
                              type="datetime-local"
                              value={currentArtista.fechaHora}
                              onChange={(e) =>
                                handleArtistaChange("fechaHora", e.target.value)
                              }
                              fullWidth
                              size="small"
                              margin="none"
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Box>
                          <Box sx={{ width: "100%" }}>
                            <TextField
                              label="Descripción"
                              value={currentArtista.descripcion}
                              onChange={(e) =>
                                handleArtistaChange(
                                  "descripcion",
                                  e.target.value
                                )
                              }
                              fullWidth
                              multiline
                              rows={2}
                              size="small"
                              margin="none"
                            />
                          </Box>
                        </Box>

                        {/* Lista de artistas agregados */}
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {subcategoria.artistas?.map((artista) => (
                            <Chip
                              key={artista.subcategoriaId}
                              label={artista.nombre}
                              onDelete={() =>
                                handleRemoveArtista(
                                  subcategoria.subcategoriaId,
                                  artista.subcategoriaId
                                )
                              }
                              deleteIcon={<DeleteIcon />}
                              variant="outlined"
                              sx={{
                                "& .MuiChip-deleteIcon": {
                                  color: "error.main",
                                  "&:hover": {
                                    color: "error.dark",
                                  },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
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
