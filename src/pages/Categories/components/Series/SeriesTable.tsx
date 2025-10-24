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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
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
      await onRefresh();
    } catch (error) {
      console.error("Error deleting series:", error);
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
            subcategorias.find(
              (s) => s.subcategoriaId === serie.subcategoriaId
            )?.nombre || ""
          )
            .toLowerCase()
            .includes(searchLower)
      );
    }

    return result;
  }, [filteredSeries, searchTerm, subcategorias]);

  const currentRows = React.useMemo(() => {
    return rowsPerPage > 0 && filteredAndSearchedSeries
      ? filteredAndSearchedSeries.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
      : filteredAndSearchedSeries || [];
  }, [filteredAndSearchedSeries, page, rowsPerPage]);

  const emptyRows = Math.max(
    0,
    (1 + page) * rowsPerPage - (filteredAndSearchedSeries?.length || 0)
  );

  return (
    <Box>
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }} size="small">
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
          >
            <MenuItem value="">
              <em>Seleccionar subcategoría</em>
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
              <TableCell>Subcategoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    p={2}
                  >
                    <CircularProgress />
                    <Box mt={1}>Cargando series...</Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : !filteredSeries || filteredSeries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      {searchTerm
                        ? selectedSubcategoria
                          ? "No se encontraron series para la subcategoría seleccionada"
                          : "No hay series disponibles"
                        : "No hay series registradas"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {currentRows.map((serie) => (
                  <TableRow key={serie.serieId} hover>
                    <TableCell>{serie.nombreSerie}</TableCell>
                    <TableCell>
                      {subcategorias.find(
                        (s) => s.subcategoriaId === serie.subcategoriaId
                      )?.nombre || "Sin categoría"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={serie.estado ? "Activo" : "Inactivo"}
                        color={serie.estado ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEdit(serie.serieId)}
                        size="small"
                        color="primary"
                        disabled={isDeleting}
                        title="Editar serie"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(serie.serieId)}
                        size="small"
                        color="error"
                        disabled={isDeleting}
                        title="Eliminar serie"
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={serieToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">¿Eliminar serie?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar esta serie? Esta acción no se
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
            autoFocus
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAndSearchedSeries?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        sx={{
          "& .MuiTablePagination-toolbar": {
            paddingLeft: 2,
            paddingRight: 2,
          },
        }}
      />
    </Box>
  );
};

export default SeriesTable;
