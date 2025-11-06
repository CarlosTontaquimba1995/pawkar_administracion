// src/pages/TablaPosiciones/TablaPosicionesTable.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { TablaPosicion } from "@/types/tablaPosicion.types";
import tablaPosicionService from "@/api/tablaPosicionService";

interface TablaPosicionesTableProps {
  refreshKey: number;
  onEdit: (posicion: TablaPosicion) => void;
  onRefresh: () => void;
}

const TablaPosicionesTable: React.FC<TablaPosicionesTableProps> = ({
  refreshKey,
  onEdit,
  onRefresh,
}) => {
  const [posiciones, setPosiciones] = useState<TablaPosicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchPosiciones = async () => {
      try {
        setLoading(true);
        // TODO: Update with actual subcategory ID or implement search
        const data = await tablaPosicionService.search({});
        setPosiciones(data);
      } catch (error) {
        console.error("Error al cargar la tabla de posiciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosiciones();
  }, [refreshKey]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (subcategoriaId: number, equipoId: number) => {
    if (window.confirm("¿Está seguro de eliminar esta posición?")) {
      try {
        await tablaPosicionService.delete(subcategoriaId, equipoId);
        onRefresh();
      } catch (error) {
        console.error("Error al eliminar la posición:", error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Equipo</TableCell>
              <TableCell align="center">PJ</TableCell>
              <TableCell align="center">PG</TableCell>
              <TableCell align="center">PE</TableCell>
              <TableCell align="center">PP</TableCell>
              <TableCell align="center">GF</TableCell>
              <TableCell align="center">GC</TableCell>
              <TableCell align="center">DG</TableCell>
              <TableCell align="center">Puntos</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posiciones.length > 0 ? (
              posiciones
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((posicion) => (
                  <TableRow
                    key={`${posicion.equipoId}-${posicion.subcategoriaId}`}
                  >
                    <TableCell>{posicion.equipoNombre}</TableCell>
                    <TableCell align="center">
                      {posicion.partidosJugados}
                    </TableCell>
                    <TableCell align="center">{posicion.victorias}</TableCell>
                    <TableCell align="center">{posicion.empates}</TableCell>
                    <TableCell align="center">{posicion.derrotas}</TableCell>
                    <TableCell align="center">{posicion.golesAFavor}</TableCell>
                    <TableCell align="center">
                      {posicion.golesEnContra}
                    </TableCell>
                    <TableCell align="center">
                      {posicion.diferenciaGoles}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={posicion.puntos}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(posicion)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDelete(
                            posicion.subcategoriaId,
                            posicion.equipoId
                          )
                        }
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No hay datos disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={posiciones.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
      />
    </Box>
  );
};

export default TablaPosicionesTable;
