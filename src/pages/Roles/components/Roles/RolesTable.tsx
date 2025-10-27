import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import { Role } from "@/types/role.types";
import roleService from "@/api/roleService";
import RoleEditForm from "./RoleEditForm";

interface RolesTableProps {
  roles: Role[];
  onRefresh: () => Promise<void>;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles: initialRoles,
  onRefresh,
}) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    setRoles(initialRoles);
    setFilteredRoles(initialRoles);
  }, [initialRoles]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEdit = (id: number) => {
    setEditingRoleId(id);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      setIsDeleting(true);
      const response = await roleService.deleteRole(roleToDelete.id);

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message || "Rol eliminado exitosamente",
          severity: "success",
        });
        await onRefresh();
      } else {
        throw new Error(response.message || "Error al eliminar el rol");
      }
    } catch (error: any) {
      console.error("Error al eliminar el rol:", error);

      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: error.message || "Error al eliminar el rol",
          severity: "error",
        });
      }
    } finally {
      setRoleToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setRoleToDelete(null);
    }
  };

  const isSystemRole = (roleName: string): boolean => {
    return roleName === "ROLE_USER" || roleName === "ROLE_ADMIN";
  };

  // Filter roles based on search term
  const searchedRoles = React.useMemo(() => {
    if (!searchTerm) return roles;

    const searchLower = searchTerm.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchLower) ||
        role.detail?.toLowerCase().includes(searchLower) ||
        ""
    );
  }, [roles, searchTerm]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - searchedRoles.length) : 0;

  return (
    <Box>
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={handleSearchChange}
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
              <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={4}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : searchedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      No se encontraron roles
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {searchedRoles
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.detail || "Sin descripción"}</TableCell>
                      <TableCell>
                        <Chip
                          label={role.estado ? "Activo" : "Inactivo"}
                          color={role.estado ? "success" : "default"}
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
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleEdit(role.id)}
                          size="small"
                          color="primary"
                          disabled={isDeleting || isSystemRole(role.name)}
                          title={
                            isSystemRole(role.name)
                              ? "No se puede editar este rol del sistema"
                              : "Editar"
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(role)}
                          size="small"
                          color="error"
                          disabled={isDeleting || isSystemRole(role.name)}
                          title={
                            isSystemRole(role.name)
                              ? "No se puede eliminar este rol del sistema"
                              : "Eliminar"
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={4} />
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={searchedRoles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
      {/* Edit Dialog */}
      <RoleEditForm
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={async () => {
          await onRefresh();
          setEditDialogOpen(false);
        }}
        roleId={editingRoleId || 0}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={roleToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Rol</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {roleToDelete && isSystemRole(roleToDelete.name) ? (
              <Typography color="error">
                No se puede eliminar el rol "{roleToDelete.name}" porque es un
                rol del sistema.
              </Typography>
            ) : (
              `¿Está seguro de que desea eliminar el rol "${roleToDelete?.name}"?`
            )}
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
              (roleToDelete ? isSystemRole(roleToDelete.name) : false)
            }
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default RolesTable;
