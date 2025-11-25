import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
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
import categoriaService from "@/api/categoriaService";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ width: "100%" }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: isMobile ? 1 : 3,
            width: "100%",
            overflowX: "auto",
          }}
        >
          <div style={{ minWidth: isMobile ? "100%" : "auto" }}>{children}</div>
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
      const categoriaResponse = await categoriaService.getCategoriaByNemonico(
        "DEPORTES"
      );
      if (categoriaResponse.success && categoriaResponse.data) {
        const response = await subcategoriaService.getSubcategoriasByCategoria(
          categoriaResponse.data.categoriaId
        );

        if (response.success && response.data) {
          setSubcategorias(response.data);
          if (isInitialLoad && response.data.length > 0) {
            const firstSubcategoria = response.data[0].nombre;
            setSelectedSubcategoria(firstSubcategoria);
            setIsInitialLoad(false);
          }
        }
      } else {
        throw new Error("No se pudo obtener la categoría DEPORTES");
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

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
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
    <Box
      sx={{
        width: "100%",
        p: isMobile ? 1 : 3,
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <Card
        elevation={isMobile ? 0 : 1}
        sx={{
          borderRadius: isMobile ? 0 : 2,
          width: isMobile ? "100%" : "800px",
          maxWidth: "100%",
          margin: "0 auto",
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          minHeight: "500px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: isMobile ? 2 : 3,
            "&:last-child": { pb: isMobile ? 2 : 3 },
          }}
        >
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            justifyContent="flex-end"
            alignItems={isMobile ? "stretch" : "center"}
            gap={2}
            mb={3}
          >
            <Button
              fullWidth={isMobile}
              variant="contained"
              color="primary"
              startIcon={value === 0 ? <GroupAddIcon /> : <AddIcon />}
              onClick={() =>
                value === 0 ? setShowAssignRoleForm(true) : setShowAddForm(true)
              }
              size={isMobile ? "medium" : "large"}
              sx={{
                whiteSpace: "nowrap",
                minWidth: isMobile ? "100%" : "auto",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: theme.shadows[3],
                  backgroundColor: "primary.dark",
                },
              }}
            >
              {value === 0 ? "Asignar Rol" : "Agregar Rol"}
            </Button>
          </Box>

          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? true : false}
              allowScrollButtonsMobile
              sx={{
                minWidth: isMobile ? "max-content" : "auto",
                "& .MuiTab-root": {
                  minWidth: isMobile ? "auto" : 200,
                  px: isMobile ? 2 : 3,
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  textTransform: "none",
                  minHeight: "48px",
                },
              }}
            >
              <Tab
                label={isMobile ? "Asignar" : "Asignación de Roles"}
                {...a11yProps(0)}
              />
              <Tab
                label={isMobile ? "Lista" : "Lista de Roles"}
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <AssignRolesTable
              onSubcategoriaSelect={handleSubcategoriaSelect}
              rolesBySubcategoria={rolesBySubcategoria}
              setRolesBySubcategoria={setRolesBySubcategoria}
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
