import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  IconButton,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  Divider,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close as CloseIcon, Add as AddIcon } from "@mui/icons-material";
import roleService from "@/api/roleService";
import subcategoriaRolesService from "@/api/subcategoriaRolesService";
import { Subcategoria } from "@/types/subcategoria.types";
import { Role } from "@/types/role.types";
import { SubcategoriaRol } from "@/types/subcategoriaRoles.types";
import subcategoriaService from "@/api/subcategoriaService";

interface AssignRoleRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SnackbarSeverity = "success" | "error" | "warning" | "info";

const AssignRoleRegisterForm: React.FC<AssignRoleRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  // State for form data
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<number | "">(
    ""
  );
  // State for role assignments to subcategories
  const [roleAssignments, setRoleAssignments] = useState<SubcategoriaRol[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [subcategoriaLoading, setSubcategoriaLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: "success" as const,
  });

  const handleCloseSnackbar = useCallback((): void => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Fetch data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        try {
          setSubcategoriaLoading(true);
          setRoleLoading(true);
          await Promise.all([fetchSubcategorias(), fetchRoles()]);
        } catch (error) {
          console.error("Error fetching data:", error);
          showSnackbar("Error al cargar los datos", "error");
        } finally {
          setSubcategoriaLoading(false);
          setRoleLoading(false);
        }
      }
    };

    fetchData();
  }, [open]);

  const fetchSubcategorias = async (): Promise<void> => {
    try {
      const response = await subcategoriaService.getSubcategorias();
      setSubcategorias(response.data);
    } catch (error) {
      console.error("Error fetching subcategorias:", error);
      throw error;
    }
  };

  const fetchRoles = async (): Promise<void> => {
    try {
      const response = await roleService.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  };

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleAddRole = (): void => {
    const newAssignment: SubcategoriaRol = {
      id: Date.now(),
      rolId: 0,
      rolName: "",
      rolDetail: "",
      subcategoriaId: 0,
      subcategoriaName: "",
    };

    setRoleAssignments((prev) => [...prev, newAssignment]);
  };

  const handleRemoveRole = (id: number): void => {
    setRoleAssignments((prev) => prev.filter((role) => role.id !== id));
  };

  const handleRoleChange = (
    id: number | undefined,
    role: Role | null
  ): void => {
    if (id === undefined) return;

    setRoleAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              rolId: role?.id ?? 0,
              rolName: role?.name ?? "",
              rolDetail: role?.detail ?? "",
            }
          : assignment
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedSubcategoria) {
      showSnackbar("Por favor seleccione una subcategoría", "error");
      return;
    }

    const validAssignments = roleAssignments.filter(
      (assignment) => assignment.rolId !== 0
    );

    if (validAssignments.length === 0) {
      showSnackbar("Por favor seleccione al menos un rol", "error");
      return;
    }

    const subcategoria = subcategorias.find(
      (s) => s.subcategoriaId === selectedSubcategoria
    );

    if (!subcategoria) {
      showSnackbar("Subcategoría no encontrada", "error");
      return;
    }

    try {
      setLoading(true);

      // Get the selected subcategoria details
      const selectedSubcategoriaData = subcategorias.find(
        (s) => s.subcategoriaId === selectedSubcategoria
      );

      if (!selectedSubcategoriaData) {
        throw new Error("No se encontró la subcategoría seleccionada");
      }

      // Prepare data for bulk assignment
      const bulkData = {
        subcategoriaId: selectedSubcategoriaData.subcategoriaId,
        roles: validAssignments.map((assignment) => assignment.rolId as number),
      };

      // Make a single API call to assign all roles
      await subcategoriaRolesService.asignarMultiplesRoles(bulkData);

      showSnackbar(
        "Roles asignados correctamente a la subcategoría",
        "success"
      );

      // Reset form and trigger parent refresh
      setSelectedSubcategoria("");
      onSuccess(); // Call the success callback to refresh parent data
      handleClose();
    } catch (error: any) {
      console.error("Error assigning roles:", error);
      const errorMessage =
        error.response?.data?.message || "Error al asignar los roles";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setSelectedSubcategoria("");
    setRoleAssignments([]);
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={!loading ? handleClose : undefined}
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
            <Typography variant="h6">Asignar Roles a Subcategoría</Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              disabled={loading}
              aria-label="cerrar"
            >
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
                  Información de la Asignación
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <FormControl
                  fullWidth
                  size="small"
                  disabled={subcategoriaLoading || loading}
                  error={
                    !selectedSubcategoria &&
                    roleAssignments.some((ra) => ra.rolId !== 0)
                  }
                >
                  <InputLabel id="subcategoria-select-label">
                    Subcategoría *
                  </InputLabel>
                  <Select
                    labelId="subcategoria-select-label"
                    id="subcategoria-select"
                    value={selectedSubcategoria}
                    label="Subcategoría *"
                    onChange={(e) =>
                      setSelectedSubcategoria(Number(e.target.value))
                    }
                    required
                  >
                    <MenuItem value="">
                      <em>Seleccione una subcategoría</em>
                    </MenuItem>
                    {subcategorias.map((subcategoria) => (
                      <MenuItem
                        key={subcategoria.subcategoriaId}
                        value={subcategoria.subcategoriaId}
                      >
                        {subcategoria.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {subcategoriaLoading && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      Cargando subcategorías...
                    </Typography>
                  )}
                </FormControl>
              </Paper>

              <Box sx={{ mb: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    Roles a Asignar
                  </Typography>
                  <Button
                    onClick={handleAddRole}
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    disabled={roleLoading || loading}
                    sx={{ textTransform: "none" }}
                  >
                    Agregar Rol
                  </Button>
                </Box>

                {roleAssignments.length === 0 && (
                  <Box textAlign="center" py={3}>
                    <Typography variant="body2" color="textSecondary">
                      No hay roles asignados. Haga clic en "Agregar Rol" para
                      comenzar.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {roleAssignments.map((assignment) => (
                    <Box
                      key={assignment.id}
                      sx={{
                        position: "relative",
                        mb: 2,
                        "&:hover .delete-button": {
                          opacity: 1,
                          visibility: "visible",
                        },
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <FormControl fullWidth size="small">
                            <Autocomplete<Role, false, false, false>
                              options={roles}
                              getOptionLabel={(option) =>
                                option
                                  ? `${option.name} - ${option.detail || ""}`
                                  : ""
                              }
                              value={
                                roles.find((r) => r.id === assignment.rolId) ||
                                null
                              }
                              onChange={(_, newValue) =>
                                handleRoleChange(assignment.id, newValue)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Rol *"
                                  variant="outlined"
                                  size="small"
                                  required
                                />
                              )}
                              isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                              }
                              noOptionsText="No se encontraron roles"
                              loading={roleLoading}
                              loadingText="Cargando roles..."
                              disabled={loading}
                              fullWidth
                            />
                          </FormControl>
                        </Box>
                      </Paper>

                      <IconButton
                        className="delete-button"
                        size="small"
                        onClick={() =>
                          assignment.id && handleRemoveRole(assignment.id)
                        }
                        sx={{
                          position: "absolute",
                          top: -12,
                          right: -12,
                          backgroundColor: "error.main",
                          color: "white",
                          opacity: 0,
                          visibility: "hidden",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "error.dark",
                          },
                        }}
                        aria-label="eliminar rol"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <DialogActions sx={{ px: 0, pb: 0 }}>
              <Button
                onClick={handleClose}
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
                disabled={
                  loading ||
                  !selectedSubcategoria ||
                  roleAssignments.length === 0 ||
                  roleAssignments.some((ra) => ra.rolId === 0)
                }
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default AssignRoleRegisterForm;
