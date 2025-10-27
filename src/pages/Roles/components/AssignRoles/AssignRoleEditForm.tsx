import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  DialogTitle,
  Dialog,
  Divider,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import roleService from "@/api/roleService";
import subcategoriaRolesService from "@/api/subcategoriaRolesService";
import { Role } from "@/types/role.types";
import { SubcategoriaRol } from "@/types/subcategoriaRoles.types";
import { Subcategoria } from "@/types/subcategoria.types";

interface AssignRoleEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subcategoriaId: number;
}

const AssignRoleEditForm: React.FC<AssignRoleEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  subcategoriaId,
}) => {
  const [subcategoria, setSubcategoria] = useState<Subcategoria | null>(null);
  const [assignedRoles, setAssignedRoles] = useState<SubcategoriaRol[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const fetchSubcategoriaData = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await subcategoriaService.getSubcategoriaById(subcategoriaId);
      // setSubcategoria(data);
      setSubcategoria({
        subcategoriaId: subcategoriaId,
        nombre: `Subcategoría ${subcategoriaId}`,
        descripcion: `Descripción de la subcategoría ${subcategoriaId}`,
        categoriaId: 0,
        categoriaNombre: "",
        estado: true,
      });
    } catch (error) {
      console.error("Error fetching subcategory data:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar la subcategoría",
        severity: "error",
      });
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const rolesResponse = await roleService.getAllRoles();
      const assignedResponse =
        await subcategoriaRolesService.getRolesPorSubcategoriaId(
          subcategoriaId
        );

      const roles = rolesResponse?.data || [];
      const assigned = assignedResponse?.data || [];

      const assignedRolesData = assigned.map((role) => ({
        subcategoriaId: subcategoriaId,
        rolId: role.id,
        nombreRol: role.name,
        nombreSubcategoria: role.detail || "",
      }));

      setAssignedRoles(assignedRolesData);

      const assignedRoleIds = new Set(assigned.map((role) => role.id));
      const available = roles.filter((role) => !assignedRoleIds.has(role.id));
      setAvailableRoles(available);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los roles",
        severity: "error",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      setLoading(true);
      const response = await subcategoriaRolesService.asignarRolASubcategoria(
        subcategoriaId,
        selectedRole as number
      );

      if (response.success) {
        await fetchRoles();
        setSelectedRole("");
        setSnackbar({
          open: true,
          message: response.message || "Rol asignado correctamente",
          severity: "success",
        });
        onSuccess();
      } else {
        throw new Error(response.message || "Error al asignar el rol");
      }
    } catch (error: any) {
      console.error("Error assigning role:", error);
      setSnackbar({
        open: true,
        message: error.message || "Error al asignar el rol",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    try {
      setLoading(true);
      const response = await subcategoriaRolesService.eliminarRolDeSubcategoria(
        subcategoriaId,
        roleId
      );

      if (response.success) {
        await fetchRoles();
        setSnackbar({
          open: true,
          message: response.message || "Rol eliminado correctamente",
          severity: "success",
        });
        onSuccess();
      } else {
        throw new Error(response.message || "Error al eliminar el rol");
      }
    } catch (error: any) {
      console.error("Error removing role:", error);
      setSnackbar({
        open: true,
        message: error.message || "Error al eliminar el rol",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (open) {
      fetchSubcategoriaData();
      fetchRoles();
    }
  }, [open, subcategoriaId]);

  if (!subcategoria) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Editar Roles de Subcategoría</Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              disabled={loading}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle1" color="textSecondary">
            {subcategoria.nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {subcategoria.descripcion}
          </Typography>
        </DialogTitle>

        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Roles asignados a la subcategoría:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {assignedRoles.length > 0 ? (
                  assignedRoles.map((assignedRole) => (
                    <Chip
                      key={assignedRole.rolId}
                      label={assignedRole.nombreRol}
                      onDelete={() => handleRemoveRole(assignedRole.rolId)}
                      color="primary"
                      variant="outlined"
                      disabled={loading}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No hay roles asignados a esta subcategoría
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Asignar nuevo rol a la subcategoría:
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl
                  fullWidth
                  disabled={
                    rolesLoading || loading || availableRoles.length === 0
                  }
                  sx={{ minWidth: 200 }}
                >
                  <InputLabel id="role-select-label">
                    Seleccionar Rol
                  </InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={selectedRole}
                    label="Seleccionar Rol"
                    onChange={(e) => setSelectedRole(Number(e.target.value))}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>Seleccione un rol</em>
                    </MenuItem>
                    {availableRoles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {availableRoles.length === 0 && (
                    <FormHelperText>
                      Todos los roles disponibles ya están asignados
                    </FormHelperText>
                  )}
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    !selectedRole || loading || availableRoles.length === 0
                  }
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? "Asignando..." : "Asignar"}
                </Button>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              color="inherit"
            >
              Cerrar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AssignRoleEditForm;
