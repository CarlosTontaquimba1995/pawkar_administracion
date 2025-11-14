import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Tooltip,
  Chip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Player } from "@/types/player.types";
import playerService from "@/api/playerService";

interface PlayerTableProps {
  refreshKey: number;
  onEdit: (player: Player) => void;
  onRefresh: () => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  refreshKey,
  onEdit,
  onRefresh,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalElements, setTotalElements] = useState(0);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await playerService.getPlayers({
        page,
        size: rowsPerPage,
        search: searchTerm,
      });

      if (response.success && response.data) {
        setPlayers(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Error loading players:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los jugadores",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers, refreshKey]);

  const handleChangePage = (_event: unknown, newPage: number) => {
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

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await playerService.deletePlayer(playerToDelete.id || 0);
      setSnackbar({
        open: true,
        message: response.message || "Jugador eliminado",
        severity: "success",
      });
      onRefresh(); // Refresh the parent component
    } catch (error) {
      console.error("Error deleting player:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el jugador",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setPlayerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setPlayerToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return players.slice(startIndex, startIndex + rowsPerPage);
  }, [players, page, rowsPerPage]);

  return (
    <Box>
      {/* Search Bar */}
      <Box mb={3}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar jugadores..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: { minWidth: 300 },
          }}
        />
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ flex: 1, mb: 3 }}>
        <Table
          size="small"
          sx={{ minWidth: 650 }}
          aria-label="tabla de jugadores"
        >
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Jugador</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Fecha Nacimiento</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron jugadores
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((player, index) => (
                <TableRow
                  key={player.id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1 + page * rowsPerPage}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                      >
                        {player.nombre?.charAt(0) || (
                          <PersonIcon fontSize="small" />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {player.nombre} {player.apellido}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{player.documentoIdentidad}</TableCell>
                  <TableCell>
                    {new Date(player.fechaNacimiento).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label="Activo"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(player)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(player)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalElements}
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
            paddingLeft: 0,
            paddingRight: 0,
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={playerToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Jugador</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar al jugador{" "}
            {playerToDelete?.nombre} {playerToDelete?.apellido}?
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

      {/* Snackbar for notifications */}
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
    </Box>
  );
};

export default PlayerTable;
