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
  Divider
} from '@mui/material';
import { Close as CloseIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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

// Serie interface is now imported from serieService

interface RegisterTeamProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterTeam: React.FC<RegisterTeamProps> = ({ open, onClose, onSuccess }) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loadingSubcategorias, setLoadingSubcategorias] = useState(false);
  const [subcategoriaError, setSubcategoriaError] = useState('');
  const [series, setSeries] = useState<Record<number, Serie[]>>({});
  const [loadingSeries, setLoadingSeries] = useState<Record<number, boolean>>({});
  
  const [teams, setTeams] = useState([
    { subcategoriaId: 0, serieId: 3, nombre: '', fundacion: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const { token } = useAuth();

  const handleAddTeam = () => {
    setTeams([...teams, { subcategoriaId: 5, serieId: 3, nombre: '', fundacion: '' }]);
  };

  const handleRemoveTeam = (index: number) => {
    const newTeams = [...teams];
    newTeams.splice(index, 1);
    setTeams(newTeams);
  };

  const handleTeamChange = (index: number, field: string, value: string | number) => {
    const newTeams = [...teams];
    const previousValue = newTeams[index][field as keyof typeof newTeams[0]];
    newTeams[index] = { ...newTeams[index], [field]: value };
    
    // If subcategory changed, fetch series for the new subcategory
    if (field === 'subcategoriaId' && previousValue !== value) {
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
        message: 'No se encontró el token de autenticación',
        severity: 'error'
      });
      return;
    }

    // Validate all fields are filled
    const hasEmptyFields = teams.some(team => 
      !team.nombre || !team.fundacion
    );

    if (hasEmptyFields) {
      setSnackbar({
        open: true,
        message: 'Por favor complete todos los campos obligatorios',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await teamService.createTeamsBulk(token, teams);
      
      setSnackbar({
        open: true,
        message: 'Equipos registrados exitosamente',
        severity: 'success'
      });
      
      // Call onSuccess to notify parent component
      onSuccess();
      
      // Reset form and close the modal after a short delay
      setTimeout(() => {
        setTeams([{ subcategoriaId: 5, serieId: 3, nombre: '', fundacion: '' }]);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error al registrar equipos:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrar los equipos';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
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
    
    setLoadingSeries(prev => ({ ...prev, [subcategoriaId]: true }));
    
    try {
      const seriesData = await serieService.getSeriesBySubcategoria(token, subcategoriaId);
      
      setSeries(prev => ({
        ...prev,
        [subcategoriaId]: seriesData
      }));
      
      // If this is the first series for this subcategoria, set it as default
      if (seriesData.length > 0) {
        const newTeams = [...teams];
        const teamIndex = newTeams.findIndex(t => t.subcategoriaId === subcategoriaId);
        if (teamIndex !== -1 && !newTeams[teamIndex].serieId) {
          newTeams[teamIndex].serieId = seriesData[0].serieId;
          setTeams(newTeams);
        }
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las series. Por favor, intente nuevamente.',
        severity: 'error'
      });
    } finally {
      setLoadingSeries(prev => ({ ...prev, [subcategoriaId]: false }));
    }
  };
  
  // Fetch subcategorias when the component mounts
  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!token) return;
      
      setLoadingSubcategorias(true);
      setSubcategoriaError('');
      
      try {
        const response = await fetch('http://localhost:8080/api/subcategorias', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar las subcategorías');
        }
        
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSubcategorias(data.data);
          
          // Set the first subcategory as default if no subcategory is selected
          if (data.data.length > 0 && teams[0].subcategoriaId === 0) {
            const newTeams = [...teams];
            newTeams[0].subcategoriaId = data.data[0].subcategoriaId;
            setTeams(newTeams);
            // Fetch series for the first subcategory
            fetchSeriesForSubcategoria(data.data[0].subcategoriaId);
          }
        }
      } catch (error) {
        console.error('Error fetching subcategorias:', error);
        setSubcategoriaError('No se pudieron cargar las subcategorías');
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
        onClose={() => {
          onClose();
          // Reset form when dialog is closed
          setTeams([{ subcategoriaId: subcategorias[0]?.subcategoriaId || 0, serieId: 3, nombre: '', fundacion: '' }]);
        }}
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
            <Typography variant="h6">Inscribir Equipos</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
        
        <form onSubmit={handleSubmit}>
          {teams.map((team, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, position: 'relative' }}>
              {teams.length > 1 && (
                <IconButton
                  className="delete-button"
                  size="small"
                  onClick={() => handleRemoveTeam(index)}
                  sx={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: 0,
                    color: 'error.main',
                    backgroundColor: 'background.paper',
                    border: `1px solid #ddd`,
                    borderBottomLeftRadius: 4,
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                      opacity: 1
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                <TextField
                  fullWidth
                  label="Nombre del Equipo"
                  value={team.nombre}
                  onChange={(e) => handleTeamChange(index, 'nombre', e.target.value)}
                  required
                  margin="normal"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Fecha de Fundación"
                  type="date"
                  value={team.fundacion}
                  onChange={(e) => handleTeamChange(index, 'fundacion', e.target.value)}
                  required
                  margin="normal"
                  size="small"
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
                />
                <FormControl fullWidth margin="normal" size="small" required>
                  <InputLabel id={`subcategoria-label-${index}`}>Subcategoría</InputLabel>
                  <Select
                    labelId={`subcategoria-label-${index}`}
                    value={team.subcategoriaId || ''}
                    onChange={(e) => handleTeamChange(index, 'subcategoriaId', Number(e.target.value))}
                    label="Subcategoría"
                    disabled={loadingSubcategorias}
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
                    <Typography color="error" variant="caption">
                      {subcategoriaError}
                    </Typography>
                  )}
                </FormControl>
                <FormControl fullWidth margin="normal" size="small" required>
                  <InputLabel id={`serie-label-${index}`}>Serie</InputLabel>
                  <Select
                    labelId={`serie-label-${index}`}
                    value={team.serieId || ''}
                    onChange={(e) => handleTeamChange(index, 'serieId', Number(e.target.value))}
                    label="Serie"
                    disabled={loadingSeries[team.subcategoriaId] || !team.subcategoriaId}
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
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={handleAddTeam}
              disabled={loading}
            >
              Agregar Otro Equipo
            </Button>
          </Box>
        </form>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Registrando...' : 'Registrar Equipos'}
        </Button>
      </DialogActions>
    </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegisterTeam;
