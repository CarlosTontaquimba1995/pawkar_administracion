import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import teamService from "../../api/teamService";
import { Serie } from "@/types/serie.types";
import serieService from "@/api/serieService";
import subcategoriaService from "@/api/subcategoriaService";
import categoriaService from "@/api/categoriaService";

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

  // Estado para los filtros globales
  const [filters, setFilters] = useState({
    subcategoriaId: 0,
    serieId: 0,
  });

  const [teams, setTeams] = useState([{ nombre: "", fundacion: "" }]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  const handleAddTeam = () => {
    setTeams([...teams, { nombre: "", fundacion: "" }]);
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
    newTeams[index] = { ...newTeams[index], [field]: value };
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

    // Validar que se hayan seleccionado subcategoría y serie
    if (!filters.subcategoriaId || !filters.serieId) {
      setSnackbar({
        open: true,
        message: "Por favor seleccione una subcategoría y una serie",
        severity: "error",
      });
      return;
    }

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

    // Preparar los datos con los filtros globales
    const teamsWithFilters = teams.map((team) => ({
      ...team,
      subcategoriaId: filters.subcategoriaId,
      serieId: filters.serieId,
    }));

    try {
      setLoading(true);
      const response = await teamService.createTeamsBulk({
        equipos: teamsWithFilters,
      });

      setSnackbar({
        open: true,
        message: response.message || "Equipos registrados exitosamente",
        severity: "success",
      });

      setTimeout(() => {
        onSuccess();
        onClose();
        setTeams([{ nombre: "", fundacion: "" }]);
      }, 100);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error al registrar equipos",
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
        const newFilters = { ...filters, serieId: seriesData.data[0].serieId };
        setFilters(newFilters);
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

  // Manejador para cambios en los filtros globales
  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    // Si se cambia la subcategoría, cargar las series correspondientes
    if (field === "subcategoriaId" && value) {
      const subcategoriaId = Number(value);
      if (!series[subcategoriaId]) {
        fetchSeriesForSubcategoria(subcategoriaId);
      }
      // Resetear la serie cuando cambia la subcategoría
      setFilters((prev) => ({ ...prev, serieId: 0 }));
    }
  };

  // Fetch subcategorias when the component mounts
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!token) return;

      setLoadingSubcategorias(true);
      setSubcategoriaError("");

      try {
        // First, get the DEPORTES category
        const categoriaResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );
        const categoriaId = categoriaResponse.data?.categoriaId;

        if (!categoriaId) {
          throw new Error("No se pudo obtener el ID de la categoría DEPORTES");
        }

        // Then get subcategories for this category
        const response = await subcategoriaService.getSubcategoriasByCategoria(
          categoriaId
        );

        if (response.success && Array.isArray(response.data)) {
          setSubcategorias(response.data);

          // Only update if we have subcategories
          if (response.data.length > 0) {
            // Check if current subcategoryId is valid
            const currentSubcategoriaId = filters.subcategoriaId;
            const isValidSubcategoria = response.data.some(
              (sub) => sub.subcategoriaId === currentSubcategoriaId
            );

            // If no valid subcategory is selected, set the first one
            if (!isValidSubcategoria) {
              const newFilters = {
                ...filters,
                subcategoriaId: response.data[0].subcategoriaId,
              };
              setFilters(newFilters);
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
          component: "form",
          onSubmit: handleSubmit,
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
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            {/* Filtros globales */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                Filtros para todos los equipos
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={2}
              >
                <FormControl fullWidth size="small" required>
                  <InputLabel>Subcategoría</InputLabel>
                  <Select
                    value={filters.subcategoriaId || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "subcategoriaId",
                        Number(e.target.value)
                      )
                    }
                    label="Subcategoría"
                    disabled={loadingSubcategorias}
                    variant="outlined"
                  >
                    {loadingSubcategorias ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : subcategorias.length > 0 ? (
                      subcategorias.map((sub) => (
                        <MenuItem
                          key={sub.subcategoriaId}
                          value={sub.subcategoriaId}
                        >
                          <FilterListIcon fontSize="small" />
                          {sub.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No hay subcategorías disponibles
                      </MenuItem>
                    )}
                  </Select>
                  {subcategoriaError && (
                    <Typography color="error" variant="caption">
                      {subcategoriaError}
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth size="small" required>
                  <InputLabel>Serie</InputLabel>
                  <Select
                    value={filters.serieId || ""}
                    onChange={(e) =>
                      handleFilterChange("serieId", Number(e.target.value))
                    }
                    label="Serie"
                    disabled={
                      !filters.subcategoriaId ||
                      loadingSeries[filters.subcategoriaId]
                    }
                    variant="outlined"
                  >
                    {loadingSeries[filters.subcategoriaId] ? (
                      <MenuItem value="">
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : series[filters.subcategoriaId]?.length > 0 ? (
                      series[filters.subcategoriaId].map((serie) => (
                        <MenuItem key={serie.serieId} value={serie.serieId}>
                          <FilterListIcon fontSize="small" />
                          {serie.nombreSerie}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        {filters.subcategoriaId
                          ? "No hay series disponibles"
                          : "Seleccione una subcategoría"}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {teams.map((team, index) => (
              <React.Fragment key={`team-${index}`}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    position: "relative",
                    mb: 3,
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
                        "&:hover": {
                          backgroundColor: "error.dark",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Equipo {index + 1}
                  </Typography>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                    gap={2}
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
                      placeholder="Ej: Equipo A"
                    />
                    <TextField
                      label="Fecha de Fundación"
                      type="date"
                      value={team.fundacion}
                      onChange={(e) => {
                        const dateValue = e.target.value;
                        if (!dateValue || dateValue.split("-")[0].length <= 4) {
                          handleTeamChange(index, "fundacion", dateValue);
                        }
                      }}
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        max: new Date().toISOString().split("T")[0],
                      }}
                      InputProps={{
                        endAdornment: (
                          <CalendarTodayIcon fontSize="small" color="action" />
                        ),
                      }}
                    />
                  </Box>
                </Paper>
              </React.Fragment>
            ))}
          </Box>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddTeam}
            disabled={loading || !filters.subcategoriaId || !filters.serieId}
            size="small"
            sx={{ mb: 2 }}
          >
            Agregar Equipo
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || teams.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <GroupIcon />}
          >
            {loading ? "Registrando..." : "Registrar Equipos"}
          </Button>
        </DialogActions>
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

export default RegisterTeam;
