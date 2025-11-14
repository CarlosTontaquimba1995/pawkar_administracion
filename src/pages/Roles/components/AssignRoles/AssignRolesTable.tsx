import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  useMediaQuery,
  InputAdornment,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import DataTable from "@/components/common/DataTable/DataTable";
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
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>("");
  const [roleToDelete, setRoleToDelete] = useState<SubcategoriaRol | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Set initial selected subcategory
  useEffect(() => {
    if (subcategorias.length > 0 && !selectedSubcategoria) {
      setSelectedSubcategoria(subcategorias[0]?.nombre || "");
      if (subcategorias[0]?.nombre) {
        onSubcategoriaSelect?.(subcategorias[0].nombre);
      }
    }
  }, [subcategorias, selectedSubcategoria, onSubcategoriaSelect]);

  const handleSubcategoriaChange = (event: SelectChangeEvent) => {
    const subcategoriaNombre = event.target.value as string;
    setSelectedSubcategoria(subcategoriaNombre);
    onSubcategoriaSelect?.(subcategoriaNombre);
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

  const handleDeleteClick = (role: SubcategoriaRol) => {
    setRoleToDelete(role);
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setRoleToDelete(null);
    }
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

        // Update local state
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

        // Refresh data
        onSubcategoriaSelect(selectedSubcategoria);
      } else {
        throw new Error(response.message || "Error al eliminar el rol");
      }
    } catch (error: any) {
      console.error("Error al eliminar el rol:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error al eliminar el rol",
        severity: "error",
      });
    } finally {
      setRoleToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Filter and paginate data
  const filteredData = useMemo(() => {
    if (!selectedSubcategoria) {
      return [];
    }

    const roles = rolesBySubcategoria[selectedSubcategoria] || [];

    if (!searchTerm) return roles;

    const searchLower = searchTerm.toLowerCase();
    return roles.filter(
      (role) =>
        (role.rolName || "").toLowerCase().includes(searchLower) ||
        (role.rolDetail || "").toLowerCase().includes(searchLower)
    );
  }, [selectedSubcategoria, rolesBySubcategoria, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Table columns
  const columns = [
    {
      id: "rolName",
      label: "Rol",
      minWidth: 150,
      align: "left" as const,
    },
    {
      id: "rolDetail",
      label: "Descripción",
      minWidth: 200,
      align: "left" as const,
      format: (value: string) => value || "-",
    },
    {
      id: "actions",
      label: "Acciones",
      minWidth: 100,
      align: "center" as const,
      format: (_: any, row: SubcategoriaRol) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
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
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
        }}
      >
        <FormControl sx={{ minWidth: isMobile ? "100%" : 250 }} size="small">
          <InputLabel id="subcategoria-select-label">Subcategoría</InputLabel>
          <Select
            labelId="subcategoria-select-label"
            id="subcategoria-select"
            value={selectedSubcategoria}
            label="Subcategoría"
            onChange={handleSubcategoriaChange}
            disabled={loading}
            fullWidth={isMobile}
          >
            {subcategorias.map((subcategoria) => (
              <MenuItem
                key={subcategoria.subcategoriaId}
                value={subcategoria.nombre}
              >
                {subcategoria.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth={isMobile}
          variant="outlined"
          size="small"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={loading}
          sx={{
            maxWidth: isMobile ? "100%" : 300,
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
        data={paginatedData}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredData.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyMessage="No se encontraron roles asignados"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!roleToDelete}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Eliminar rol de subcategoría
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar el rol "{roleToDelete?.rolName}
            " de esta subcategoría? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            color="primary"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
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
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
    </Box>
  );
};

export default AssignRolesTable;
