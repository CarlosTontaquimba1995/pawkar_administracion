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
import { Serie } from "@/types/serie.types";
import { Subcategoria } from "@/types/subcategoria.types";

interface SeriesTableProps {
  series: Serie[];
  subcategorias: Subcategoria[];
  loading?: boolean;
  onRefresh: () => Promise<void>;
  onEdit?: (id: number) => void;
}

const SeriesTable: React.FC<SeriesTableProps> = ({
  series = [],
  subcategorias = [],
  loading = false,
  onRefresh,
  onEdit,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [serieToDelete, setSerieToDelete] = useState<number | null>(null);

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

  // Filter series based on search term
  const filteredSeries = React.useMemo(() => {
    if (!searchTerm) return series;

    const searchLower = searchTerm.toLowerCase();
    return series.filter(
      (serie) =>
        serie.nombreSerie?.toLowerCase().includes(searchLower) ||
        (
          subcategorias.find((s) => s.subcategoriaId === serie.subcategoriaId)
            ?.nombre || ""
        )
          .toLowerCase()
          .includes(searchLower)
    );
  }, [series, searchTerm, subcategorias]);

  // Get current rows to display
  const currentRows = React.useMemo(() => {
    return rowsPerPage > 0
      ? filteredSeries.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        )
      : filteredSeries;
  }, [filteredSeries, page, rowsPerPage]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = Math.max(
    0,
    (1 + page) * rowsPerPage - filteredSeries.length
  );

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
          placeholder="Buscar series..."
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box
                    py={4}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <CircularProgress />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      Cargando series...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredSeries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      {searchTerm
                        ? "No se encontraron series que coincidan con la búsqueda"
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
        count={filteredSeries.length}
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
