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
import serieService from "../../../api/serieService";
import { Serie } from "@/types/serie.types";

interface SeriesTableProps {
  series: Serie[];
  onRefresh: () => Promise<void>;
}

const SeriesTable: React.FC<SeriesTableProps> = ({ series, onRefresh }) => {
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
    // Implement edit navigation
    console.log("Edit series:", id);
  };

  const handleDeleteClick = (id: number) => {
    setSerieToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!serieToDelete) return;

    try {
      setIsDeleting(true);
      await serieService.deleteSerie(serieToDelete);
      // La notificación de éxito se manejará en el componente padre
      await onRefresh();
    } catch (error) {
      // La notificación de error se manejará en el componente padre
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
  const filteredSeries = series.filter(
    (serie) =>
      serie.nombreSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serie.subcategoriaNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredSeries.length)
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
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSeries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="textSecondary">
                      No se encontraron series
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {(rowsPerPage > 0
                  ? filteredSeries.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : filteredSeries
                ).map((serie) => (
                  <TableRow key={serie.serieId}>
                    <TableCell>{serie.serieId}</TableCell>
                    <TableCell>{serie.nombreSerie}</TableCell>
                    <TableCell>{serie.subcategoriaNombre || "-"}</TableCell>
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
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(serie.serieId)}
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
      />
    </Box>
  );
};

export default SeriesTable;
