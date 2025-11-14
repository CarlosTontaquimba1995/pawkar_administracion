import React, { useState, useEffect } from "react";
import {
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Chip,
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
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import DataTable from "@/components/common/DataTable/DataTable";
import { Serie } from "@/types/serie.types";
import { Subcategoria } from "@/types/subcategoria.types";
import serieService from "@/api/serieService";

interface SeriesTableProps {
  series: Serie[];
  subcategorias: Subcategoria[];
  loading?: boolean;
  onRefresh: () => Promise<void>;
  onEdit?: (id: number) => void;
}

const SeriesTable: React.FC<SeriesTableProps> = ({
  subcategorias = [],
  loading = false,
  onRefresh,
  onEdit,
}) => {
  console.log("SeriesTable props:", {
    subcategorias,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [serieToDelete, setSerieToDelete] = useState<number | null>(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<
    number | null
  >(null);
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
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
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSerieToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!serieToDelete) return;

    try {
      setIsDeleting(true);
      // Call the delete service
      const response = await serieService.deleteSerie(serieToDelete);

      if (response.success) {
        // Refresh the data
        await onRefresh();
        // Show success message
        setSnackbar({
          open: true,
          message: response.message || "Serie eliminada",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || "Error al eliminar la serie",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting series:", error);
      setSnackbar({
        open: true,
        message: "Error inesperado al eliminar la serie",
        severity: "error",
      });
    } finally {
      setSerieToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setSerieToDelete(null);
    }
  };

  // Set first subcategory on initial load
  useEffect(() => {
    if (initialLoad && subcategorias.length > 0) {
      setSelectedSubcategoria(subcategorias[0]?.subcategoriaId || null);
      setInitialLoad(false);
    }
  }, [subcategorias, initialLoad]);

  // Fetch series when subcategory changes
  useEffect(() => {
    const fetchSeries = async () => {
      if (!selectedSubcategoria) return;

      setIsLoading(true);
      try {
        const response = await serieService.getSeriesBySubcategoria(
          selectedSubcategoria
        );
        // Store the full list of series in the state
        setFilteredSeries(response.data);
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedSubcategoria) {
      fetchSeries();
    } else if (subcategorias.length > 0) {
      setSelectedSubcategoria(subcategorias[0]?.subcategoriaId || null);
    }
  }, [selectedSubcategoria, subcategorias]);

  // Filter series based on search term
  const filteredAndSearchedSeries = React.useMemo(() => {
    let result = [...(filteredSeries || [])];

    // Apply search filter if there's a search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (serie) =>
          (serie.nombreSerie?.toLowerCase() || "").includes(searchLower) ||
          (
            subcategorias.find((s) => s.subcategoriaId === serie.subcategoriaId)
              ?.nombre || ""
          ).includes(searchLower)
      );
    }

    return result;
  }, [filteredSeries, searchTerm, subcategorias]);

  // Get theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Box
        mb={2}
        display="flex"
        gap={2}
        flexWrap="wrap"
        flexDirection={isMobile ? "column" : "row"}
      >
        <FormControl
          fullWidth={isMobile}
          size="small"
          sx={{
            minWidth: isMobile ? "100%" : 200,
            mb: isMobile ? 1 : 0,
          }}
        >
          <InputLabel>Filtrar por subcategoría</InputLabel>
          <Select
            value={selectedSubcategoria || ""}
            label="Filtrar por subcategoría"
            onChange={(e) => {
              const value = e.target.value;
              setSelectedSubcategoria(value ? Number(value) : null);
              setPage(0);
            }}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">
              <em>Todas las subcategorías</em>
            </MenuItem>
            {subcategorias.map((sub) => (
              <MenuItem key={sub.subcategoriaId} value={sub.subcategoriaId}>
                {sub.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Buscar series..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth={isMobile}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataTable
          columns={[
            {
              id: "nombreSerie",
              label: "Nombre",
              minWidth: 150,
            },
            {
              id: "subcategoria",
              label: "Subcategoría",
              minWidth: 150,
              hideOnMobile: true,
              format: (_, row: Serie) =>
                subcategorias.find(
                  (s) => s.subcategoriaId === row.subcategoriaId
                )?.nombre || "Sin categoría",
            },
            {
              id: "estado",
              label: "Estado",
              minWidth: 100,
              align: "center" as const,
              format: (row: Serie) => (
                <Chip
                  label={row.estado ? "Activo" : "Inactivo"}
                  color={row.estado ? "success" : "default"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    minWidth: 80,
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
              ),
            },
            {
              id: "acciones",
              label: "Acciones",
              align: "right",
              minWidth: 120,
              format: (_, row: Serie) => (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: isMobile ? "flex-start" : "flex-end",
                    gap: 1,
                  }}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row.serieId);
                    }}
                    size="small"
                    color="primary"
                    disabled={isDeleting}
                    aria-label={`Editar ${row.nombreSerie}`}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row.serieId);
                    }}
                    size="small"
                    color="error"
                    disabled={isDeleting}
                    aria-label={`Eliminar ${row.nombreSerie}`}
                  >
                    {isDeleting && serieToDelete === row.serieId ? (
                      <CircularProgress size={24} />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                </Box>
              ),
            },
          ]}
          data={filteredAndSearchedSeries}
          loading={isLoading || loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={filteredAndSearchedSeries?.length || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          emptyMessage={
            searchTerm
              ? selectedSubcategoria
                ? "No se encontraron series para la subcategoría seleccionada"
                : "No hay series disponibles"
              : "No hay series registradas"
          }
          onRowClick={undefined}
          hover={true}
          stickyHeader={true}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!serieToDelete}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta serie? Esta acción no se
            puede deshacer.
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
            startIcon={
              isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default SeriesTable;
