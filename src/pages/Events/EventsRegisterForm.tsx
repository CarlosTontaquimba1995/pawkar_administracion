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
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import subcategoriaService from "@/api/subcategoriaService";
import { categoriaService } from "@/api/categoriaService";
import { ubicacionService } from "@/api/ubicacionService";
import { Ubicacion } from "@/types/ubicacion.types";
import { Subcategoria } from "@/types/subcategoria.types";

import { useState, useEffect } from "react";
import { Artista } from "@/types/artista.types";

type SubcategoriaConArtistas = Subcategoria & {
  artistas: Artista[];
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
    latitud: 0,
    longitud: 0,
    artistas: [],
  };

  const [subcategorias, setSubcategorias] = useState<SubcategoriaConArtistas[]>(
    [initialSubcategoria]
  );

  interface ArtistaFormData {
    nombre: string;
    genero: string;
  }

  const [currentArtista, setCurrentArtista] = useState<ArtistaFormData>({
    nombre: "",
    genero: "",
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
        latitud: 0,
        longitud: 0,
        artistas: []
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

  // Update the handleSubmit function to include artistas in the request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!categoriaId) {
        throw new Error("Por favor seleccione una categoría");
      }

      // Prepare subcategorias data with required fields
      const subcategoriasData = subcategorias.map((sub) => ({
        nombre: sub.nombre,
        descripcion: sub.descripcion,
        ubicacion: sub.ubicacion,
        latitud: sub.latitud,
        longitud: sub.longitud,
        fechaHora: sub.fechaHora || new Date().toISOString(),
        categoriaId: categoriaId,
        proximo: true, // or get this from form
        artistas: sub.artistas || [], // Include artistas in the request
      }));

      if (subcategoriasData.length === 1) {
        // Single subcategory creation
        await subcategoriaService.createSubcategoria(subcategoriasData[0]);
      } else {
        // Multiple subcategories creation
        await subcategoriaService.createMultipleSubcategorias({
          subcategorias: subcategoriasData,
        });
      }

      setSnackbar({
        open: true,
        message: "Evento(s) registrado(s) exitosamente",
        severity: "success",
      });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error al registrar el evento:", error);
      let errorMessage = "Error al registrar el evento";

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtista = (subcategoriaIndex: number) => {
    if (!currentArtista.nombre || !currentArtista.genero) {
      setSnackbar({
        open: true,
        message: "Por favor complete todos los campos del artista",
        severity: "error",
      });
      return;
    }

    setSubcategorias((prev) => {
      const updated = [...prev];
      updated[subcategoriaIndex] = {
        ...updated[subcategoriaIndex],
        artistas: [
          ...(updated[subcategoriaIndex].artistas || []),
          currentArtista,
        ],
      };
      return updated;
    });

    // Reset current artist form
    setCurrentArtista({
      nombre: "",
      genero: "",
    });
  };

  const handleRemoveArtista = (
    subcategoriaIndex: number,
    artistaIndex: number
  ) => {
    setSubcategorias((prev) => {
      const updated = [...prev];
      updated[subcategoriaIndex] = {
        ...updated[subcategoriaIndex],
        artistas: updated[subcategoriaIndex].artistas.filter(
          (_, i) => i !== artistaIndex
        ),
      };
      return updated;
    });
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
                  </Box>
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Artistas
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 2,
                          alignItems: "flex-end",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            fullWidth
                            label="Nombre del Artista"
                            value={currentArtista.nombre}
                            onChange={(e) =>
                              setCurrentArtista({
                                ...currentArtista,
                                nombre: e.target.value,
                              })
                            }
                            size="small"
                            margin="normal"
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            fullWidth
                            label="Género Musical"
                            value={currentArtista.genero}
                            onChange={(e) =>
                              setCurrentArtista({
                                ...currentArtista,
                                genero: e.target.value,
                              })
                            }
                            size="small"
                            margin="normal"
                          />
                        </Box>
                        <Box>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddArtista(index)}
                            startIcon={<AddIcon />}
                            disabled={
                              !currentArtista.nombre.trim() ||
                              !currentArtista.genero.trim()
                            }
                            sx={{ mb: 1 }}
                          >
                            Agregar
                          </Button>
                        </Box>
                      </Box>

                      {/* Lista de Artistas Agregados */}
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {subcategoria.artistas?.map((artista, artistaIndex) => (
                          <Chip
                            key={artistaIndex}
                            label={`${artista.nombre} (${artista.genero})`}
                            onDelete={() =>
                              handleRemoveArtista(index, artistaIndex)
                            }
                            color="primary"
                            variant="outlined"
                            icon={<PersonIcon />}
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
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            <DialogActions>
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
                disabled={loading || !categoriaId || !areAllFieldsFilled()}
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
