import React, { useEffect, useState } from "react";
import {
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";
import DataTable from "@/components/common/DataTable/DataTable";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
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
      setIsLoading(true);
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
      setIsLoading(false);
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
  const filteredRoles = React.useMemo(() => {
    if (!searchTerm) return initialRoles;
    const searchLower = searchTerm.toLowerCase();
    return initialRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchLower) ||
        (role.detail?.toLowerCase().includes(searchLower) ?? false)
    );
  }, [initialRoles, searchTerm]);

  // Pagination
  const paginatedRoles = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRoles.slice(start, start + rowsPerPage);
  }, [filteredRoles, page, rowsPerPage]);

  // Table columns
  const columns = [
    {
      id: "name",
      label: "Nombre",
      minWidth: 150,
      align: "left" as const,
    },
    {
      id: "detail",
      label: "Descripción",
      minWidth: 200,
      align: "left" as const,
      format: (value: string) => value || "-",
    },
    {
      id: "estado",
      label: "Estado",
      minWidth: 100,
      align: "left" as const,
      format: (value: boolean) => (value ? "Activo" : "Inactivo"),
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 120,
      align: "center" as const,
      format: (_: any, row: Role) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.id);
            }}
            disabled={isSystemRole(row.name)}
            title={
              isSystemRole(row.name)
                ? "No se puede editar este rol del sistema"
                : "Editar"
            }
            sx={{ "&:hover": { bgcolor: "primary.light", color: "white" } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            disabled={isSystemRole(row.name)}
            title={
              isSystemRole(row.name)
                ? "No se puede eliminar este rol del sistema"
                : "Eliminar"
            }
            sx={{ "&:hover": { bgcolor: "error.light", color: "white" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          mb: 3,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            maxWidth: isMobile ? "100%" : 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={paginatedRoles}
        loading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredRoles.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyMessage="No se encontraron roles"
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
