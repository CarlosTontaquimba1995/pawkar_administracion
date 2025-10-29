import React, { useState, useEffect } from "react";
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  EmojiEvents as EmojiEventsIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  SportsSoccer as StadiumIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import encuentroService from "@/api/encuentroService";
import subcategoriaService from "@/api/subcategoriaService";
import serieService from "@/api/serieService";
import teamService from "@/api/teamService";
import { Subcategoria } from "@/types/subcategoria.types";
import { Serie } from "@/types/serie.types";
import { Team } from "@/types/team.types";
import { EstadoEncuentro } from "@/types/encuentro.types";

// Alert component for snackbar
const Alert = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

Alert.displayName = "Alert";

interface EncuentrosRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EncuentroFormData {
  fecha: Date;
  hora: Date;
  estado: EstadoEncuentro;
  estadioLugar: string;
  subcategoriaId: number;
  serieId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
}

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
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [series, setSeries] = useState<Record<number, Serie[]>>({});
  const [loadingSeries, setLoadingSeries] = useState<Record<number, boolean>>(
    {}
  );
  const [equipos, setEquipos] = useState<Record<number, Team[]>>({});
  const [loadingEquipos, setLoadingEquipos] = useState<Record<number, boolean>>(
    {}
  );
  const [encuentros, setEncuentros] = useState<EncuentroFormData[]>([
    {
      fecha: new Date(),
      hora: new Date(),
      estado: "PENDIENTE",
      estadioLugar: "",
      subcategoriaId: 0,
      serieId: 0,
      equipoLocalId: 0,
      equipoVisitanteId: 0,
    },
  ]);

  // Load subcategorias on mount
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

  // Load series when subcategoria changes
  const fetchSeries = async (subcategoriaId: number) => {
    if (!token || !subcategoriaId) return;

    try {
      setLoadingSeries((prev) => ({ ...prev, [subcategoriaId]: true }));
      const response = await serieService.getSeriesBySubcategoria(
        subcategoriaId
      );
      setSeries((prev) => ({ ...prev, [subcategoriaId]: response.data }));
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

  const handleAddEncuentro = () => {
    setEncuentros([
      ...encuentros,
      {
        fecha: new Date(),
        hora: new Date(),
        estado: "PENDIENTE",
        estadioLugar: "",
        subcategoriaId: 0,
        serieId: 0,
        equipoLocalId: 0,
        equipoVisitanteId: 0,
      },
    ]);
  };

  const handleRemoveEncuentro = (index: number) => {
    if (encuentros.length === 1) return; // Don't remove the last encounter
    const newEncuentros = [...encuentros];
    newEncuentros.splice(index, 1);
    setEncuentros(newEncuentros);
  };

  const handleEncuentroChange = (
    index: number,
    field: keyof EncuentroFormData,
    value: any
  ) => {
    if (field === "subcategoriaId" && value !== 0) {
      // Reset dependent fields when subcategoria changes
      value = parseInt(value);
      setEncuentros((prev) => {
        const newEncuentros = [...prev];
        newEncuentros[index] = {
          ...newEncuentros[index],
          [field]: value,
        };
        return newEncuentros;
      });

      // Load series for the selected subcategoria
      fetchSeries(value);
    } else {
      const newEncuentros = [...encuentros];
      newEncuentros[index] = {
        ...newEncuentros[index],
        [field]: value,
      };
      setEncuentros(newEncuentros);
    }
  };

  const handleSerieChange = async (index: number, serieId: number) => {
    const updatedEncuentros = [...encuentros];
    updatedEncuentros[index] = {
      ...updatedEncuentros[index],
      serieId,
      equipoLocalId: 0,
      equipoVisitanteId: 0,
    };
    setEncuentros(updatedEncuentros);

    // Si ya tenemos los equipos de esta serie, no hacemos nada
    if (equipos[serieId]) return;

    try {
      // Actualizar el estado de carga para esta serie
      setLoadingEquipos((prev) => ({
        ...prev,
        [serieId]: true,
      }));

      // Obtener los equipos de la serie seleccionada
      const response = await teamService.getTeamsBySerie(serieId);

      // Actualizar el estado de los equipos
      setEquipos((prev) => ({
        ...prev,
        [serieId]: response.data || [],
      }));
    } catch (error) {
      console.error("Error al cargar los equipos:", error);
      // Mostrar mensaje de error al usuario
      setSnackbar({
        open: true,
        message: "Error al cargar los equipos de la serie",
        severity: "error",
      });
    } finally {
      // Actualizar el estado de carga
      setLoadingEquipos((prev) => ({
        ...prev,
        [serieId]: false,
      }));
    }
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateEncuentros = (): boolean => {
    // Check if there's at least one encounter
    if (encuentros.length === 0) {
      setSnackbar({
        open: true,
        message: "Debe agregar al menos un encuentro",
        severity: "error",
      });
      return false;
    }

    // Validate each encounter
    for (let i = 0; i < encuentros.length; i++) {
      const encuentro = encuentros[i];

      if (!encuentro.fecha) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: La fecha es requerida`,
          severity: "error",
        });
        return false;
      }

      if (!encuentro.hora) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: La hora es requerida`,
          severity: "error",
        });
        return false;
      }

      if (!encuentro.estadioLugar.trim()) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: El estadio o lugar es requerido`,
          severity: "error",
        });
        return false;
      }

      if (!encuentro.subcategoriaId) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: Debe seleccionar una categoría`,
          severity: "error",
        });
        return false;
      }

      if (!encuentro.serieId) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: Debe seleccionar una serie`,
          severity: "error",
        });
        return false;
      }

      if (!encuentro.equipoLocalId) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: Debe seleccionar el equipo local`,
          severity: "error",
        });
        return false;
      }

      if (!encuentro.equipoVisitanteId) {
        setSnackbar({
          open: true,
          message: `Encuentro ${i + 1}: Debe seleccionar el equipo visitante`,
          severity: "error",
        });
        return false;
      }

      if (encuentro.equipoLocalId === encuentro.equipoVisitanteId) {
        setSnackbar({
          open: true,
          message: `Encuentro ${
            i + 1
          }: El equipo local y visitante no pueden ser iguales`,
          severity: "error",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateEncuentros()) {
      return;
    }

    if (!token) {
      setSnackbar({
        open: true,
        message: "No se encontró el token de autenticación",
        severity: "error",
      });
      return;
    }

    if (!validateEncuentros()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data for bulk creation
      const encuentrosToSubmit = encuentros.map((encuentro) => ({
        fechaHora: new Date(
          encuentro.fecha.getFullYear(),
          encuentro.fecha.getMonth(),
          encuentro.fecha.getDate(),
          encuentro.hora.getHours(),
          encuentro.hora.getMinutes()
        ).toISOString(),
        estado: "PENDIENTE" as EstadoEncuentro,
        estadioLugar: encuentro.estadioLugar,
        subcategoriaId: encuentro.subcategoriaId,
        serieId: encuentro.serieId,
        equipoLocalId: encuentro.equipoLocalId,
        equipoVisitanteId: encuentro.equipoVisitanteId,
      }));

      // Submit all encuentros in a single request
      await encuentroService.createMultipleEncuentros({
        encuentros: encuentrosToSubmit,
      });

      setSnackbar({
        open: true,
        message: "Encuentros registrados exitosamente",
        severity: "success",
      });

      // Notify parent component and close the modal after a short delay
      onSuccess();

      // Reset form after a short delay to show success message
      setTimeout(() => {
        setEncuentros([
          {
            fecha: new Date(),
            hora: new Date(),
            estado: "PENDIENTE",
            estadioLugar: "",
            subcategoriaId: 0,
            serieId: 0,
            equipoLocalId: 0,
            equipoVisitanteId: 0,
          },
        ]);
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error("Error al registrar los encuentros:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Error al registrar los encuentros",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form when closing
  const handleClose = () => {
    setEncuentros([
      {
        fecha: new Date(),
        hora: new Date(),
        estado: "PENDIENTE",
        estadioLugar: "",
        subcategoriaId: 0,
        serieId: 0,
        equipoLocalId: 0,
        equipoVisitanteId: 0,
      },
    ]);
    onClose();
  };

  return (
    <>
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

      <Dialog
        open={open}
        onClose={!loading ? handleClose : undefined}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <form onSubmit={handleSubmit} id="encuentro-form">
          <DialogTitle>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Registro de Encuentros</Typography>
              <IconButton onClick={handleClose} size="small" disabled={loading}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {encuentros.map((encuentro, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  position: "relative",
                  overflow: "visible",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    "& .delete-button": {
                      opacity: 1,
                      visibility: "visible",
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box display="flex" alignItems="center" color="primary.main">
                    <StadiumIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      Información del Encuentro {index + 1}
                    </Typography>
                  </Box>
                  {encuentros.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEncuentro(index);
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
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr 1fr" }}
                  gap={2}
                  mb={2}
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      label="Fecha"
                      value={encuentro.fecha}
                      onChange={(newValue) =>
                        handleEncuentroChange(
                          index,
                          "fecha",
                          newValue || new Date()
                        )
                      }
                      disabled={loading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          required: true,
                          InputProps: {
                            startAdornment: (
                              <EventIcon
                                sx={{ mr: 1, color: "action.active" }}
                              />
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <TimePicker
                      label="Hora"
                      value={encuentro.hora}
                      onChange={(newValue) =>
                        handleEncuentroChange(
                          index,
                          "hora",
                          newValue || new Date()
                        )
                      }
                      disabled={loading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          required: true,
                          InputProps: {
                            startAdornment: (
                              <AccessTimeIcon
                                sx={{ mr: 1, color: "action.active" }}
                              />
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <TextField
                    fullWidth
                    size="small"
                    label="Estadio/Lugar"
                    value={encuentro.estadioLugar}
                    onChange={(e) =>
                      handleEncuentroChange(
                        index,
                        "estadioLugar",
                        e.target.value
                      )
                    }
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <StadiumIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                  />
                </Box>

                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                  gap={2}
                  mb={2}
                >
                  <FormControl fullWidth size="small" required>
                    <InputLabel id={`subcategoria-label-${index}`}>
                      Subcategoría
                    </InputLabel>
                    <Select
                      labelId={`subcategoria-label-${index}`}
                      value={encuentro.subcategoriaId || ""}
                      label="Subcategoría"
                      onChange={(e) =>
                        handleEncuentroChange(
                          index,
                          "subcategoriaId",
                          Number(e.target.value)
                        )
                      }
                      disabled={loading || loadingSubcategorias}
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                        },
                      }}
                    >
                      {loadingSubcategorias ? (
                        <MenuItem value="">
                          <CircularProgress size={24} />
                        </MenuItem>
                      ) : subcategorias.length > 0 ? (
                        subcategorias.map((subcategoria) => (
                          <MenuItem
                            key={subcategoria.subcategoriaId}
                            value={subcategoria.subcategoriaId}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <FilterListIcon fontSize="small" />
                            {subcategoria.nombre}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          No hay subcategorías disponibles
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" required>
                    <InputLabel id={`serie-label-${index}`}>Serie</InputLabel>
                    <Select
                      labelId={`serie-label-${index}`}
                      value={encuentro.serieId || ""}
                      label="Serie"
                      onChange={(e) => {
                        const serieId = Number(e.target.value);
                        handleSerieChange(index, serieId);
                      }}
                      disabled={
                        loading ||
                        loadingSeries[encuentro.subcategoriaId] ||
                        !encuentro.subcategoriaId
                      }
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                        },
                      }}
                    >
                      {loadingSeries[encuentro.subcategoriaId] ? (
                        <MenuItem value="">
                          <CircularProgress size={24} />
                        </MenuItem>
                      ) : series[encuentro.subcategoriaId]?.length > 0 ? (
                        series[encuentro.subcategoriaId].map((serie) => (
                          <MenuItem
                            key={serie.serieId}
                            value={serie.serieId}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <EmojiEventsIcon fontSize="small" />
                            {serie.nombreSerie}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          {encuentro.subcategoriaId
                            ? "No hay series disponibles"
                            : "Seleccione una subcategoría"}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                  gap={2}
                  mb={2}
                >
                  <FormControl fullWidth size="small" required>
                    <InputLabel id={`local-label-${index}`}>
                      Equipo Local
                    </InputLabel>
                    <Select
                      labelId={`local-label-${index}`}
                      value={encuentro.equipoLocalId}
                      label="Equipo Local"
                      onChange={(e) =>
                        handleEncuentroChange(
                          index,
                          "equipoLocalId",
                          Number(e.target.value)
                        )
                      }
                      disabled={
                        !encuentro.serieId || loadingEquipos[encuentro.serieId]
                      }
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                        },
                      }}
                    >
                      <MenuItem value={0} disabled>
                        {loadingEquipos[encuentro.serieId] ? (
                          <CircularProgress size={24} />
                        ) : equipos[encuentro.serieId]?.length > 0 ? (
                          "Seleccione equipo local"
                        ) : (
                          "No hay equipos disponibles"
                        )}
                      </MenuItem>
                      {equipos[encuentro.serieId]?.map((equipo) => (
                        <MenuItem
                          key={`local-${equipo.equipoId}`}
                          value={equipo.equipoId}
                          disabled={
                            equipo.equipoId === encuentro.equipoVisitanteId
                          }
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <GroupIcon fontSize="small" />
                          {equipo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" required>
                    <InputLabel id={`visitante-label-${index}`}>
                      Equipo Visitante
                    </InputLabel>
                    <Select
                      labelId={`visitante-label-${index}`}
                      value={encuentro.equipoVisitanteId}
                      label="Equipo Visitante"
                      onChange={(e) =>
                        handleEncuentroChange(
                          index,
                          "equipoVisitanteId",
                          Number(e.target.value)
                        )
                      }
                      disabled={
                        !encuentro.serieId || loadingEquipos[encuentro.serieId]
                      }
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 1.5,
                        },
                      }}
                    >
                      <MenuItem value={0} disabled>
                        {loadingEquipos[encuentro.serieId] ? (
                          <CircularProgress size={24} />
                        ) : equipos[encuentro.serieId]?.length > 0 ? (
                          "Seleccione equipo visitante"
                        ) : (
                          "No hay equipos disponibles"
                        )}
                      </MenuItem>
                      {equipos[encuentro.serieId]?.map((equipo) => (
                        <MenuItem
                          key={`visitante-${equipo.equipoId}`}
                          value={equipo.equipoId}
                          disabled={equipo.equipoId === encuentro.equipoLocalId}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <GroupIcon fontSize="small" />
                          {equipo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            ))}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddEncuentro}
                disabled={loading}
                variant="outlined"
                size="small"
                sx={{ minWidth: "180px" }}
              >
                Agregar Encuentro
              </Button>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  onClick={handleClose}
                  disabled={loading}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  size="small"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

export default EncuentrosRegisterForm;