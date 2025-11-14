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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Snackbar } from "@mui/material";
import DataTable from "@/components/common/DataTable/DataTable";
import { Subcategoria } from "../../../../types/subcategoria.types";
import { Categoria } from "../../../../types/categoria.types";
import subcategoriaService from "@/api/subcategoriaService";
import SubcategoriaEditForm from "./SubcategoriaEditForm";

interface SubcategoriesTableProps {
  subcategories: Subcategoria[];
  categories: Categoria[];
  onRefresh: () => Promise<void>;
}

const SubcategoriesTable: React.FC<SubcategoriesTableProps> = ({
  subcategories: initialSubcategories,
  categories,
  onRefresh,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<number | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategoria[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<
    number | null
  >(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

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
    setEditingSubcategoryId(id);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSubcategoryToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!subcategoryToDelete) return;

    try {
      setIsDeleting(true);
      const response = await subcategoriaService.deleteSubcategoria(
        subcategoryToDelete
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message,
          severity: "success",
        });
        await onRefresh();
      } else {
        throw new Error(
          response.message || "Error al eliminar la subcategoría"
        );
      }
    } catch (error: any) {
      console.error("Error al eliminar la subcategoría:", error);

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
          message: error.message || "Error al eliminar la subcategoría",
          severity: "error",
        });
      }
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

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setFilteredSubcategories(initialSubcategories);
        return;
      }

      setIsLoading(true);
      try {
        const response = await subcategoriaService.getSubcategoriasByCategoria(
          selectedCategory
        );
        setFilteredSubcategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setFilteredSubcategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, initialSubcategories]);

  // Set first category on initial load
  useEffect(() => {
    if (initialLoad && categories.length > 0) {
      setSelectedCategory(categories[0]?.categoriaId || null);
      setInitialLoad(false);
    }
  }, [categories, initialLoad]);

  // Filter subcategories based on search term
  const searchedSubcategories = React.useMemo(() => {
    if (!searchTerm) return filteredSubcategories;

    const searchLower = searchTerm.toLowerCase();
    return filteredSubcategories.filter(
      (subcategory) =>
        subcategory.nombre.toLowerCase().includes(searchLower) ||
        getCategoryName(subcategory.categoriaId)
          .toLowerCase()
          .includes(searchLower)
    );
  }, [filteredSubcategories, searchTerm, categories]);

  // Handle category change
  const handleCategoryChange = (event: any) => {
    const categoryId =
      event.target.value === "" ? null : Number(event.target.value);
    setSelectedCategory(categoryId);
    setPage(0);
  };

  return (
    <Box>
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filtrar por categoría</InputLabel>
          <Select
            value={selectedCategory || ""}
            onChange={handleCategoryChange}
            label="Filtrar por categoría"
          >
            {categories.map((category) => (
              <MenuItem key={category.categoriaId} value={category.categoriaId}>
                {category.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          sx={{ minWidth: 250 }}
        />
      </Box>

      <DataTable
        columns={[
          {
            id: "nombre",
            label: "Nombre",
          },
          {
            id: "categoria",
            label: "Categoría",
            format: (_, row: Subcategoria) => getCategoryName(row.categoriaId),
          },
          {
            id: "acciones",
            label: "Acciones",
            align: "right",
            format: (_, row: Subcategoria) => (
              <>
                <IconButton
                  onClick={() => handleEdit(row.subcategoriaId)}
                  size="small"
                  color="primary"
                  disabled={isDeleting}
                  aria-label={`Editar ${row.nombre}`}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(row.subcategoriaId)}
                  size="small"
                  color="error"
                  disabled={isDeleting}
                  aria-label={`Eliminar ${row.nombre}`}
                >
                  {isDeleting && subcategoryToDelete === row.subcategoriaId ? (
                    <CircularProgress size={24} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </>
            ),
          },
        ]}
        data={searchedSubcategories}
        loading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={searchedSubcategories.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        emptyMessage="No se encontraron subcategorías"
        onRowClick={undefined}
        hover={true}
        stickyHeader={true}
      />

      {/* Snackbar para mostrar mensajes */}
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

      {/* Edit Dialog */}
      <SubcategoriaEditForm
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={async () => {
          await onRefresh();
          setEditDialogOpen(false);
        }}
        subcategoriaId={editingSubcategoryId || 0}
        categorias={categories}
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
