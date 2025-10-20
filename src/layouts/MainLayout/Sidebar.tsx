import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  styled,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Groups as TeamsIcon,
  People as PlayersIcon,
  Event as EventsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import teamService from '../../api/teamService';
import { useAuth } from '../../contexts/AuthContext';
import { SnackbarState } from '../../types/snackbar';

const drawerWidth = 260;

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: 'none',
    boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.06)',
  },
});

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Equipos', icon: <TeamsIcon />, path: '/teams' },
  { text: 'Jugadores', icon: <PlayersIcon />, path: '/players' },
  { text: 'Eventos', icon: <EventsIcon />, path: '/events' },
];

const bottomMenuItems = [
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Cerrar Sesión', icon: <LogoutIcon />, path: '/logout' },
];

const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();
  const [teamsExist, setTeamsExist] = useState<boolean | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    const checkTeams = async () => {
      if (!token) return;
      
      try {
        const exists = await teamService.checkTeamsExist(token);
        setTeamsExist(exists);
      } catch (error) {
        console.error('Error checking teams:', error);
        setTeamsExist(false);
      }
    };

    if (token) {
      checkTeams();
    }
  }, [token]);

  const handleNavigate = async (path: string) => {
    console.log('🚀 Navegando a:', path);
    
    // Manejar logout
    if (path === '/logout') {
      console.log('👋 Cerrando sesión...');
      logout();
      navigate('/login');
      return;
    }
    
    if (path === '/players') {
      console.log('📋 Validando acceso a jugadores...');
      console.log('Token disponible:', !!token);
      
      if (!token) {
        console.log('❌ No hay token - bloqueando acceso');
        setSnackbar({
          open: true,
          message: 'Debe iniciar sesión para acceder a esta sección',
          severity: 'error',
        });
        return;
      }
      
      try {
        const exists = await teamService.checkTeamsExist(token);
        console.log('🔍 Resultado de verificación de equipos:', exists);
        
        if (!exists) {
          console.log('⚠️ No hay equipos - redirigiendo a /teams');
          setSnackbar({
            open: true,
            message: 'Debe registrar al menos un equipo antes de acceder a Jugadores',
            severity: 'warning',
          });
          navigate('/teams');
          return;
        }
        
        console.log('✅ Hay equipos - permitiendo acceso');
      } catch (error) {
        console.error('❌ Error checking teams:', error);
        setSnackbar({
          open: true,
          message: 'Error al verificar los equipos',
          severity: 'error',
        });
        return;
      }
    }
    
    console.log('✅ Navegando a:', path);
    navigate(path);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const drawer = (
    <div>
      <LogoContainer>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Pawkar Admin
        </Typography>
      </LogoContainer>
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box display="flex" alignItems="center">
                    {item.text}
                    {item.text === 'Jugadores' && teamsExist === false && (
                      <Tooltip title="Se requiere al menos un equipo registrado">
                        <ErrorIcon color="warning" fontSize="small" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </Box>
                }
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 'medium',
                  component: 'div',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ my: 2 }} />
        <List>
          {bottomMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
        open
      >
        {drawer}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
