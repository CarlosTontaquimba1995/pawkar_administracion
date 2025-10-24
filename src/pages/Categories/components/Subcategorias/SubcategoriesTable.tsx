import React, { useState } from "react";
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
import { Subcategoria } from "../../../../types/subcategoria.types";
import { Categoria } from "../../../../types/categoria.types";
import subcategoriaService from "@/api/subcategoriaService";

interface SubcategoriesTableProps {
  subcategories: Subcategoria[];
  categories: Categoria[];
  onRefresh: () => Promise<void>;
}

const SubcategoriesTable: React.FC<SubcategoriesTableProps> = ({
  subcategories,
  categories,
  onRefresh,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<number | null>(
    null
  );

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
    // Implement edit navigation
    console.log("Edit subcategory:", id);
  };

  const handleDeleteClick = (id: number) => {
    setSubcategoryToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;

    try {
      setIsDeleting(true);
      await subcategoriaService.deleteSubcategoria(subcategoryToDelete);
      // La notificación de éxito se manejará en el componente padre
      await onRefresh();
    } catch (error) {
      // La notificación de error se manejará en el componente padre
    } finally {
      setSubcategoryToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setSubcategoryToDelete(null);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.categoriaId === categoryId);
    return category?.nombre || "Sin categoría";
  };

  // Filter subcategories based on search term
  const filteredSubcategories = subcategories.filter(
    (subcategory) =>
      subcategory.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(subcategory.categoriaId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredSubcategories.length)
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
          placeholder="Buscar subcategorías..."
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
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubcategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      No se encontraron subcategorías
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredSubcategories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((subcategory) => (
                    <TableRow key={subcategory.subcategoriaId}>
                      <TableCell>{subcategory.subcategoriaId}</TableCell>
                      <TableCell>{subcategory.nombre}</TableCell>
                      <TableCell>
                        {getCategoryName(subcategory.categoriaId)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            subcategory.estado === true ? "Activo" : "Inactivo"
                          }
                          color={
                            subcategory.estado === true ? "success" : "default"
                          }
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
                          onClick={() => handleEdit(subcategory.subcategoriaId)}
                          size="small"
                          color="primary"
                          disabled={isDeleting}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleDeleteClick(subcategory.subcategoriaId)
                          }
                          size="small"
                          color="error"
                          disabled={isDeleting}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={5} />
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
        count={filteredSubcategories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={subcategoryToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Subcategoría</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar esta subcategoría?
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
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubcategoriesTable;
