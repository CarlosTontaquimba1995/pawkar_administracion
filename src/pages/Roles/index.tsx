import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add as AddIcon, GroupAdd as GroupAddIcon } from "@mui/icons-material";
import { Role } from "@/types/role.types";
import { Subcategoria } from "@/types/subcategoria.types";
import { SubcategoriaRol } from "@/types/subcategoriaRoles.types";
import roleService from "@/api/roleService";
import subcategoriaService from "@/api/subcategoriaService";
import subcategoriaRolesService from "@/api/subcategoriaRolesService";
import RolesTable from "./components/Roles/RolesTable";
import RoleRegisterForm from "./components/Roles/RoleRegisterForm";
import AssignRolesTable from "./components/AssignRoles/AssignRolesTable";
import AssignRoleRegisterForm from "./components/AssignRoles/AssignRoleRegisterForm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const RolesPage = () => {
  const [value, setValue] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>("");
  const [rolesBySubcategoria, setRolesBySubcategoria] = useState<
    Record<string, SubcategoriaRol[]>
  >({});
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignRoleForm, setShowAssignRoleForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { token } = useAuth();

  const fetchSubcategorias = async () => {
    try {
      const response = await subcategoriaService.getSubcategorias();
      if (response.success && response.data) {
        setSubcategorias(response.data);
        // Only set the first subcategory if this is the initial load
        if (isInitialLoad && response.data.length > 0) {
          const firstSubcategoria = response.data[0].nombre;
          setSelectedSubcategoria(firstSubcategoria);
          // Mark initial load as complete
          setIsInitialLoad(false);
        }
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar las subcategorías",
        severity: "error",
      });
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // Fetch all roles
      const rolesResponse = await roleService.getAllRoles();
      setRoles(rolesResponse.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los roles",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles and subcategories on mount
  useEffect(() => {
    if (token) {
      fetchRoles();
      fetchSubcategorias();
    }
  }, [token]);

  // Fetch roles when selectedSubcategoria changes
  useEffect(() => {
    if (selectedSubcategoria && !rolesBySubcategoria[selectedSubcategoria]) {
      fetchRolesBySubcategoria(selectedSubcategoria);
    }
  }, [selectedSubcategoria]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSuccess = async () => {
    await fetchRoles();
    setSnackbar({
      open: true,
      message: "Operación realizada con éxito",
      severity: "success",
    });
  };

  const handleAssignRoleSuccess = async () => {
    // Refresh the roles for the current subcategory
    if (selectedSubcategoria) {
      // Clear the cached data for this subcategory to force a refetch
      setRolesBySubcategoria((prev) => {
        const newState = { ...prev };
        delete newState[selectedSubcategoria];
        return newState;
      });

      // Fetch the updated roles for the current subcategory
      await fetchRolesBySubcategoria(selectedSubcategoria);
    }

    setSnackbar({
      open: true,
      message: "Rol asignado correctamente",
      severity: "success",
    });
  };

  const fetchRolesBySubcategoria = async (subcategoriaNombre: string) => {
    try {
      // Find the subcategoria by name to get its ID
      const subcategoria = subcategorias.find(
        (sub) => sub.nombre === subcategoriaNombre
      );

      if (!subcategoria) {
        throw new Error(`Subcategoría '${subcategoriaNombre}' no encontrada`);
      }

      // Use the ID to fetch roles
      const response = await subcategoriaRolesService.getRolesPorSubcategoriaId(
        subcategoria.subcategoriaId
      );

      // The response should already be in the correct format
      const rolesData = response?.data || [];

      setRolesBySubcategoria((prev) => ({
        ...prev,
        [subcategoriaNombre]: rolesData,
      }));
    } catch (error) {
      console.error("Error fetching roles by subcategoria ID:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los roles de la subcategoría",
        severity: "error",
      });
    }
  };

  const handleSubcategoriaSelect = (subcategoriaNombre: string) => {
    setSelectedSubcategoria(subcategoriaNombre);
    // The useEffect will handle fetching the roles
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" component="h1">
          Gestión de Roles
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<GroupAddIcon />}
            onClick={() => setShowAssignRoleForm(true)}
            sx={{
              display: value === 0 ? "flex" : "none",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
                borderColor: "primary.main",
              },
            }}
          >
            Asignar Rol
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            sx={{
              display: value === 1 ? "flex" : "none",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
                borderColor: "primary.main",
              },
            }}
          >
            Nuevo Rol
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="roles tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
            >
              <Tab label="Asignación de Roles" {...a11yProps(0)} />
              <Tab label="Lista de Roles" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <AssignRolesTable
              onSubcategoriaSelect={handleSubcategoriaSelect}
              rolesBySubcategoria={rolesBySubcategoria}
              subcategorias={subcategorias}
              onRefresh={fetchRoles}
              loading={loading}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <RolesTable roles={roles} onRefresh={fetchRoles} />
          </TabPanel>
        </CardContent>
      </Card>

      {/* Add Role Form */}
      <RoleRegisterForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleSuccess}
      />

      <AssignRoleRegisterForm
        open={showAssignRoleForm}
        onClose={() => setShowAssignRoleForm(false)}
        onSuccess={handleAssignRoleSuccess}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesPage;
