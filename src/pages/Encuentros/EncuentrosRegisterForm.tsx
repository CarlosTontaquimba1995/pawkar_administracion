import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

// Services
import { useAuth } from "@/contexts/AuthContext";
import subcategoriaService from "@/api/subcategoriaService";
import categoriaService from "@/api/categoriaService";
import serieService from "@/api/serieService";
import teamService from "@/api/teamService";

// Types
import { CreateEncuentroRequest } from "@/types/encuentro.types";
import { Subcategoria } from "@/types/subcategoria.types";
import { Serie } from "@/types/serie.types";
import { Team } from "@/types/team.types";
import { Estadio } from "@/types/estadio.types";
import generacionEncuentroService from "@/api/generacionEncuentroService";

interface EncuentrosRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  estadios: Estadio[];
}

// Helper function to create a new encuentro with default values
const createDefaultEncuentro = (): CreateEncuentroRequest & {
  subcategoriaId: number;
  serieId: number;
  estado?: string;
} => {
  const now = new Date();
  return {
    fecha: format(now, "yyyy-MM-dd"),
    hora: format(now, "HH:mm"),
    estadioId: 0,
    equipoLocalId: 0,
    equipoVisitanteId: 0,
    serieId: 0,
    subcategoriaId: 0,
  };
};

