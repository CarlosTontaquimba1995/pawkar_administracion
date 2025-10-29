import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import { 
  Close as CloseIcon, 
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  EmojiEvents as EmojiEventsIcon,
  FilterList as FilterListIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import teamService from '../../api/teamService';
import { Serie } from "@/types/serie.types";
import serieService from "@/api/serieService";
import subcategoriaService from "@/api/subcategoriaService";

interface Subcategoria {
  subcategoriaId: number;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string;
}

// Serie interface is now imported from serieService

interface RegisterTeamProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterTeam: React.FC<RegisterTeamProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [subcategoriaError, setSubcategoriaError] = useState("");
  const [series, setSeries] = useState<Record<number, Serie[]>>({});
  const [loadingSeries, setLoadingSeries] = useState<Record<number, boolean>>(
    {}
  );

  const [teams, setTeams] = useState([
    { subcategoriaId: 0, serieId: 3, nombre: "", fundacion: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  const handleAddTeam = () => {
    setTeams([
      ...teams,
      { subcategoriaId: 5, serieId: 3, nombre: "", fundacion: "" },
    ]);
  };

  const handleRemoveTeam = (index: number) => {
    const newTeams = [...teams];
    newTeams.splice(index, 1);
    setTeams(newTeams);
  };

  const handleTeamChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newTeams = [...teams];
    const previousValue = newTeams[index][field as keyof (typeof newTeams)[0]];
    newTeams[index] = { ...newTeams[index], [field]: value };

    // If subcategory changed, fetch series for the new subcategory
    if (field === "subcategoriaId" && previousValue !== value) {
      fetchSeriesForSubcategoria(Number(value));

      // Reset serieId when subcategory changes
      newTeams[index].serieId = 0;
    }

    setTeams(newTeams);
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

    // Validate all fields are filled
    const hasEmptyFields = teams.some(
      (team) => !team.nombre || !team.fundacion
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
      await teamService.createTeamsBulk({ equipos: teams });

      setSnackbar({
        open: true,
        message: "Equipos registrados exitosamente",
        severity: "success",
      });

      // Call onSuccess to notify parent component
      onSuccess();

      // Reset form and close the modal after a short delay
      setTimeout(() => {
        setTeams([
          { subcategoriaId: 5, serieId: 3, nombre: "", fundacion: "" },
        ]);
      }, 1000);
    } catch (error: any) {
      console.error("Error al registrar equipos:", error);
      const errorMessage =
        error.response?.data?.message || "Error al registrar los equipos";
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

  // Fetch series for a specific subcategoria
  const fetchSeriesForSubcategoria = async (subcategoriaId: number) => {
    if (!token || !subcategoriaId) return;

    // Don't fetch if we already have the series for this subcategoria
    if (series[subcategoriaId]) return;

    setLoadingSeries((prev) => ({ ...prev, [subcategoriaId]: true }));

    try {
      const seriesData = await serieService.getSeriesBySubcategoria(
        subcategoriaId
      );

      setSeries((prev) => ({
        ...prev,
        [subcategoriaId]: seriesData.data,
      }));

      // If this is the first series for this subcategoria, set it as default
      if (seriesData.data.length > 0) {
        const newTeams = [...teams];
        const teamIndex = newTeams.findIndex(
          (t) => t.subcategoriaId === subcategoriaId
        );
        if (teamIndex !== -1 && !newTeams[teamIndex].serieId) {
          newTeams[teamIndex].serieId = seriesData.data[0].serieId;
          setTeams(newTeams);
        }
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar las series. Por favor, intente nuevamente.",
        severity: "error",
      });
    } finally {
      setLoadingSeries((prev) => ({ ...prev, [subcategoriaId]: false }));
    }
  };

  // Fetch subcategorias when the component mounts
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!token) return;

      setLoadingSubcategorias(true);
      setSubcategoriaError("");

      try {
        const response = await subcategoriaService.getSubcategorias();

        if (response.success && Array.isArray(response.data)) {
          setSubcategorias(response.data);

          // Only update if we have subcategories
          if (response.data.length > 0) {
            // Check if current subcategoryId is valid
            const currentSubcategoriaId = teams[0]?.subcategoriaId;
            const isValidSubcategoria = response.data.some(
              (sub) => sub.subcategoriaId === currentSubcategoriaId
            );

            // If no valid subcategory is selected, set the first one
            if (!isValidSubcategoria) {
              const newTeams = [...teams];
              newTeams[0] = {
                ...newTeams[0],
                subcategoriaId: response.data[0].subcategoriaId,
              };
              setTeams(newTeams);
              fetchSeriesForSubcategoria(response.data[0].subcategoriaId);
            } else if (currentSubcategoriaId) {
              // If we have a valid subcategory, make sure to fetch its series
              fetchSeriesForSubcategoria(currentSubcategoriaId);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching subcategorias:", error);
        setSubcategoriaError("No se pudieron cargar las subcategorías");
      } finally {
        setLoadingSubcategorias(false);
      }
    };

    if (open) {
      fetchSubcategorias();
    }
  }, [token, open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Inscripción de Equipos</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {/* Team Information */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid #ddd",
                borderRadius: 2,
                position: "relative",
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <EmojiEventsIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Información del Torneo
                </Typography>
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={2}
                mb={2}
              >
                <FormControl fullWidth size="small" required>
                  <InputLabel id="subcategoria-label">Subcategoría</InputLabel>
                  <Select
                    value={teams[0]?.subcategoriaId || ""}
                    onChange={(e) => {
                      const subcategoriaId = Number(e.target.value);
                      const newTeams = [...teams];
                      newTeams[0] = { ...newTeams[0], subcategoriaId };
                      setTeams(newTeams);
                      fetchSeriesForSubcategoria(subcategoriaId);
                    }}
                    disabled={loadingSubcategorias}
                  >
                    {subcategorias.map((sub) => (
                      <MenuItem
                        key={sub.subcategoriaId}
                        value={sub.subcategoriaId}
                      >
                        {sub.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {subcategoriaError && (
                    <Typography color="error" variant="caption">
                      {subcategoriaError}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth size="small" required>
                  <InputLabel id="serie-label">Serie</InputLabel>
                  <Select
                    labelId="serie-label"
                    value={teams[0]?.serieId || ""}
                    onChange={(e) =>
                      handleTeamChange(0, "serieId", Number(e.target.value))
                    }
                    label="Serie"
                    disabled={
                      loadingSeries[teams[0]?.subcategoriaId] ||
                      !teams[0]?.subcategoriaId
                    }
                    variant="outlined"
                    sx={{
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1.5,
                      },
                    }}
                  >
                    {loadingSeries[teams[0]?.subcategoriaId] ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : series[teams[0]?.subcategoriaId]?.length > 0 ? (
                      series[teams[0]?.subcategoriaId].map((serie) => (
                        <MenuItem
                          key={serie.serieId}
                          value={serie.serieId}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <FilterListIcon fontSize="small" />
                          {serie.nombreSerie}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        {teams[0]?.subcategoriaId
                          ? "No hay series disponibles"
                          : "Seleccione una subcategoría"}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ mt: 3, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTeam}
                disabled={
                  loading || !teams[0]?.subcategoriaId || !teams[0]?.serieId
                }
                size="small"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 1,
                  },
                }}
              >
                Agregar Equipo
              </Button>
            </Box>

            {teams.map((team, index) => (
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
                    },
                  }}
                >
                  {teams.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() => handleRemoveTeam(index)}
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

                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                    gap={2}
                    mb={2}
                  >
                    <TextField
                      label="Nombre del Equipo"
                      value={team.nombre}
                      onChange={(e) =>
                        handleTeamChange(index, "nombre", e.target.value)
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "primary.light",
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Fecha de Fundación"
                      type="date"
                      value={team.fundacion}
                      onChange={(e) =>
                        handleTeamChange(index, "fundacion", e.target.value)
                      }
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        endAdornment: (
                          <CalendarTodayIcon fontSize="small" color="action" />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: "primary.light",
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            ))}

            <DialogActions sx={{ px: 0, py: 2, mt: 2 }}>
              <Button
                onClick={onClose}
                disabled={loading}
                variant="outlined"
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
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || teams.length === 0}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <GroupIcon />
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
                {loading ? "Registrando..." : "Registrar Equipos"}
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

export default RegisterTeam;
