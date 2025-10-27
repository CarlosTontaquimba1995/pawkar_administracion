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
    field: keyof RoleFormData,
    value: string
  ) => {
    setRoles(
      roles.map((role) => (role.id === id ? { ...role, [field]: value } : role))
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

    // Filter out any empty roles (both name and detail empty)
    const validRoles = roles.filter(
      (role) => role.name.trim() !== "" || role.detail.trim() !== ""
    );

    if (validRoles.length === 0) {
      setSnackbar({
        open: true,
        message: "Debe agregar al menos un rol válido",
        severity: "error",
      });
      return;
    }

    // Check if any role has an empty name
    const hasEmptyName = validRoles.some((role) => role.name.trim() === "");
    if (hasEmptyName) {
      setSnackbar({
        open: true,
        message: "El nombre del rol es obligatorio",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const rolesToCreate = validRoles.map((role) => ({
        name: role.name.trim(),
        detail: role.detail.trim(),
      }));

      const createPromises = rolesToCreate.map((role) =>
        roleService.createOrUpdateRole(role)
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
      const initialRoleState = {
        id: Date.now(),
        name: "",
        detail: "",
      };
      setRoles([initialRoleState]);

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
    const initialRoleState = {
      id: Date.now(),
      name: "",
      detail: "",
    };
    setRoles([initialRoleState]);
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
