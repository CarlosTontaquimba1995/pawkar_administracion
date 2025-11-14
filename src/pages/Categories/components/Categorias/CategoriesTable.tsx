import React, { useState, useEffect } from "react";
import {
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import DataTable from "@/components/common/DataTable/DataTable";
import { Snackbar, Alert } from "@mui/material";
import { Categoria } from "@/types/categoria.types";
import categoriaService from "@/api/categoriaService";
import CategoriaEditForm from "./CategoriaEditForm";

interface CategoriesTableProps {
  categories: Categoria[];
  onRefresh: () => Promise<void>;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories: initialCategories,
  onRefresh,
}) => {
  // Use local state for categories to enable optimistic updates
  const [localCategories, setLocalCategories] =
    useState<Categoria[]>(initialCategories);

  // Update local categories when props change
  useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
    autoHideDuration?: number;
    onClose?: () => void;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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
    setEditingCategoryId(id);
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    // Optimistically update the UI
    const previousCategories = [...localCategories];
    const updatedCategories = localCategories.filter(
      (cat) => cat.categoriaId !== categoryToDelete
    );
    setLocalCategories(updatedCategories);

    // Close the delete confirmation dialog
    setCategoryToDelete(null);

    try {
      setIsDeleting(true);
      const response = await categoriaService.deleteCategoria(categoryToDelete);

      if (!response.success) {
        // If the API call fails, revert the UI and show error
        setLocalCategories(previousCategories);
        throw new Error(response.message || "Error al eliminar la categoría");
      }

      // Show success message
      setSnackbar({
        open: true,
        message: response.message || "Categoría eliminada exitosamente",
        severity: "success",
      });

      // Refresh data in the background
      onRefresh().catch((error) => {
        console.error("Error al actualizar las categorías:", error);
      });
    } catch (error: any) {
      console.error("Error al eliminar la categoría:", error);

      // Handle 400 Bad Request with custom message
      if (error.response?.data?.message) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          severity: "error",
        });
      } else {
        // Handle other errors
        setSnackbar({
          open: true,
          message: error.message || "Error al eliminar la categoría",
          severity: "error",
        });
      }
    } finally {
      setCategoryToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setCategoryToDelete(null);
    }
  };

  // Filter categories based on search term
  const filteredCategories = localCategories.filter((category) =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box mb={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataTable
        columns={[
          {
            id: "nombre",
            label: "Nombre",
          },
          {
            id: "acciones",
            label: "Acciones",
            align: "right",
            format: (_: any, row: Categoria) => (
              <>
                <IconButton
                  onClick={() => handleEdit(row.categoriaId)}
                  size="small"
                  color="primary"
                  disabled={isDeleting}
                  aria-label={`Editar ${row.nombre}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(row.categoriaId)}
                  size="small"
                  color="error"
                  disabled={isDeleting}
                  aria-label={`Eliminar ${row.nombre}`}
                >
                  {isDeleting && categoryToDelete === row.categoriaId ? (
                    <CircularProgress size={24} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </>
            ),
          },
        ]}
        data={filteredCategories}
        loading={false}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredCategories.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyMessage="No se encontraron categorías"
        onRowClick={undefined}
        hover={true}
        stickyHeader={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={categoryToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Categoría</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar esta categoría?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      {editingCategoryId !== null && (
        <CategoriaEditForm
          open={!!editingCategoryId}
          onClose={() => setEditingCategoryId(null)}
          onSuccess={onRefresh}
          categoriaId={editingCategoryId || 0}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => {
            setSnackbar((prev) => ({ ...prev, open: false }));
            snackbar.onClose?.();
          }}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoriesTable;