const EncuentrosRegisterForm: React.FC<EncuentrosRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
  estadios = [],
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  // Reset snackbar when the form is opened or closed
  useEffect(() => {
    if (open) {
      setSnackbar({
        open: false,
        message: "",
        severity: "success",
      });
    }
  }, [open]);

  // Data states
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [series, setSeries] = useState<Record<number, Serie[]>>({});
  const [equipos, setEquipos] = useState<Record<string, Team[]>>({});
  const [loadingEquipos, setLoadingEquipos] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [_, setLoadingSubcategorias] = useState(false);

  // Form state
  const [encuentros, setEncuentros] = useState<
    ReturnType<typeof createDefaultEncuentro>[]
  >([createDefaultEncuentro()]);

  // Load subcategorias when component mounts and dialog is open
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!token || !open) return;

      try {
        setLoadingSubcategorias(true);
        // First, get the 'DEPORTES' category by nemonico
        const categoriaResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );

        if (
          categoriaResponse &&
          categoriaResponse.data &&
          categoriaResponse.data.categoriaId
        ) {
          // Then get subcategories for the found category
          const response =
            await subcategoriaService.getSubcategoriasByCategoria(
              categoriaResponse.data.categoriaId
            );
          setSubcategorias(response.data);
        } else {
          throw new Error("No se encontró la categoría DEPORTES");
        }
      } catch (error) {
        console.error("Error fetching subcategorias:", error);
        if (open) {
          // Only show error if dialog is open
          setSnackbar({
            open: true,
            message:
              error instanceof Error
                ? error.message
                : "Error al cargar las subcategorías",
            severity: "error",
          });
        }
      } finally {
        setLoadingSubcategorias(false);
      }
    };

    if (open) {
      fetchSubcategorias();
    }
  }, [open, token]);

  // Fetch series when a subcategoria is selected
  const fetchSeries = async (subcategoriaId: number) => {
    if (!subcategoriaId) return;

    try {
      setIsLoadingSeries(true);
      const response = await serieService.getSeriesBySubcategoria(
        subcategoriaId
      );
      setSeries((prev) => ({
        ...prev,
        [subcategoriaId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching series:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar las series",
        severity: "error",
      });
    } finally {
      setIsLoadingSeries(false);
    }
  };

  // Fetch teams when a serie is selected
  const fetchEquipos = async (subcategoriaId: number, serieId: number) => {
    if (!subcategoriaId || !serieId) return;
    const equipoKey = `${subcategoriaId}-${serieId}`;

    try {
      setLoadingEquipos((prev) => ({ ...prev, [equipoKey]: true }));
      const response = await teamService.getTeamsBySerie(serieId);
      setEquipos((prev) => ({
        ...prev,
        [equipoKey]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching equipos:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los equipos",
        severity: "error",
      });
    } finally {
      setLoadingEquipos((prev) => ({ ...prev, [equipoKey]: false }));
    }
  };

  // Handle form field changes
  const handleInputChange = (
    index: number,
    field: keyof ReturnType<typeof createDefaultEncuentro>,
    value: any
  ) => {
    const updatedEncuentros = [...encuentros];
    updatedEncuentros[index] = { ...updatedEncuentros[index], [field]: value };

    // Special handling for date/time fields
    if (field === "fecha" || field === "hora") {
      const fecha = field === "fecha" ? value : updatedEncuentros[index].fecha;
      const hora = field === "hora" ? value : updatedEncuentros[index].hora;

      if (fecha && hora) {
        try {
          const date = parse(
            `${fecha} ${hora}`,
            "yyyy-MM-dd HH:mm",
            new Date()
          );
          updatedEncuentros[index].fecha = format(date, "yyyy-MM-dd");
          updatedEncuentros[index].hora = format(date, "HH:mm");
        } catch (error) {
          console.error("Error parsing date/time:", error);
        }
      }
    }

    // Update dependent fields
    if (field === "fecha" || field === "hora") {
      const [year, month, day] = updatedEncuentros[index].fecha
        .split("-")
        .map(Number);
      const [hours, minutes] = updatedEncuentros[index].hora
        .split(":")
        .map(Number);
      updatedEncuentros[index].fecha = format(
        new Date(year, month - 1, day, hours, minutes),
        "yyyy-MM-dd"
      );
      updatedEncuentros[index].hora = format(
        new Date(year, month - 1, day, hours, minutes),
        "HH:mm"
      );
    }

    setEncuentros(updatedEncuentros);
  };

  // Handle subcategoria change
  const handleSubcategoriaChange = (index: number, subcategoriaId: number) => {
    const updatedEncuentros = [...encuentros];
    updatedEncuentros[index] = {
      ...updatedEncuentros[index],
      subcategoriaId,
      serieId: 0,
      equipoLocalId: 0,
      equipoVisitanteId: 0,
    };
    setEncuentros(updatedEncuentros);

    if (subcategoriaId && !series[subcategoriaId]) {
      fetchSeries(subcategoriaId);
    }
  };

  // Handle serie change
  const handleSerieChange = async (index: number, serieId: number) => {
    const subcategoriaId = encuentros[index].subcategoriaId;
    const updatedEncuentros = [...encuentros];
    updatedEncuentros[index] = {
      ...updatedEncuentros[index],
      serieId,
      equipoLocalId: 0,
      equipoVisitanteId: 0,
    };
    setEncuentros(updatedEncuentros);

    if (subcategoriaId && serieId) {
      await fetchEquipos(subcategoriaId, serieId);
    }
  };

  // Add new encuentro
  const handleAddEncuentro = () => {
    setEncuentros([...encuentros, createDefaultEncuentro()]);
  };

  // Remove encuentro
  const handleRemoveEncuentro = (index: number) => {
    if (encuentros.length <= 1) return;
    setEncuentros(encuentros.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only proceed if there are encuentros to save
    if (encuentros.length === 0) {
      setSnackbar({
        open: true,
        message: "No hay encuentros para guardar",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      // Validar que todos los campos requeridos estén completos
      const encuentrosIncompletos = encuentros.some(
        (encuentro) =>
          !encuentro.subcategoriaId ||
          !encuentro.serieId ||
          !encuentro.equipoLocalId ||
          !encuentro.equipoVisitanteId ||
          !encuentro.fecha ||
          !encuentro.hora ||
          !encuentro.estadioId
      );

      if (encuentrosIncompletos) {
        setSnackbar({
          open: true,
          message: "Por favor completa todos los campos obligatorios",
          severity: "warning",
        });
        return;
      }

      // Verificar que no se repitan los mismos equipos en un mismo encuentro
      const encuentrosInvalidos = encuentros.some(
        (encuentro) => encuentro.equipoLocalId === encuentro.equipoVisitanteId
      );

      if (encuentrosInvalidos) {
        setSnackbar({
          open: true,
          message: "Los equipos local y visitante no pueden ser iguales",
          severity: "warning",
        });
        return;
      }

      // Obtener el ID de la subcategoría del primer encuentro
      const subcategoriaId = encuentros[0].subcategoriaId;

      // Preparar los datos para la API
      const encuentrosParaEnviar = encuentros.map((encuentro) => ({
        equipoLocalId: encuentro.equipoLocalId,
        equipoVisitanteId: encuentro.equipoVisitanteId,
        fecha: encuentro.fecha,
        hora: encuentro.hora,
        estadioId: encuentro.estadioId,
      }));

      // Llamar al servicio
      const response =
        await generacionEncuentroService.generarEncuentrosManuales(
          subcategoriaId,
          encuentrosParaEnviar
        );

      // Show success message
      setSnackbar({
        open: true,
        message: response.message || "Encuentro registrado exitosamente",
        severity: "success",
      });

      // Reset form
      setEncuentros([createDefaultEncuentro()]);

      // Close the dialog and refresh the parent component after a delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 100);
    } catch (error: any) {
      console.error("Error al guardar los encuentros:", error);
      let errorMessage = "Error al guardar los encuentros";

      // Check if the error has a response with data
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
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

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Reset form on close
  const handleClose = () => {
    setEncuentros([createDefaultEncuentro()]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="form-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Información de los Encuentros
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddEncuentro}
                disabled={loading}
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                    borderColor: "primary.main",
                  },
                }}
              >
                Agregar otro encuentro
              </Button>
            </Box>
            {isLoadingSeries && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {encuentros.map((encuentro, index) => (
                <Box
                  key={index}
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
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      position: "relative",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {/* Subcategoría */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl fullWidth required>
                          <InputLabel>Subcategoría</InputLabel>
                          <Select
                            value={encuentro.subcategoriaId || ""}
                            onChange={(e) =>
                              handleSubcategoriaChange(
                                index,
                                Number(e.target.value)
                              )
                            }
                            label="Subcategoría"
                          >
                            {subcategorias.map((subcategoria) => (
                              <MenuItem
                                key={subcategoria.subcategoriaId}
                                value={subcategoria.subcategoriaId}
                              >
                                {subcategoria.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Serie */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl fullWidth required>
                          <InputLabel>Serie</InputLabel>
                          <Select
                            value={encuentro.serieId || ""}
                            onChange={(e) =>
                              handleSerieChange(index, Number(e.target.value))
                            }
                            label="Serie"
                            disabled={!encuentro.subcategoriaId}
                          >
                            {series[encuentro.subcategoriaId]?.map((serie) => (
                              <MenuItem
                                key={serie.serieId}
                                value={serie.serieId}
                              >
                                {serie.nombreSerie}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Equipo Local */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl
                          fullWidth
                          required
                          disabled={
                            !encuentro.serieId ||
                            !encuentros[index].subcategoriaId
                          }
                        >
                          <InputLabel>Equipo Local</InputLabel>
                          <Select
                            value={encuentro.equipoLocalId || ""}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "equipoLocalId",
                                Number(e.target.value)
                              )
                            }
                            label="Equipo Local"
                          >
                            <MenuItem value="" disabled>
                              {loadingEquipos[
                                `${encuentro.subcategoriaId}-${encuentro.serieId}`
                              ]
                                ? "Cargando..."
                                : "Seleccione equipo local"}
                            </MenuItem>
                            {equipos[
                              `${encuentro.subcategoriaId}-${encuentro.serieId}`
                            ]?.map((equipo) => (
                              <MenuItem
                                key={`local-${equipo.equipoId}`}
                                value={equipo.equipoId}
                                disabled={
                                  equipo.equipoId ===
                                  encuentro.equipoVisitanteId
                                }
                              >
                                {equipo.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Equipo Visitante */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl
                          fullWidth
                          required
                          disabled={
                            !encuentro.serieId ||
                            !encuentros[index].subcategoriaId
                          }
                        >
                          <InputLabel>Equipo Visitante</InputLabel>
                          <Select
                            value={encuentro.equipoVisitanteId || ""}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "equipoVisitanteId",
                                Number(e.target.value)
                              )
                            }
                            label="Equipo Visitante"
                          >
                            <MenuItem value="" disabled>
                              {loadingEquipos[
                                `${encuentro.subcategoriaId}-${encuentro.serieId}`
                              ]
                                ? "Cargando..."
                                : "Seleccione equipo visitante"}
                            </MenuItem>
                            {equipos[
                              `${encuentro.subcategoriaId}-${encuentro.serieId}`
                            ]?.map((equipo) => (
                              <MenuItem
                                key={`visitante-${equipo.equipoId}`}
                                value={equipo.equipoId}
                                disabled={
                                  equipo.equipoId === encuentro.equipoLocalId
                                }
                              >
                                {equipo.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Fecha */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl fullWidth required>
                          <LocalizationProvider
                            dateAdapter={AdapterDateFns}
                            adapterLocale={es}
                          >
                            <DatePicker
                              label="Fecha"
                              value={
                                encuentro.fecha
                                  ? parse(
                                      encuentro.fecha,
                                      "yyyy-MM-dd",
                                      new Date()
                                    )
                                  : null
                              }
                              onChange={(date) =>
                                handleInputChange(
                                  index,
                                  "fecha",
                                  date ? format(date, "yyyy-MM-dd") : ""
                                )
                              }
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                      "&:hover fieldset": {
                                        borderColor: "primary.light",
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>

                      {/* Hora */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl fullWidth required>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                              label="Hora"
                              ampm={false}
                              value={
                                encuentro.hora
                                  ? parse(encuentro.hora, "HH:mm", new Date())
                                  : null
                              }
                              onChange={(time) =>
                                handleInputChange(
                                  index,
                                  "hora",
                                  time ? format(time, "HH:mm") : ""
                                )
                              }
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>

                      {/* Estadio */}
                      <Box
                        sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}
                      >
                        <FormControl fullWidth required>
                          <InputLabel>Estadio/Lugar</InputLabel>
                          <Select
                            value={encuentro.estadioId || 0}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "estadioId",
                                e.target.value
                              )
                            }
                            label="Estadio/Lugar"
                          >
                            <MenuItem value={0} disabled>
                              Seleccione un estadio
                            </MenuItem>
                            {estadios.map((estadio) => (
                              <MenuItem key={estadio.id} value={estadio.id}>
                                {estadio.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Paper>
                  {encuentros.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() => handleRemoveEncuentro(index)}
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
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Guardando..." : "Guardar Encuentros"}
          </Button>
        </DialogActions>
      </form>

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
    </Dialog>
  );
};

export default EncuentrosRegisterForm;
