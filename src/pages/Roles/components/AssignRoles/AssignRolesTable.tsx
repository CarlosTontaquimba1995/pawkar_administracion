import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Subcategoria } from "@/types/subcategoria.types";
import { SubcategoriaRol } from "@/types/subcategoriaRoles.types";
import subcategoriaRolesService from "@/api/subcategoriaRolesService";

interface AssignRolesTableProps {
  rolesBySubcategoria: Record<string, SubcategoriaRol[]>;
  setRolesBySubcategoria: React.Dispatch<
    React.SetStateAction<Record<string, SubcategoriaRol[]>>
  >;
  subcategorias?: Subcategoria[];
  loading?: boolean;
  onSubcategoriaSelect: (subcategoriaNombre: string) => void;
  onRefresh?: () => Promise<void>;
}

const AssignRolesTable: React.FC<AssignRolesTableProps> = ({
  subcategorias = [],
  rolesBySubcategoria = {},
  setRolesBySubcategoria,
  onSubcategoriaSelect,
  loading = false,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string | "">(
    subcategorias[0]?.nombre || ""
  );

  // Automatically select the first subcategory if none is selected
  React.useEffect(() => {
    if (subcategorias.length > 0 && !selectedSubcategoria) {
      setSelectedSubcategoria(subcategorias[0].nombre);
      onSubcategoriaSelect?.(subcategorias[0].nombre);
    }
  }, [subcategorias, selectedSubcategoria, onSubcategoriaSelect]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Delete dialog state
  const [roleToDelete, setRoleToDelete] = useState<SubcategoriaRol | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubcategoriaChange = async (event: SelectChangeEvent<string>) => {
    const subcategoriaNombre = event.target.value as string;
    setSelectedSubcategoria(subcategoriaNombre);

    if (!subcategoriaNombre) {
      return;
    }

    // Notify parent component to load roles for this subcategory if not already loaded
    onSubcategoriaSelect(subcategoriaNombre);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = useMemo(() => {
    if (!selectedSubcategoria) {
      // If no subcategory is selected, show all roles from all subcategories
      return Object.values(rolesBySubcategoria)
        .flat()
        .filter(
          (role: SubcategoriaRol) =>
            (role.rolName || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (role.rolDetail || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
    }
    const roles = rolesBySubcategoria[selectedSubcategoria] || [];
    return roles.filter(
      (role: SubcategoriaRol) =>
        (role.rolName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.rolDetail || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedSubcategoria, rolesBySubcategoria, searchTerm]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteClick = (role: SubcategoriaRol) => {
    setRoleToDelete(role);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete || !selectedSubcategoria) return;

    try {
      setIsDeleting(true);
      const response = await subcategoriaRolesService.eliminarRolDeSubcategoria(
        roleToDelete.subcategoriaId,
        roleToDelete.rolId
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || "Rol eliminado exitosamente",
          severity: "success",
        });

        // Update the local state immediately
        if (rolesBySubcategoria[selectedSubcategoria]) {
          const updatedRoles = rolesBySubcategoria[selectedSubcategoria].filter(
            (role) =>
              !(
                role.rolId === roleToDelete.rolId &&
                role.subcategoriaId === roleToDelete.subcategoriaId
              )
          );

          setRolesBySubcategoria((prev) => ({
            ...prev,
            [selectedSubcategoria]: updatedRoles,
          }));
        }

        // Also trigger a refresh from the server to ensure consistency
        onSubcategoriaSelect(selectedSubcategoria);
      } else {
        throw new Error(
          response.message || "Error al eliminar el rol de la subcategoría"
        );
      }
    } catch (error: any) {
      console.error("Error al eliminar el rol de la subcategoría:", error);

      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            error.message || "Error al eliminar el rol de la subcategoría",
          severity: "error",
        });
      }
    } finally {
      setRoleToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setRoleToDelete(null);
  };

  const isSystemRole = (roleName?: string) => {
    if (!roleName) return false;
    return ["ADMIN", "MANAGER", "USER"].includes(roleName);
  };

  // Check if user has a specific role

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filtrar por subcategoría</InputLabel>
          <Select
            value={selectedSubcategoria}
            onChange={handleSubcategoriaChange}
            label="Filtrar por subcategoría"
            disabled={loading || subcategorias.length === 0}
          >
            {subcategorias?.map((subcategoria) => (
              <MenuItem
                key={`subcat-${
                  subcategoria.subcategoriaId || subcategoria.nombre
                }`}
                value={subcategoria.nombre || ""}
              >
                {subcategoria.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                Descripción del Rol
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Subcategoría</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No se encontraron roles
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((role: SubcategoriaRol, index: number) => (
                  <TableRow
                    key={`role-${role.rolId}-${role.subcategoriaId}-${index}`}
                  >
                    <TableCell>{role.rolDetail || "Sin descripción"}</TableCell>
                    <TableCell>
                      {role.subcategoriaName || "Sin subcategoría"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Activo"
                        color="success"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          "&.MuiChip-colorSuccess": {
                            bgcolor: "accent2.light",
                            color: "accent2.dark",
                            "&:hover": {
                              bgcolor: "accent2.main",
                              color: "white",
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(role)}
                        disabled={isSystemRole(role.rolName)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!roleToDelete}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro que desea eliminar el rol "{roleToDelete?.rolName}" de
            esta subcategoría? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={
              isDeleting ||
              (roleToDelete ? isSystemRole(roleToDelete.rolName) : false)
            }
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
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
    </Box>
  );
};

export default AssignRolesTable;
