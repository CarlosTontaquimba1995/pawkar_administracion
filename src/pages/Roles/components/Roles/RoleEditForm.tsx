import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
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
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import roleService from "@/api/roleService";

interface RoleEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roleId: number;
}

const RoleEditForm: React.FC<RoleEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  roleId,
}) => {
  const [role, setRole] = useState<{
    rolId: number;
    name: string;
    rolDetail: string;
  }>({
    rolId: 0,
    name: "",
    rolDetail: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  const { token } = useAuth();

  // Fetch role data when component mounts or roleId changes
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!token || !open) return;

      try {
        setLoading(true);
        const response = await roleService.getRoleById(roleId);

        if (!response?.data) {
          throw new Error("No se encontraron datos del rol");
        }

        setRole({
          rolId: response.data.id,
          name: response.data.name,
          rolDetail: response.data.detail,
        });
      } catch (error) {
        console.error("Error fetching role data:", error);
        setSnackbar({
          open: true,
          message:
            error instanceof Error
              ? error.message
              : "Error al cargar los datos del rol",
          severity: "error",
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (open && roleId > 0) {
      fetchRoleData();
    }
  }, [token, roleId, open]);


  const handleDetailChange = (value: string) => {
    setRole((prev) => ({
      ...prev,
      rolDetail: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role.name.trim()) {
      setSnackbar({
        open: true,
        message: "El nombre es requerido",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await roleService.updateRole(role.rolId, {
        name: role.name,
        detail: role.rolDetail,
      });

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || "Rol actualizado correctamente",
          severity: "success",
        });

        // Close the dialog and refresh the roles list
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        throw new Error(response.message || "Error al actualizar el rol");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error",
        });
      } else if (error.message) {
        setSnackbar({
          open: true,
          message: error.message,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Editar Rol</Typography>
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
        </DialogTitle>

        <Divider />

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box mb={3}>
              <TextField
                label="Nombre del rol"
                variant="outlined"
                fullWidth
                margin="normal"
                value={role.name}
                InputProps={{
                  readOnly: true,
                }}
                disabled={true}
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "rgba(0, 0, 0, 0.6)",
                    WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                  },
                }}
              />

              <TextField
                label="Descripción"
                variant="outlined"
                fullWidth
                margin="normal"
                value={role.rolDetail}
                onChange={(e) => handleDetailChange(e.target.value)}
                disabled={loading}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              color="inherit"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RoleEditForm;
