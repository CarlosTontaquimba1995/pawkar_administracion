import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  IconButton, 
  Alert, 
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';
import { registerPlayers, BulkCreateResponse } from '../../api/playerService';

interface PlayerFormData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
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
  const theme = useTheme();
  const [players, setPlayers] = useState<PlayerFormData[]>([
    { nombre: '', apellido: '', fechaNacimiento: '', documentoIdentidad: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const handleAddPlayer = () => {
    setPlayers([...players, { nombre: '', apellido: '', fechaNacimiento: '', documentoIdentidad: '' }]);
  };

  const handleRemovePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const handlePlayerChange = (index: number, field: keyof PlayerFormData, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Filter out empty players
      const validPlayers = players.filter(
        player => 
          player.nombre.trim() !== '' && 
          player.apellido.trim() !== '' && 
          player.fechaNacimiento !== '' && 
          player.documentoIdentidad.trim() !== ''
      );

      if (validPlayers.length === 0) {
        setSnackbar({
          open: true,
          message: 'Por favor ingrese al menos un jugador válido',
          severity: 'error'
        });
        return;
      }

      const response = await registerPlayers(validPlayers, token);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || 'Jugadores registrados exitosamente',
          severity: 'success'
        });
        setPlayers([{ nombre: '', apellido: '', fechaNacimiento: '', documentoIdentidad: '' }]);
        onSuccess();
        setTimeout(() => onClose(), 1000);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Error al registrar jugadores',
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

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Inscribir Jugadores</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {players.map((player, index) => (
              <Box 
                key={index} 
                sx={{ 
                  position: 'relative',
                  mb: 2,
                  '&:hover .delete-button': {
                    opacity: 1,
                    visibility: 'visible'
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
                      right: 0, 
                      top: 0,
                      color: 'error.main',
                      backgroundColor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      borderBottomLeftRadius: 4,
                      opacity: 0.7,
                      visibility: 'hidden',
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
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    position: 'relative',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                    }
                  }}
                >
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                  <TextField
                    label="Nombre"
                    value={player.nombre}
                    onChange={(e) => handlePlayerChange(index, 'nombre', e.target.value)}
                    fullWidth
                    required
                    size="small"
                  />
                  <TextField
                    label="Apellido"
                    value={player.apellido}
                    onChange={(e) => handlePlayerChange(index, 'apellido', e.target.value)}
                    fullWidth
                    required
                    size="small"
                  />
                </Box>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <TextField
                    label="Documento de Identidad"
                    value={player.documentoIdentidad}
                    onChange={(e) => handlePlayerChange(index, 'documentoIdentidad', e.target.value)}
                    fullWidth
                    required
                    size="small"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                  <TextField
                    label="Fecha de Nacimiento"
                    type="date"
                    value={player.fechaNacimiento}
                    onChange={(e) => handlePlayerChange(index, 'fechaNacimiento', e.target.value)}
                    fullWidth
                    required
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
                </Box>
                </Paper>
              </Box>
            ))}
            <Box display="flex" justifyContent="flex-end" mt={1} mb={2}>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddPlayer}
                variant="outlined"
                size="small"
              >
                Agregar otro jugador
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Jugadores'}
            </Button>
          </DialogActions>
        </form>
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
