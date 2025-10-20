import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  IconButton, 
  Alert, 
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  CircularProgress,
  Divider
} from '@mui/material';
import axios from 'axios';
import serieService from '../../api/serieService';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  CalendarToday as CalendarTodayIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
  EmojiEvents as EmojiEventsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import playerService from '../../api/playerService';
import teamService from '../../api/teamService';
import subcategoriaRolesService from '../../api/subcategoriaRolesService';
import subcategoriaService from '../../api/subcategoriaService';

interface Subcategoria {
  subcategoriaId: number;
  nombre: string;
}

interface Serie {
  serieId: number;
  subcategoriaId: number;
  subcategoriaNombre: string;
  nombreSerie: string;
}

interface Rol {
  id: number;
  name: string;
  detail: string;
}

interface PlayerFormData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
  equipoId?: number;
  numeroCamiseta?: string;
  rolId?: number;
  rolName?: string;
}

interface RegisterPlayerFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

const RegisterPlayerForm: React.FC<RegisterPlayerFormProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  token 
}) => {
  const [players, setPlayers] = useState<PlayerFormData[]>([
    { 
      nombre: '', 
      apellido: '', 
      fechaNacimiento: '', 
      documentoIdentidad: '',
      equipoId: undefined,
      numeroCamiseta: '',
      rolId: undefined
    }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<number>();
  const [series, setSeries] = useState<Serie[]>([]);
  const [selectedSerie, setSelectedSerie] = useState<number>();
  const [teams, setTeams] = useState<Array<{equipoId: number, nombre: string}>>([]);
  const [allRoles, setAllRoles] = useState<Rol[]>([]); // Store all available roles
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]); // Track selected role IDs
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Fetch subcategorias on component mount
  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const response = await subcategoriaService.getAllSubcategorias(token);
        if (response && response.data) {
          setSubcategorias(response.data);
        }
      } catch (error) {
        console.error('Error fetching subcategorias:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar las subcategorías',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchSubcategorias();
    }
  }, [open, token]);

  // Fetch roles when subcategoria is selected
  useEffect(() => {
    const fetchRoles = async () => {
      if (selectedSubcategoria) {
        try {
          const rolesData = await subcategoriaRolesService.getSubcategoriaRoles(selectedSubcategoria, token);
          setAllRoles(rolesData);
          // Reset selected roles when subcategoria changes
          setSelectedRoleIds(players.map(p => p.rolId).filter(Boolean) as number[]);
        } catch (error) {
          console.error('Error fetching roles:', error);
          setSnackbar({
            open: true,
            message: 'Error al cargar los roles',
            severity: 'error'
          });
        }
      } else {
        setAllRoles([]);
      }
    };

    fetchRoles();
  }, [selectedSubcategoria, token]);


  // Fetch series when subcategoria is selected
  useEffect(() => {
    const fetchSeries = async () => {
      if (selectedSubcategoria) {
        try {
          const seriesData = await serieService.getSeriesBySubcategoria(token, selectedSubcategoria);
          setSeries(seriesData);
        } catch (error) {
          console.error('Error fetching series:', error);
          setSnackbar({
            open: true,
            message: 'Error al cargar las series',
            severity: 'error'
          });
        }
      }
    };

    if (selectedSubcategoria) {
      fetchSeries();
    }
  }, [selectedSubcategoria, token]);

  // Fetch teams when both subcategoria and serie are selected
  useEffect(() => {
    const fetchTeams = async () => {
      if (selectedSubcategoria && selectedSerie) {
        try {
          const response = await teamService.getTeamsBySubcategoria(token, selectedSubcategoria, selectedSerie);
          if (response && response.data) {
            setTeams(response.data);
          }
        } catch (error) {
          console.error('Error fetching teams:', error);
          setSnackbar({
            open: true,
            message: 'Error al cargar los equipos',
            severity: 'error'
          });
        }
      }
    };

    if (selectedSubcategoria && selectedSerie) {
      fetchTeams();
    }
  }, [selectedSubcategoria, selectedSerie, token]);

  const handleSubcategoriaChange = async (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setSelectedSubcategoria(value);
    setSelectedSerie(undefined);
    setTeams([]);
    setPlayers([{ 
      nombre: '', 
      apellido: '', 
      fechaNacimiento: '', 
      documentoIdentidad: '',
      equipoId: undefined,
      numeroCamiseta: '',
      rolId: undefined,
      rolName: ''
    }]);
    
    // Load roles for the selected subcategory
    if (value) {
      try {
        const rolesData = await subcategoriaRolesService.getSubcategoriaRoles(value, token);
        setAllRoles(rolesData);
        setSelectedRoleIds([]); // Reset selected roles when subcategoria changes
      } catch (error) {
        console.error('Error fetching roles:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los roles',
          severity: 'error'
        });
      }
    }
  };

  const handleSerieChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setSelectedSerie(value);
  };

  const handleAddPlayer = () => {
    setPlayers([...players, { 
      nombre: '', 
      apellido: '', 
      fechaNacimiento: '', 
      documentoIdentidad: '',
      equipoId: undefined,
      numeroCamiseta: '',
      rolId: undefined,
      rolName: ''
    }]);
  };

  const handleRemovePlayer = (index: number) => {
    const removedPlayer = players[index];
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    
    // Remove the role from selected roles if it exists
    if (removedPlayer.rolId) {
      setSelectedRoleIds(prev => prev.filter(id => id !== removedPlayer.rolId));
    }
    
    setPlayers(newPlayers);
  };

  const handlePlayerChange = (index: number, field: keyof PlayerFormData, value: any) => {
    // If the field is documentoIdentidad or numeroCamiseta, only allow numbers
    if ((field === 'documentoIdentidad' || field === 'numeroCamiseta') && value !== '' && !/^\d*$/.test(value)) {
      return; // Don't update if the value contains non-numeric characters
    }
    
    const newPlayers = [...players];
    
    // Convert string numbers to actual numbers for numeroCamiseta
    if ((field === 'numeroCamiseta' || field === 'equipoId' || field === 'rolId') && value !== '') {
      newPlayers[index] = { 
        ...newPlayers[index], 
        [field]: field === 'numeroCamiseta' ? value : Number(value)
      };
    } else {
      newPlayers[index] = { ...newPlayers[index], [field]: value };
    }
    
    setPlayers(newPlayers);
  };

  const handleRoleChange = (index: number, event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    const selectedRole = allRoles.find(role => role.id === value);
    
    // Update selected roles
    const newSelectedRoleIds = [...selectedRoleIds];
    const previousRoleId = players[index].rolId;
    
    // Remove previous role from selected if it exists
    if (previousRoleId) {
      const prevIndex = newSelectedRoleIds.indexOf(previousRoleId);
      if (prevIndex > -1) {
        newSelectedRoleIds.splice(prevIndex, 1);
      }
    }
    
    // Add new role to selected if it's not the empty value
    if (value) {
      newSelectedRoleIds.push(value);
    }
    
    setSelectedRoleIds(newSelectedRoleIds);
    
    // Update players
    const newPlayers = [...players];
    newPlayers[index] = {
      ...newPlayers[index],
      rolId: value || undefined,
      rolName: selectedRole?.detail || ''
    };
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate subcategoria and serie are selected
    if (!selectedSubcategoria || !selectedSerie) {
      setSnackbar({
        open: true,
        message: 'Por favor seleccione una subcategoría y una serie',
        severity: 'error'
      });
      return;
    }

    // Validate team and role for each player
    const validPlayers = players.filter(
      player => 
        player.nombre.trim() !== '' && 
        player.apellido.trim() !== '' && 
        player.fechaNacimiento !== '' && 
        player.documentoIdentidad.trim() !== '' &&
        player.equipoId &&
        player.rolId &&
        player.numeroCamiseta
    );

    if (validPlayers.length === 0) {
      setSnackbar({
        open: true,
        message: 'Por favor complete todos los campos obligatorios para al menos un jugador',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First, register the players
      const playerResponse = await playerService.registerPlayers(
        validPlayers.map(({ equipoId, numeroCamiseta, rolId, ...player }) => player), 
        token
      );

      if (playerResponse && (playerResponse.success || Array.isArray(playerResponse))) {
        // If player registration is successful, assign them to teams with roles
        const playerAssignments = validPlayers.map(player => ({
          equipoId: player.equipoId,
          jugadorId: playerResponse.find((p: any) => p.documentoIdentidad === player.documentoIdentidad)?.id,
          numeroCamiseta: player.numeroCamiseta,
          rolId: player.rolId
        }));

        // Assign players to teams with roles
        await axios.post(
          'http://localhost:8080/api/equipo-jugadores/asignar',
          playerAssignments,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setSnackbar({
          open: true,
          message: 'Jugadores registrados y asignados exitosamente',
          severity: 'success'
        });
        
        // Reset form
        setPlayers([{ 
          nombre: '', 
          apellido: '', 
          fechaNacimiento: '', 
          documentoIdentidad: '',
          equipoId: undefined,
          numeroCamiseta: '',
          rolId: undefined,
          rolName: ''
        }]);
        setSelectedSubcategoria(undefined);
        setSelectedSerie(undefined);
        setTeams([]);
        setAllRoles([]);
        
        onSuccess();
        setTimeout(() => onClose(), 1000);
      } else {
        setSnackbar({
          open: true,
          message: playerResponse?.message || 'Error al registrar jugadores',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error registering players:', error);
      setSnackbar({
        open: true,
        message: 'Error al conectar con el servidor',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>Cargando datos...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

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
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Inscripción de Jugadores</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {/* Team Information */}
            <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, position: 'relative' }}>
              <Box 
                display="flex" 
                alignItems="center" 
                color="primary.main"
                mb={2}
              >
                <EmojiEventsIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="medium">
                  Información del Equipo
                </Typography>
              </Box>
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="subcategoria-label">Subcategoría</InputLabel>
                  <Select
                    labelId="subcategoria-label"
                    value={selectedSubcategoria || ''}
                    onChange={handleSubcategoriaChange}
                    label="Subcategoría"
                    disabled={isSubmitting}
                    variant="outlined"
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 1.5
                      }
                    }}
                  >
                    {subcategorias.map((subcategoria) => (
                      <MenuItem 
                        key={subcategoria.subcategoriaId} 
                        value={subcategoria.subcategoriaId}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <FilterListIcon fontSize="small" />
                        {subcategoria.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small" required>
                  <InputLabel id="serie-label">Serie</InputLabel>
                  <Select
                    labelId="serie-label"
                    value={selectedSerie || ''}
                    onChange={handleSerieChange}
                    label="Serie"
                    disabled={!selectedSubcategoria || isSubmitting}
                    variant="outlined"
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 1.5
                      }
                    }}
                  >
                    {series.length > 0 ? (
                      series.map((serie) => (
                        <MenuItem 
                          key={serie.serieId} 
                          value={serie.serieId}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <FilterListIcon fontSize="small" />
                          {serie.nombreSerie}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                          {selectedSubcategoria ? 'No hay series disponibles' : 'Seleccione una subcategoría'}
                        </Typography>
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
                onClick={handleAddPlayer}
                disabled={isSubmitting || !selectedSubcategoria || !selectedSerie}
                size="small"
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 1
                  }
                }}
              >
                Agregar Jugador
              </Button>
            </Box>

            {players.map((player, index) => (
              <Box 
                key={index}
                sx={{
                  position: 'relative',
                  mb: 3,
                  '&:hover .delete-button': {
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'translate(4px, -4px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Paper 
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  {players.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() => handleRemovePlayer(index)}
                      sx={{
                        position: 'absolute',
                        right: -12,
                        top: -12,
                        color: 'white',
                        backgroundColor: 'error.main',
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'all 0.2s ease',
                        zIndex: 1,
                        '&:hover': {
                          backgroundColor: 'error.dark',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                    <TextField
                      label="Nombre"
                      value={player.nombre}
                      onChange={(e) => handlePlayerChange(index, 'nombre', e.target.value)}
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Apellido"
                      value={player.apellido}
                      onChange={(e) => handlePlayerChange(index, 'apellido', e.target.value)}
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                        },
                      }}
                    />
                  </Box>
                  
                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                    <TextField
                      label="Documento de Identidad"
                      value={player.documentoIdentidad}
                      onChange={(e) => handlePlayerChange(index, 'documentoIdentidad', e.target.value)}
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      inputProps={{ 
                        inputMode: 'numeric', 
                        pattern: '[0-9]*',
                        title: 'Solo se permiten números'
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                        },
                      }}
                    />
                    <TextField
                      label="Fecha de Nacimiento"
                      type="date"
                      value={player.fechaNacimiento}
                      onChange={(e) => handlePlayerChange(index, 'fechaNacimiento', e.target.value)}
                      fullWidth
                      required
                      size="small"
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        endAdornment: <CalendarTodayIcon fontSize="small" color="action" />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.light',
                          },
                        },
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Información Deportiva
                    </Typography>
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={2}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel id={`equipo-label-${index}`}>Equipo</InputLabel>
                        <Select
                          labelId={`equipo-label-${index}`}
                          value={player.equipoId || ''}
                          onChange={(e) => {
                            const value = e.target.value as string | number;
                            handlePlayerChange(index, 'equipoId', value === '' ? undefined : Number(value));
                          }}
                          label="Equipo"
                          disabled={!selectedSubcategoria || !selectedSerie || isSubmitting}
                          variant="outlined"
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }
                          }}
                        >
                          {teams.length > 0 ? (
                            teams.map((team) => (
                              <MenuItem 
                                key={team.equipoId} 
                                value={team.equipoId}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                              >
                                <GroupIcon fontSize="small" />
                                {team.nombre}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>
                              <Typography variant="body2" color="text.secondary">
                                {selectedSubcategoria && selectedSerie ? 'No hay equipos disponibles' : 'Seleccione subcategoría y serie'}
                              </Typography>
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                      
                      <TextField
                        label="Número de Camiseta"
                        value={player.numeroCamiseta || ''}
                        onChange={(e) => handlePlayerChange(index, 'numeroCamiseta', e.target.value)}
                        fullWidth
                        required
                        size="small"
                        disabled={isSubmitting}
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{ 
                          inputMode: 'numeric', 
                          pattern: '[0-9]*',
                          min: 1,
                          max: 99,
                          title: 'Ingrese un número entre 1 y 99'
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: 'primary.light',
                            },
                          },
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id={`rol-label-${index}`}>Rol</InputLabel>
                        <Select
                          labelId={`rol-label-${index}`}
                          id={`rol-${index}`}
                          value={player.rolId || ''}
                          onChange={(e) => handleRoleChange(index, e)}
                          label="Rol"
                          disabled={!selectedSubcategoria || isSubmitting}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1.5,
                              whiteSpace: 'normal'
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>Seleccione un rol</em>
                          </MenuItem>
                          {allRoles.length > 0 ? (
                            allRoles
                              .filter(role => !selectedRoleIds.includes(role.id) || players[index]?.rolId === role.id)
                              .map((role) => (
                                <MenuItem 
                                  key={role.id} 
                                  value={role.id}
                                >
                                  <Typography variant="body1">
                                    {role.detail}
                                  </Typography>
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>
                              <em>No hay roles disponibles para esta subcategoría</em>
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
            
            <DialogActions sx={{ px: 3, py: 2, mt: 2 }}>
              <Button 
                onClick={onClose} 
                disabled={isSubmitting}
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                type="submit"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <PersonIcon />}
                sx={{
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 1
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Jugadores'}
              </Button>
            </DialogActions>
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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegisterPlayerForm;
