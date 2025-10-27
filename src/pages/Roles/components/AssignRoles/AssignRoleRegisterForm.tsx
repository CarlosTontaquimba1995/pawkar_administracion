import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Close as CloseIcon, Person as PersonIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import roleService from "@/api/roleService";
import subcategoriaRolesService from "@/api/subcategoriaRolesService";

interface AssignRoleRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Subcategoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Role {
  id: number;
  name: string;
}

const AssignRoleRegisterForm: React.FC<AssignRoleRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<number | "">(
    ""
  );
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [subcategoriaLoading, setSubcategoriaLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  useEffect(() => {
    if (open) {
      fetchSubcategorias();
      fetchRoles();
    }
  }, [open]);

  const fetchSubcategorias = async () => {
    try {
      setSubcategoriaLoading(true);
      // Replace with actual subcategory service call
      // const response = await subcategoriaService.getSubcategorias();
      // setSubcategorias(response.data);

      // Mock data for now
      setSubcategorias([
        { id: 1, nombre: "Subcategoría 1", descripcion: "Descripción 1" },
        { id: 2, nombre: "Subcategoría 2", descripcion: "Descripción 2" },
      ]);
    } catch (error) {
      console.error("Error fetching subcategorias:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar las subcategorías",
        severity: "error",
      });
    } finally {
      setSubcategoriaLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRoleLoading(true);
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los roles",
        severity: "error",
      });
    } finally {
      setRoleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubcategoria || !selectedRole) {
      setSnackbar({
        open: true,
        message: "Por favor seleccione una subcategoría y un rol",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await subcategoriaRolesService.asignarRolASubcategoria(
        selectedSubcategoria,
        selectedRole
      );

      setSnackbar({
        open: true,
        message: "Rol asignado a la subcategoría correctamente",
        severity: "success",
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error assigning role:", error);
      const errorMessage =
        error.response?.data?.message || "Error al asignar el rol";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSubcategoria("");
    setSelectedRole("");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
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
            <Typography variant="h6">Asignar Rol a Usuario</Typography>
            <IconButton onClick={handleClose} size="small" disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Box mb={3}>
                <FormControl
                  fullWidth
                  margin="normal"
                  disabled={subcategoriaLoading}
                >
                  <InputLabel id="subcategoria-select-label">
                    Subcategoría
                  </InputLabel>
                  <Select
                    labelId="subcategoria-select-label"
                    id="subcategoria-select"
                    value={selectedSubcategoria}
                    label="Subcategoría"
                    onChange={(e) =>
                      setSelectedSubcategoria(e.target.value as number)
                    }
                    required
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    {subcategorias.map((subcategoria) => (
                      <MenuItem key={subcategoria.id} value={subcategoria.id}>
                        {subcategoria.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {subcategoriaLoading && (
                    <FormHelperText>Cargando subcategorías...</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth margin="normal" disabled={roleLoading}>
                  <InputLabel id="role-select-label">Rol</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={selectedRole}
                    label="Rol"
                    onChange={(e) => setSelectedRole(e.target.value as number)}
                    required
                  >
                    <MenuItem value="">
                      <em>Seleccione un rol</em>
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {roleLoading && (
                    <FormHelperText>Cargando roles...</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            <DialogActions sx={{ px: 0 }}>
              <Button
                onClick={handleClose}
                variant="outlined"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 1,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !selectedSubcategoria || !selectedRole}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <PersonIcon />
                }
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 2,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Asignando..." : "Asignar Rol a Subcategoría"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
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
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AssignRoleRegisterForm;
