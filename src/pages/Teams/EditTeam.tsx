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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close as CloseIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import teamService from '../../api/teamService';
import serieService, { Serie } from '../../api/serieService';

interface Subcategoria {
  subcategoriaId: number;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string;
}

interface EditTeamProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teamId: number;
}

interface TeamData {
  equipoId: number;
  subcategoriaId: number;
  subcategoriaNombre: string;
  serieId: number;
  serieNombre: string;
  nombre: string;
  fundacion: string;
  jugadoresCount: number | null;
}

const EditTeam: React.FC<EditTeamProps> = ({ open, onClose, onSuccess, teamId }) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [subcategoriaError, setSubcategoriaError] = useState('');
  const [series, setSeries] = useState<Record<number, Serie[]>>({});
  const [loadingSeries, setLoadingSeries] = useState<Record<number, boolean>>({});
  
  const [team, setTeam] = useState<TeamData>({
    equipoId: 0,
    subcategoriaId: 0,
    subcategoriaNombre: '',
    serieId: 0,
    serieNombre: '',
    nombre: '',
    fundacion: new Date().toISOString().split('T')[0],
    jugadoresCount: null
  });
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });
  
  const { token } = useAuth();

  // Fetch team data when component mounts or teamId changes
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!token || !open) return;

      try {
        setLoading(true);
        const response = await teamService.getTeamById(teamId);
        const teamData = response.data;

        setTeam({
          equipoId: teamData.equipoId,
          subcategoriaId: teamData.subcategoriaId,
          subcategoriaNombre: teamData.subcategoriaNombre,
          serieId: teamData.serieId,
          serieNombre: teamData.serieNombre,
          nombre: teamData.nombre,
          fundacion: teamData.fundacion.split("T")[0],
          jugadoresCount: teamData.jugadoresCount,
        });

        // Fetch series for the team's subcategory
        await fetchSeriesForSubcategoria(teamData.subcategoriaId);
      } catch (error) {
        console.error("Error fetching team data:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar los datos del equipo",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchTeamData();
    }
  }, [token, teamId, open]);

  // Fetch all subcategorias when component mounts
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!token) return;

      try {
        setLoadingSubcategorias(true);
        const response = await fetch(
          "http://localhost:8080/api/subcategorias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar las subcategorías");
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSubcategorias(data.data);
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

  const handleTeamChange = (field: string, value: string | number) => {
    setTeam((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If subcategory changed, fetch series for the new subcategory
    if (field === "subcategoriaId" && value !== team.subcategoriaId) {
      fetchSeriesForSubcategoria(Number(value));
      // Reset serieId when subcategory changes
      setTeam((prev) => ({
        ...prev,
        serieId: 0,
        serieNombre: "",
      }));
    }
  };

  // Fetch series for a specific subcategoria
  const fetchSeriesForSubcategoria = async (subcategoriaId: number) => {
    if (!token || !subcategoriaId) return;

    // Don't fetch if we already have the series for this subcategoria
    if (series[subcategoriaId]) return;

    setLoadingSeries((prev) => ({ ...prev, [subcategoriaId]: true }));

    try {
      const seriesData = await serieService.getSeriesBySubcategoria(
        token,
        subcategoriaId
      );

      setSeries((prev) => ({
        ...prev,
        [subcategoriaId]: seriesData,
      }));
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

    // Validate all required fields
    if (
      !team.nombre ||
      !team.fundacion ||
      !team.subcategoriaId ||
      !team.serieId
    ) {
      setSnackbar({
        open: true,
        message: "Por favor complete todos los campos obligatorios",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const teamData = {
        nombre: team.nombre,
        fundacion: team.fundacion,
        subcategoriaId: team.subcategoriaId,
        serieId: team.serieId,
      };

      await teamService.updateTeam(teamId, teamData);

      setSnackbar({
        open: true,
        message: "Equipo actualizado exitosamente",
        severity: "success",
      });

      // Notify parent component and close the dialog
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al actualizar el equipo:", error);

      let errorMessage = "Error al actualizar el equipo";
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

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={!loading ? onClose : undefined}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Equipo</Typography>
            <IconButton 
              onClick={onClose} 
              size="small" 
              disabled={loading}
              sx={{
                '&.Mui-disabled': {
                  pointerEvents: 'auto',
                  cursor: 'not-allowed',
                  opacity: 0.5
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
              <TextField
                fullWidth
                label="Nombre del Equipo"
                value={team.nombre}
                onChange={(e) => handleTeamChange('nombre', e.target.value)}
                required
                margin="normal"
                size="small"
                disabled={loading}
                sx={{ mt: 0 }}
              />
              
              <TextField
                fullWidth
                label="Fecha de Fundación"
                type="date"
                value={team.fundacion}
                onChange={(e) => handleTeamChange('fundacion', e.target.value)}
                required
                margin="normal"
                size="small"
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" edge="end" disabled>
                      <CalendarTodayIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{ mt: 0 }}
              />
              
              <FormControl fullWidth margin="normal" size="small" required disabled={loading}>
                <InputLabel id="subcategoria-label">Subcategoría</InputLabel>
                <Select
                  labelId="subcategoria-label"
                  value={team.subcategoriaId || ''}
                  onChange={(e) => handleTeamChange('subcategoriaId', Number(e.target.value))}
                  label="Subcategoría"
                  disabled={loadingSubcategorias || loading}
                >
                  {loadingSubcategorias ? (
                    <MenuItem value="">
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : subcategorias.length > 0 ? (
                    subcategorias.map((sub) => (
                      <MenuItem key={sub.subcategoriaId} value={sub.subcategoriaId}>
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
                  <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                    {subcategoriaError}
                  </Typography>
                )}
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small" required disabled={loading}>
                <InputLabel id="serie-label">Serie</InputLabel>
                <Select
                  labelId="serie-label"
                  value={team.serieId || ''}
                  onChange={(e) => handleTeamChange('serieId', Number(e.target.value))}
                  label="Serie"
                  disabled={loadingSeries[team.subcategoriaId] || !team.subcategoriaId || loading}
                >
                  {loadingSeries[team.subcategoriaId] ? (
                    <MenuItem value="">
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : series[team.subcategoriaId]?.length > 0 ? (
                    series[team.subcategoriaId].map((serie) => (
                      <MenuItem key={serie.serieId} value={serie.serieId}>
                        {serie.nombreSerie}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      {team.subcategoriaId ? 'No hay series disponibles' : 'Seleccione una subcategoría'}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 1 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Actualizando...' : 'Actualizar Equipo'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditTeam;
