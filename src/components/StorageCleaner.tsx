import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente que detecta tokens antiguos y ofrece limpiarlos
 * Solo se muestra en desarrollo
 */
const StorageCleaner = () => {
  const { logout } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Verificar si hay un token
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decodificar el JWT para verificar expiración
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convertir a milisegundos
        const now = Date.now();
        
        // Si el token está expirado, mostrar diálogo
        if (expirationTime < now) {
          console.log('⚠️ Token expirado detectado');
          setShowDialog(true);
        }
      } catch (error) {
        // Si hay error al decodificar, probablemente es un token inválido
        console.log('⚠️ Token inválido detectado');
        setShowDialog(true);
      }
    }
  }, []);

  const handleClearStorage = () => {
    logout();
    setShowDialog(false);
    window.location.reload();
  };

  const handleKeepToken = () => {
    setShowDialog(false);
  };

  if (!showDialog) return null;

  return (
    <Dialog open={showDialog} maxWidth="sm" fullWidth>
      <DialogTitle>🧹 Token Expirado o Inválido</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Se detectó un token de autenticación expirado o inválido en tu navegador.
        </Alert>
        <Typography variant="body2" paragraph>
          Esto puede ocurrir si:
        </Typography>
        <ul style={{ marginTop: 0 }}>
          <li>El token ha expirado</li>
          <li>Quedó un token de pruebas anteriores</li>
          <li>Hubo un error en la autenticación</li>
        </ul>
        <Typography variant="body2" paragraph>
          ¿Deseas limpiar el storage y volver al login?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleKeepToken} color="inherit">
          Mantener Token
        </Button>
        <Button onClick={handleClearStorage} variant="contained" color="primary">
          Limpiar y Recargar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageCleaner;
