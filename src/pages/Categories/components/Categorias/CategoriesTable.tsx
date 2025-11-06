import React, { useState, useEffect } from "react";
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

  const handleChangePage = (_: unknown, newPage: number) => {
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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredCategories.length)
      : 0;

  return (
    <Box>
      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow key="no-results">
                <TableCell colSpan={3} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      No se encontraron categorías
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {(rowsPerPage > 0
                  ? filteredCategories.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : filteredCategories
                ).map((category, index) => (
                  <TableRow key={`category-${category.categoriaId || index}`}>
                    <TableCell>{category.nombre}</TableCell>
                    <TableCell>
                      <Chip
                        label={category.estado ? "Activo" : "Inactivo"}
                        color={category.estado ? "success" : "default"}
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
                        onClick={() => handleEdit(category.categoriaId)}
                        size="small"
                        color="primary"
                        disabled={isDeleting}
                        aria-label={`Editar ${category.nombre}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(category.categoriaId)}
                        size="small"
                        color="error"
                        disabled={isDeleting}
                        aria-label={`Eliminar ${category.nombre}`}
                      >
                        {isDeleting &&
                        categoryToDelete === category.categoriaId ? (
                          <CircularProgress size={24} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow
                    key={`empty-rows-${page}`}
                    style={{ height: 53 * emptyRows }}
                  >
                    <TableCell colSpan={3} />
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      <Box component="div" sx={{ mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Box>

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
