import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import verificationService from "../../api/verificationApiService";
import ThemeConfigDialog from "@/components/theme/ThemeConfigDialog";
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
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  EmojiEvents as EmojiEventsIcon,
  Category as CategoryIcon,
  Groups as TeamsIcon,
  People as PlayersIcon,
  Event as EventsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ErrorOutline as ErrorIcon,
  RollerShades,
  Watch as MatchIcon,
} from "@mui/icons-material";
import teamService from "../../api/teamService";
import categoriaService from "../../api/categoriaService";

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
  { text: "Roles", icon: <RollerShades />, path: "/roles" },
  { text: "Equipos", icon: <TeamsIcon />, path: "/teams" },
  { text: "Jugadores", icon: <PlayersIcon />, path: "/players" },
  { text: "Encuentros", icon: <MatchIcon />, path: "/encuentros" },
  { text: "Posiciones", icon: <EmojiEventsIcon />, path: "/posiciones" },
  {
    text: "Eventos",
    icon: <EventsIcon />,
    path: "/events",
    requiresEventsCategory: true,
  },
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
  const [hasEventsCategory, setHasEventsCategory] = useState<boolean | null>(
    null
  );
  const [hasRolesRequiredData, setHasRolesRequiredData] = useState<
    boolean | null
  >(null);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });
  const [_, setIsVerificationActive] = useState(true);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showSnackbar = (
    message: string,
    severity: "error" | "success" | "info" | "warning" = "error"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const checkAllRequiredData = async () => {
    if (!token) return;

    try {
      // Check general required data
      const hasData = await verificationService.checkRequiredRegistrations();
      setHasRequiredData(hasData);

      // Check for roles required data (same validation as Teams and Players)
      try {
        const hasRolesData =
          await verificationService.checkRequiredRegistrations();
        setHasRolesRequiredData(hasRolesData);
      } catch (error) {
        console.log("Error verificando datos requeridos para Roles:", error);
        setHasRolesRequiredData(false);
      }

      // Check for events category
      try {
        await categoriaService.getCategoriaByNemonico("EVENTOS");
        setHasEventsCategory(true);
      } catch (error) {
        console.log("Categoría EVENTOS no encontrada");
        setHasEventsCategory(false);
      }
    } catch (error) {
      console.error("Error verificando datos requeridos:", error);
      setHasRequiredData(false);
      setHasRolesRequiredData(false);
      setHasEventsCategory(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const checkAndUpdate = async () => {
      await checkAllRequiredData();

      // Verificar si todos los módulos están habilitados
      const allModulesActive =
        hasRequiredData !== false &&
        hasRolesRequiredData !== false &&
        hasEventsCategory !== false;

      // Si todos los módulos están activos, detener el intervalo
      if (allModulesActive && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        setIsVerificationActive(false);
      }
    };

    // Verificación inicial
    checkAndUpdate().catch(console.error);

    // Configurar el intervalo solo si hay módulos deshabilitados
    if (
      hasRequiredData === false ||
      hasRolesRequiredData === false ||
      hasEventsCategory === false
    ) {
      intervalId = setInterval(checkAndUpdate, 5000);
      setIsVerificationActive(true);
    }

    // Limpieza al desmontar
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [token, hasRequiredData, hasRolesRequiredData, hasEventsCategory]);

  const handleNavigation = async (path: string) => {
    if (path === "/logout") {
      await logout();
      navigate("/login");
      return;
    }

    // Verificar si se está accediendo al módulo de roles
    if (path === "/roles") {
      if (hasRolesRequiredData === false) {
        showSnackbar(
          "Debe existir al menos una categoría, subcategoría y serie registrada para acceder a este módulo",
          "error"
        );
        return;
      }
    }

    // Check if trying to access Events module
    if (path === "/events" && hasEventsCategory === false) {
      showSnackbar(
        "No se encontró la categoría 'EVENTOS'. Por favor, regístrela primero.",
        "error"
      );
      return;
    }

    // Check if trying to access Teams or Players module
    if (
      (path === "/teams" || path === "/players") &&
      hasRequiredData === false
    ) {
      showSnackbar(
        "Debe existir al menos una categoría, subcategoría y serie registrada para acceder a este módulo",
        "error"
      );
      return;
    }

    // For players, also check if there are teams
    if (path === "/players") {
      try {
        const exists = await teamService.checkTeamsExist();
        if (!exists) {
          showSnackbar(
            "Debe registrar al menos un equipo antes de acceder a Jugadores",
            "error"
          );
          return;
        }
      } catch (error) {
        console.error("Error verificando equipos:", error);
        showSnackbar("Error al verificar los equipos existentes", "error");
        return;
      }
    }

    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const handleSettingsClick = () => {
    setThemeDialogOpen(true);
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
          // Handle navigation with validation
          const isTeamsItem = item.path === "/teams";
          const isEventsItem = item.path === "/events";
          const isPlayersItem = item.path === "/players";

          const handleItemClick = () => {
            if ((isTeamsItem || isPlayersItem) && hasRequiredData === false) {
              showSnackbar(
                "Debe existir al menos una categoría, subcategoría y serie registrada para acceder a este módulo",
                "error"
              );
              return;
            }
            if (isEventsItem && hasEventsCategory === false) {
              showSnackbar(
                "Debe existir al menos una categoría, subcategoría y serie registrada para acceder a este módulo",
                "error"
              );
              return;
            }
            handleNavigation(item.path);
          };

          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                display: "block",
                cursor: "pointer",
              }}
              onClick={handleItemClick}
            >
              <ListItemButton
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  opacity:
                    ((isTeamsItem || isPlayersItem) &&
                      hasRequiredData === false) ||
                    (isEventsItem && hasEventsCategory === false) ||
                    (item.path === "/roles" && hasRolesRequiredData === false)
                      ? 0.7
                      : 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      {item.text}
                      {((item.text === "Jugadores" ||
                        item.text === "Equipos") &&
                        hasRequiredData === false) ||
                      (item.text === "Eventos" &&
                        hasEventsCategory === false) ||
                      (item.text === "Roles" &&
                        hasRolesRequiredData === false) ? (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            ml: 1,
                          }}
                        >
                          <Tooltip
                            title={
                              item.text === "Eventos"
                                ? "Se requiere registrar la categoría 'EVENTOS' primero"
                                : item.text === "Roles"
                                ? "Debe existir al menos una categoría, subcategoría y serie registrada para acceder a este módulo"
                                : "Se requiere registrar Subcategorías y Series primero"
                            }
                            arrow
                            placement="top"
                          >
                            <Box
                              component="span"
                              sx={{ display: "inline-flex" }}
                            >
                              <ErrorIcon color="warning" fontSize="small" />
                            </Box>
                          </Tooltip>
                        </Box>
                      ) : null}
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
                onClick={() => {
                  if (item.path === "/logout") {
                    handleLogout();
                  } else if (item.path === "/settings") {
                    handleSettingsClick();
                  } else {
                    navigate(item.path);
                  }
                }}
                selected={location.pathname === item.path}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    "&:hover": {
                      backgroundColor: "primary.light",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                    "& .MuiListItemText-primary": {
                      fontWeight: "bold",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>

      <ThemeConfigDialog
        open={themeDialogOpen}
        onClose={() => setThemeDialogOpen(false)}
      />

      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </StyledDrawer>
    </>
  );
};

export default Sidebar;
