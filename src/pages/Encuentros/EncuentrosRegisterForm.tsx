import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
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
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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

interface EncuentrosRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
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

  // Loading states
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState<Record<number, boolean>>(
    {}
  );
  const [loadingEquipos, setLoadingEquipos] = useState<Record<string, boolean>>(
    {}
  );

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
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Registrar Encuentros</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {encuentros.map((encuentro, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                mb: 3,
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
                  overflow: "visible",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1">
                    Encuentro {index + 1}
                  </Typography>
                </Box>

                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                  gap={2}
                >
                  {/* Fecha */}
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      label="Fecha"
                      value={encuentro.fecha ? parseISO(encuentro.fecha) : null}
                      onChange={(date) => {
                        handleInputChange(
                          index,
                          "fecha",
                          date ? format(date, "yyyy-MM-dd") : ""
                        );
                      }}
                      slotProps={{
                        textField: { fullWidth: true, required: true },
                      }}
                    />
                  </LocalizationProvider>

                  {/* Hora */}
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <TimePicker
                      label="Hora"
                      value={
                        encuentro.hora
                          ? parseISO(`1970-01-01T${encuentro.hora}`)
                          : null
                      }
                      onChange={(time) => {
                        handleInputChange(
                          index,
                          "hora",
                          time ? format(time, "HH:mm") : ""
                        );
                      }}
                      slotProps={{
                        textField: { fullWidth: true, required: true },
                      }}
                    />
                  </LocalizationProvider>

                  {/* Estadio */}
                  <TextField
                    label="Estadio/Lugar"
                    value={encuentro.estadio}
                    onChange={(e) =>
                      handleInputChange(index, "estadio", e.target.value)
                    }
                    fullWidth
                    required
                  />

                  {/* Subcategoría */}
                  <FormControl fullWidth required>
                    <InputLabel>Subcategoría</InputLabel>
                    <Select
                      value={encuentro.subcategoriaId || ""}
                      onChange={(e) =>
                        handleSubcategoriaChange(index, Number(e.target.value))
                      }
                      label="Subcategoría"
                    >
                      <MenuItem value="" disabled>
                        {loadingSubcategorias
                          ? "Cargando..."
                          : "Seleccione una subcategoría"}
                      </MenuItem>
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

                  {/* Serie */}
                  <FormControl
                    fullWidth
                    required
                    disabled={!encuentro.subcategoriaId}
                  >
                    <InputLabel>Serie</InputLabel>
                    <Select
                      value={encuentro.serieId || ""}
                      onChange={(e) =>
                        handleSerieChange(index, Number(e.target.value))
                      }
                      label="Serie"
                    >
                      <MenuItem value="" disabled>
                        {loadingSeries[encuentro.subcategoriaId]
                          ? "Cargando..."
                          : "Seleccione una serie"}
                      </MenuItem>
                      {series[encuentro.subcategoriaId]?.map((serie) => (
                        <MenuItem key={serie.serieId} value={serie.serieId}>
                          {serie.nombreSerie}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Equipo Local */}
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

                  {/* Equipo Visitante */}
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
