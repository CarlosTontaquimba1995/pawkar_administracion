import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import verificationService from "../../api/verificationApiService";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Groups as TeamsIcon,
  People as PlayersIcon,
  Event as EventsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import teamService from "../../api/teamService";

const drawerWidth = 260;

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    boxSizing: "border-box",
    borderRight: "none",
    boxShadow: "2px 0 8px 0 rgba(0, 0, 0, 0.06)",
  },
});

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Categorías", icon: <CategoryIcon />, path: "/categories" },
  { text: "Equipos", icon: <TeamsIcon />, path: "/teams" },
  { text: "Jugadores", icon: <PlayersIcon />, path: "/players" },
  { text: "Eventos", icon: <EventsIcon />, path: "/events" },
];

const bottomMenuItems = [
  { text: "Configuración", icon: <SettingsIcon />, path: "/settings" },
  { text: "Cerrar Sesión", icon: <LogoutIcon />, path: "/logout" },
];

const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();
  const [hasRequiredData, setHasRequiredData] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRequiredData = async () => {
      if (!token) return;

      try {
        const hasData = await verificationService.checkRequiredRegistrations();
        setHasRequiredData(hasData);
      } catch (error) {
        console.error("Error verificando datos requeridos:", error);
        setHasRequiredData(false);
      }
    };

    checkRequiredData();
  }, [token]);

  const handleNavigation = async (path: string) => {
    if (path === "/logout") {
      logout();
      navigate("/login");
      return;
    }

    // Check if trying to access Teams or Players module
    if (path === "/teams" || path === "/players") {
      try {
        const hasData = await verificationService.checkRequiredRegistrations();
        if (!hasData) {
          toast.error(
            "Primero debe registrar Subcategorías y Series para poder proceder"
          );
          return;
        }

        // For players, also check if there are teams
        if (path === "/players") {
          const exists = await teamService.checkTeamsExist();
          if (!exists) {
            toast.error(
              "Debe registrar al menos un equipo antes de acceder a Jugadores"
            );
            return;
          }
        }
      } catch (error) {
        console.error("Error verificando datos requeridos:", error);
        toast.error("Error al verificar los datos requeridos");
        return;
      }
    }

    navigate(path);
  };

  const drawer = (
    <div>
      <LogoContainer>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Pawkar Admin
        </Typography>
      </LogoContainer>

      <List>
        {menuItems.map((item) => {
          // Disable Teams menu item if no required data exists
          const isTeamsItem = item.path === "/teams";
          const isDisabled = isTeamsItem && hasRequiredData === false;

          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                display: "block",
                opacity: isDisabled ? 0.5 : 1,
                pointerEvents: isDisabled ? "none" : "auto",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
              onClick={() => !isDisabled && handleNavigation(item.path)}
            >
              <ListItemButton
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      {item.text}
                      {(item.text === "Jugadores" || item.text === "Equipos") &&
                        hasRequiredData === false && (
                          <Tooltip title="Se requiere registrar Subcategorías y Series primero">
                            <ErrorIcon
                              color="warning"
                              fontSize="small"
                              sx={{ ml: 1 }}
                            />
                          </Tooltip>
                        )}
                    </Box>
                  }
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: "medium",
                    component: "div",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ my: 2 }} />
        <List>
          {bottomMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
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
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
        }}
        open
      >
        {drawer}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
