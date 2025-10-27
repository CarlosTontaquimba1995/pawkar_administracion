import {
  Box,
  Button,
  TextField,
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import roleService from "@/api/roleService";

interface RoleRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RoleFormData {
  id: number;
  name: string;
  detail: string;
  estado: boolean;
}

const RoleRegisterForm: React.FC<RoleRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [roles, setRoles] = useState<RoleFormData[]>([
    {
      id: Date.now(),
      name: "",
      detail: "",
      estado: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const { token } = useAuth();

  useEffect(() => {
    if (open) {
      // Initialize with one empty role
      setRoles([
        {
          id: Date.now(),
          name: "",
          detail: "",
          estado: true,
        },
      ]);
    }
  }, [open]);

  const handleAddRole = () => {
    setRoles([
      ...roles,
      {
        id: Date.now() + roles.length,
        name: "",
        detail: "",
        estado: true,
      },
    ]);
  };

  const handleRemoveRole = (id: number) => {
    if (roles.length > 1) {
      setRoles(roles.filter((role) => role.id !== id));
    }
  };

  const handleRoleChange = (
    id: number,
    field: string,
    value: string | boolean
  ) => {
    setRoles(
      roles.map((role) => {
        if (role.id === id) {
          return { ...role, [field]: value };
        }
        return role;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setSnackbar({
        open: true,
        message: "No se encontró el token de autenticación",
        severity: "error",
      });
      return;
    }

    // Validate all roles have names
    const hasEmptyFields = roles.some((role) => !role.name.trim());

    if (hasEmptyFields) {
      setSnackbar({
        open: true,
        message: "Por favor complete el nombre para todos los roles",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Create all roles
      const createPromises = roles.map((role) =>
        roleService.createOrUpdateRole({
          name: role.name,
          detail: role.detail,
        })
      );

      await Promise.all(createPromises);

      setSnackbar({
        open: true,
        message: `Se ${roles.length > 1 ? "agregaron" : "agregó"} ${
          roles.length
        } ${roles.length > 1 ? "roles" : "rol"} exitosamente`,
        severity: "success",
      });

      // Reset form
      setRoles([
        {
          id: Date.now(),
          name: "",
          detail: "",
          estado: true,
        },
      ]);

      // Notify parent component
      onSuccess();
    } catch (error: any) {
      console.error("Error al crear roles:", error);
      const errorMessage =
        error.response?.data?.message || "Error al crear los roles";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClose = () => {
    setRoles([
      {
        id: Date.now(),
        name: "",
        detail: "",
        estado: true,
      },
    ]);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Registrar Nuevos Roles</Typography>
            <IconButton onClick={handleClose} size="small" disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Información de los Roles
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddRole}
                  disabled={loading}
                >
                  Agregar otro
                </Button>
              </Box>

              {roles.map((role, index) => (
                <Box
                  key={role.id}
                  sx={{
                    position: "relative",
                    mb: 2,
                    "&:hover .delete-button": {
                      opacity: 1,
                      visibility: "visible",
                      transform: "translate(4px, -4px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      position: "relative",
                      overflow: "visible",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        label={`Nombre del Rol ${index + 1}`}
                        value={role.name}
                        onChange={(e) =>
                          handleRoleChange(role.id, "name", e.target.value)
                        }
                        size="small"
                        disabled={loading}
                        required
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Descripción"
                        value={role.detail}
                        onChange={(e) =>
                          handleRoleChange(role.id, "detail", e.target.value)
                        }
                        size="small"
                        disabled={loading}
                        multiline
                        rows={2}
                      />
                    </Box>
                    <Box>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`status-label-${role.id}`}>
                          Estado
                        </InputLabel>
                        <Select
                          labelId={`status-label-${role.id}`}
                          value={role.estado ? 1 : 0}
                          onChange={(e) =>
                            handleRoleChange(
                              role.id,
                              "estado",
                              e.target.value === 1
                            )
                          }
                          label="Estado"
                          disabled={loading}
                        >
                          <MenuItem value={1}>Activo</MenuItem>
                          <MenuItem value={0}>Inactivo</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Paper>
                  {roles.length > 1 && (
                    <IconButton
                      className="delete-button"
                      size="small"
                      onClick={() => handleRemoveRole(role.id)}
                      sx={{
                        position: "absolute",
                        right: -12,
                        top: -12,
                        color: "white",
                        backgroundColor: "error.main",
                        opacity: 0,
                        visibility: "hidden",
                        transition: "all 0.2s ease",
                        zIndex: 1,
                        "&:hover": {
                          backgroundColor: "error.dark",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
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
                disabled={
                  loading ||
                  roles.length === 0 ||
                  roles.some((role) => !role.name.trim())
                }
                startIcon={
                  loading ? <CircularProgress size={20} /> : <AddIcon />
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
                {loading
                  ? "Registrando..."
                  : `Registrar ${roles.length} ${
                      roles.length > 1 ? "Roles" : "Rol"
                    }`}
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

export default RoleRegisterForm;
