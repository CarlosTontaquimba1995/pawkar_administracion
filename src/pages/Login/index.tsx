import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  SportsSoccer as SportsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../api/authService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error al escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('🔐 Intentando iniciar sesión...');
      const response = await authService.login(formData);

      if (response.success && response.data) {
        console.log('✅ Login exitoso');
        
        // Guardar token y datos de usuario en el contexto
        login(response.data.accessToken, {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          roles: response.data.roles,
        });

        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        console.log('❌ Login fallido:', response.message);
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      {/* Panel izquierdo - Branding */}
      <Box
        sx={{
          width: { xs: '100%', md: '50vw' },
          height: { xs: '30vh', md: '100vh' },
          background: theme.custom.colors.gradients.primary,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { xs: 4, md: 6 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${theme.custom.colorWithOpacity.secondary[30]} 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, ${theme.custom.colorWithOpacity.accent2[20]} 0%, transparent 50%)`,
          },
        }}
      >
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', zIndex: 1 }}>
            <SportsIcon sx={{ fontSize: { xs: 60, md: 120 }, color: 'white', mb: { xs: 1, md: 3 }, opacity: 0.9 }} />
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: { xs: 1, md: 2 },
                fontSize: { xs: '1.75rem', md: '3rem' },
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Pawkar Admin
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                opacity: 0.95,
                fontWeight: 300,
                maxWidth: 400,
                mx: 'auto',
                fontSize: { xs: '0.875rem', md: '1.25rem' },
              }}
            >
              Sistema de Gestión Deportiva Profesional
            </Typography>
          </Box>
        </Fade>
      </Box>

      {/* Panel derecho - Formulario */}
      <Box
        sx={{
          width: { xs: '100%', md: '50vw' },
          height: { xs: '70vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.custom.colors.background.paper,
          overflow: 'auto',
        }}
      >
        <Slide direction="left" in timeout={800}>
          <Box
            sx={{
              width: '100%',
              maxWidth: '500px',
              padding: { xs: 3, sm: 4, md: 5 },
            }}
          >
            {/* Logo móvil */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
              <SportsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>

            {/* Título */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                Bienvenido
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: { xs: 'center', md: 'left' } }}
              >
                Ingresa tus credenciales para continuar
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: theme.custom.colorWithOpacity.accent1[10],
                    border: `1px solid ${theme.custom.colorWithOpacity.accent1[30]}`,
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                autoFocus
                disabled={isLoading}
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                disabled={isLoading}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: 'primary.main' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: theme.custom.colors.gradients.primary,
                  boxShadow: theme.custom.colors.shadows.primary,
                  '&:hover': {
                    background: theme.custom.colors.gradients.primary,
                    boxShadow: theme.custom.colors.shadows.medium,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Credenciales de prueba */}
            <Box
              sx={{
                mt: 4,
                p: 2.5,
                borderRadius: 2,
                backgroundColor: theme.custom.colorWithOpacity.accent2[10],
                border: `1px dashed ${theme.custom.colorWithOpacity.accent2[30]}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                🔑 Credenciales de prueba:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Usuario:</strong> testuser
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Contraseña:</strong> password123
              </Typography>
            </Box>
          </Box>
        </Slide>
      </Box>
    </Box>
  );
};

export default Login;
