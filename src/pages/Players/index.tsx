import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import RegisterPlayerForm from './RegisterPlayerForm';
import playerService from "../../api/playerService";
import EditPlayer from "./EditPlayerForm";
import { Player } from "@/types/player.types";

const Players: React.FC = () => {
  // Get auth token
  const { token } = useAuth();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  // Error state for handling API errors
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchPlayers = useCallback(
    async (
      page: number = 0,
      size: number = rowsPerPage,
      search: string = searchTerm
    ) => {
      if (!token) return;

      setIsLoading(true);
      setApiError(null);

      try {
        const response = await playerService.getPlayers({ page, size, search });

        setPlayers(response.data.content);
        setTotalElements(response.data.totalElements);

        // If the current page is greater than the total pages, reset to first page
        if (page >= response.data.totalPages) {
          setPage(0);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al cargar los jugadores";
        setApiError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [token, rowsPerPage, searchTerm]
  );

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Reset to first page when searching
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  // Fetch players when page, rowsPerPage, or searchTerm changes
  useEffect(() => {
    fetchPlayers(page, rowsPerPage, searchTerm);
  }, [fetchPlayers, page, rowsPerPage, searchTerm]);

  const handleRegisterSuccess = () => {
    setIsRegisterDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Jugador registrado exitosamente",
      severity: "success",
    });
    // Refresh the players list
    fetchPlayers();
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete || !token || playerToDelete.id === undefined) return;

    setIsDeleting(true);
    try {
      await playerService.deletePlayer(playerToDelete.id);
      fetchPlayers();
      setSnackbar({
        open: true,
        message: "Jugador eliminado correctamente",
        severity: "success",
      });
    } catch (error) {
      console.error("Error al eliminar el jugador:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el jugador. Por favor, inténtalo de nuevo.",
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

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 300,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar jugadores..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsRegisterDialogOpen(true)}
          sx={{
            boxShadow: theme.shadows[3],
            "&:hover": {
              boxShadow: theme.shadows[6],
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}
        >
          Inscribir Jugadores
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: theme.palette.background.paper,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" gap={2} flexWrap="wrap"></Box>
        </Box>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Apellido
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Documento
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Fecha Nacimiento
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Estado
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <PersonIcon
                      sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron jugadores
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {searchTerm
                        ? "Intenta con otros términos de búsqueda"
                        : "Comienza registrando tu primer jugador"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player, index) => (
                  <TableRow
                    key={player.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.03
                        ),
                      },
                      animation: `fadeIn 0.3s ease-in-out ${
                        index * 0.05
                      }s both`,
                      "@keyframes fadeIn": {
                        from: { opacity: 0, transform: "translateY(10px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <TableCell>{player.nombre}</TableCell>
                    <TableCell>{player.apellido}</TableCell>
                    <TableCell>{player.documentoIdentidad}</TableCell>
                    <TableCell>
                      {new Date(player.fechaNacimiento).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Activo"
                        size="small"
                        color="success"
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
                      <Tooltip title="Editar jugador">
                        <IconButton
                          size="small"
                          onClick={() => setEditingPlayer(player)}
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                            mr: 1,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar jugador">
                        <IconButton
                          size="small"
                          sx={{
                            ml: 1,
                            color: theme.custom.colors.accent1,
                            "&:hover": {
                              backgroundColor:
                                theme.custom.colorWithOpacity.accent1[10],
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(player);
                          }}
                          aria-label={`Eliminar a ${player.nombre} ${player.apellido}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
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
          />
        </TableContainer>
      </Paper>

      <RegisterPlayerForm
        open={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
        onSuccess={handleRegisterSuccess}
        token={token || ""}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Edit Player Dialog */}
      {editingPlayer && editingPlayer.id !== undefined && (
        <EditPlayer
          open={!!editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSuccess={() => {
            setSnackbar({
              open: true,
              message: "Jugador actualizado correctamente",
              severity: "success",
            });
            fetchPlayers();
            setEditingPlayer(null);
          }}
          playerId={editingPlayer.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!playerToDelete}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar al jugador{" "}
            {playerToDelete?.nombre} {playerToDelete?.apellido}? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            color="error"
            autoFocus
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Players;
