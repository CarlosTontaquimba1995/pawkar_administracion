import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  Paper,
  FormHelperText,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { format, parseISO, parse } from "date-fns";

// Services
import { useAuth } from "@/contexts/AuthContext";
import subcategoriaService from "@/api/subcategoriaService";
import serieService from "@/api/serieService";
import teamService from "@/api/teamService";

// Types
import {
  CreateEncuentroRequest,
  EstadoEncuentro,
} from "@/types/encuentro.types";
import { Subcategoria } from "@/types/subcategoria.types";
import { Serie } from "@/types/serie.types";
import { Team } from "@/types/team.types";
import { generacionEncuentroService } from "@/api/generacionEncuentroService";
import { GenerarEncuentrosRequest } from "@/types/generacionEncuentro.types";
import { Estadio } from "@/types/estadio.types";

interface EncuentrosRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  estadios: Estadio[];
}

interface EncuentroFormData
  extends Omit<CreateEncuentroRequest, "fecha" | "hora"> {
  fechaHora: Date | null;
  fecha: string;
  hora: string;
  subcategoriaId: number;
  serieId: number;
  estado?: EstadoEncuentro;
}

const defaultEncuentro: EncuentroFormData = {
  fechaHora: new Date(),
  fecha: format(new Date(), "yyyy-MM-dd"),
  hora: format(new Date(), "HH:mm"),
  estadio: "",
  equipoLocalId: 0,
  equipoVisitanteId: 0,
  subcategoriaId: 0,
  serieId: 0,
  estado: "PROGRAMADO",
};

const EncuentrosRegisterForm: React.FC<EncuentrosRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
  estadios = []
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Data states
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [series, setSeries] = useState<Record<number, Serie[]>>({});
  const [equipos, setEquipos] = useState<Record<string, Team[]>>({});
  const [loadingEquipos, setLoadingEquipos] = useState<Record<string, boolean>>({});
  const [loadingSeries, setLoadingSeries] = useState<Record<number, boolean>>({});
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);

  // Form state
  const [encuentros, setEncuentros] = useState<EncuentroFormData[]>([
    { ...defaultEncuentro },
  ]);

  // Load subcategorias when component mounts
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!token) return;

      try {
        setLoadingSubcategorias(true);
        const response = await subcategoriaService.getSubcategorias();
        setSubcategorias(response.data);
      } catch (error) {
        console.error("Error fetching subcategorias:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar las subcategorías",
          severity: "error",
        });
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
      setLoadingSeries((prev) => ({ ...prev, [subcategoriaId]: true }));
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
      setLoadingSeries((prev) => ({ ...prev, [subcategoriaId]: false }));
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
    field: keyof EncuentroFormData,
    value: any
  ) => {
    const updatedEncuentros = [...encuentros];
    updatedEncuentros[index] = { ...updatedEncuentros[index], [field]: value };

    // Update dependent fields
    if (field === "fecha" || field === "hora") {
      const [year, month, day] = updatedEncuentros[index].fecha
        .split("-")
        .map(Number);
      const [hours, minutes] = updatedEncuentros[index].hora
        .split(":")
        .map(Number);
      updatedEncuentros[index].fechaHora = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
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
    setEncuentros([...encuentros, { ...defaultEncuentro }]);
  };

  // Remove encuentro
  const handleRemoveEncuentro = (index: number) => {
    if (encuentros.length <= 1) return;
    setEncuentros(encuentros.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);

      // Prepare data for API
      const requestData: GenerarEncuentrosRequest = {
        subcategoriaId: encuentros[0].subcategoriaId,
        tipoGeneracion: "SELECCION_MANUAL",
        encuentrosManuales: encuentros.map((encuentro) => ({
          equipoLocalId: encuentro.equipoLocalId,
          equipoVisitanteId: encuentro.equipoVisitanteId,
          fecha: encuentro.fecha,
          hora: encuentro.hora,
          estadio: encuentro.estadio,
        })),
      };

      const response = await generacionEncuentroService.generarEncuentros(
        requestData
      );

      onSuccess(response.message || "Encuentros creados");
      onClose();
      setEncuentros([{ ...defaultEncuentro }]);
    } catch (error) {
      console.error("Error creating encuentros:", error);
      setSnackbar({
        open: true,
        message: "Error al crear los encuentros",
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
    setEncuentros([{ ...defaultEncuentro }]);
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {encuentros.map((encuentro, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    '& .delete-button': {
                      opacity: 1,
                      visibility: 'visible',
                    },
                  },
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Subcategoría */}
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth required>
                      <InputLabel>Subcategoría</InputLabel>
                      <Select
                        value={encuentro.subcategoriaId || ''}
                        onChange={(e) =>
                          handleSubcategoriaChange(index, Number(e.target.value))
                        }
                        label="Subcategoría"
                      >
                        {subcategorias.map((subcategoria) => (
                          <MenuItem key={subcategoria.subcategoriaId} value={subcategoria.subcategoriaId}>
                            {subcategoria.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Serie */}
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth required>
                      <InputLabel>Serie</InputLabel>
                      <Select
                        value={encuentro.serieId || ''}
                        onChange={(e) =>
                          handleSerieChange(index, Number(e.target.value))
                        }
                        label="Serie"
                        disabled={!encuentro.subcategoriaId}
                      >
                        {series[encuentro.subcategoriaId]?.map((serie) => (
                          <MenuItem key={serie.serieId} value={serie.serieId}>
                            {serie.nombreSerie}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Equipo Local */}
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl
                      fullWidth
                      required
                      disabled={
                        !encuentro.serieId || !encuentros[index].subcategoriaId
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
                              equipo.equipoId === encuentro.equipoVisitanteId
                            }
                          >
                            {equipo.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Equipo Visitante */}
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl
                      fullWidth
                      required
                      disabled={
                        !encuentro.serieId || !encuentros[index].subcategoriaId
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
                            disabled={equipo.equipoId === encuentro.equipoLocalId}
                          >
                            {equipo.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Fecha */}
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth required>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Fecha"
                          value={encuentro.fecha ? parse(encuentro.fecha, 'yyyy-MM-dd', new Date()) : null}
                          onChange={(date) =>
                            handleInputChange(
                              index,
                              "fecha",
                              date ? format(date, "yyyy-MM-dd") : ""
                            )
                          }
                        />
                      </LocalizationProvider>
                    </FormControl>
                  </Box>

                  {/* Hora */}
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth required>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Hora"
                          value={encuentro.hora ? parse(encuentro.hora, 'HH:mm', new Date()) : null}
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
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth required>
                      <InputLabel>Estadio/Lugar</InputLabel>
                      <Select
                        value={encuentro.estadio || ""}
                        onChange={(e) =>
                          handleInputChange(index, "estadio", e.target.value)
                        }
                        label="Estadio/Lugar"
                      >
                        {estadios.map((estadio) => (
                          <MenuItem key={estadio.id} value={estadio.nombre}>
                            {estadio.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Paper>
            ))}

            <Box mt={2}>
              <Button
                onClick={handleAddEncuentro}
                startIcon={<AddIcon />}
                variant="outlined"
                fullWidth
              >
                Agregar Otro Encuentro
              </Button>
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
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
};

export default EncuentrosRegisterForm;
