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
} from '@mui/material';
import { Close as CloseIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Player, PlayerData } from '../../api/playerService';
import playerService from '../../api/playerService';

interface EditPlayerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  playerId: number;
}

const EditPlayer: React.FC<EditPlayerProps> = ({ open, onClose, onSuccess, playerId }) => {
  const [player, setPlayer] = useState<Player>({
    id: 0,
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    documentoIdentidad: '',
    estado: 'ACTIVO',
    nombreEquipo: '',
    nombreRol: '',
    rolDetail: '',
    rolId: undefined,
    subcategoriaId: undefined,
    numeroCamiseta: undefined
  });
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });
  
  const { token } = useAuth();

  // Fetch player data when component mounts or playerId changes
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!token || !open) return;
      
      try {
        setLoading(true);
        const playerData = await playerService.getPlayerById(token, playerId);
        setPlayer(playerData);
      } catch (error) {
        console.error('Error fetching player data:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos del jugador',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchPlayerData();
    }
  }, [token, playerId, open]);

  const handlePlayerChange = <K extends keyof Player>(
    field: K,
    value: Player[K] | string | number | undefined
  ) => {
    // If the field is documentoIdentidad, only allow numbers
    if (field === 'documentoIdentidad' && typeof value === 'string' && value !== '' && !/^\d*$/.test(value)) {
      return; // Don't update if the value contains non-numeric characters
    }
    
    setPlayer(prev => ({
      ...prev,
      [field]: value
    } as Player));
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

    // Validate all required fields
    if (!player.nombre || !player.apellido || !player.fechaNacimiento || !player.documentoIdentidad) {
      setSnackbar({
        open: true,
        message: 'Por favor complete todos los campos obligatorios',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      const playerData: PlayerData = {
        nombre: player.nombre,
        apellido: player.apellido,
        fechaNacimiento: player.fechaNacimiento,
        documentoIdentidad: player.documentoIdentidad,
        equipoId: player.nombreEquipo ? parseInt(player.nombreEquipo) : undefined,
        numeroCamiseta: player.numeroCamiseta,
        rolId: player.rolId,
        jugadorId: player.id
      };
      
      await playerService.updatePlayer(token, playerId, playerData);
      
      setSnackbar({
        open: true,
        message: 'Jugador actualizado exitosamente',
        severity: 'success'
      });
      
      // Notify parent component and close the dialog
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Error al actualizar el jugador:', error);
      
      let errorMessage = 'Error al actualizar el jugador';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={!loading ? onClose : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Editar Jugador</Typography>
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
            <Box display="grid" gap={2} mb={2}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={player.nombre}
                  onChange={(e) => handlePlayerChange('nombre', e.target.value)}
                  required
                  margin="normal"
                  size="small"
                  disabled={loading}
                  sx={{ mt: 0 }}
                />
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={player.apellido}
                  onChange={(e) => handlePlayerChange('apellido', e.target.value)}
                  required
                  margin="normal"
                  size="small"
                  disabled={loading}
                  sx={{ mt: 0 }}
                />
              </Box>
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  fullWidth
                  label="Documento de Identidad"
                  value={player.documentoIdentidad}
                  onChange={(e) => handlePlayerChange('documentoIdentidad', e.target.value)}
                  required
                  margin="normal"
                  size="small"
                  disabled={loading}
                  inputProps={{ 
                    inputMode: 'numeric', 
                    pattern: '[0-9]*',
                    title: 'Solo se permiten números'
                  }}
                  sx={{ mt: 0 }}
                />
                <TextField
                  fullWidth
                  label="Número de Camiseta"
                  type="number"
                  value={player.numeroCamiseta || ''}
                  onChange={(e) => handlePlayerChange('numeroCamiseta', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  margin="normal"
                  size="small"
                  inputProps={{ min: 1, max: 99 }}
                  disabled={loading}
                  sx={{ mt: 0 }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                value={player.fechaNacimiento}
                onChange={(e) => handlePlayerChange('fechaNacimiento', e.target.value)}
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

              <TextField
                fullWidth
                label="Equipo"
                value={player.nombreEquipo || 'No asignado'}
                margin="normal"
                size="small"
                disabled={true}
                sx={{
                  mt: 0,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                      borderWidth: '1px'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                    cursor: 'not-allowed'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Detalle del Rol"
                value={player.rolDetail}
                margin="normal"
                size="small"
                disabled={true}
                sx={{
                  mt: 0,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                      borderWidth: '1px'
                    }
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                    cursor: 'not-allowed'
                  }
                }}
              />
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
                {loading ? 'Actualizando...' : 'Actualizar Jugador'}
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

export default EditPlayer;
