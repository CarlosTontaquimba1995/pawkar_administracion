import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
import { Player } from '../../api/playerService';

const Players: React.FC = () => {
  // Get auth token
  const { token } = useAuth();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Error state for handling API errors
  const [apiError, setApiError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchPlayers = useCallback(async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API call
      // const data = await getPlayers();
      // setPlayers(data);
      
      // Mock data for now
      setTimeout(() => {
        setPlayers([
          {
            id: 1,
            nombre: 'Carlos',
            apellido: 'Pérez',
            fechaNacimiento: '1990-01-15',
            documentoIdentidad: '12345678',
            estado: 'ACTIVO'
          },
          {
            id: 2,
            nombre: 'María',
            apellido: 'González',
            fechaNacimiento: '1992-05-20',
            documentoIdentidad: '87654321',
            estado: 'ACTIVO'
          }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los jugadores';
      setApiError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleRegisterSuccess = () => {
    setIsRegisterDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Jugador registrado exitosamente',
      severity: 'success'
    });
    // Refresh the players list
    fetchPlayers();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDeletePlayer = async (playerId: number) => {
    try {
      // In a real app, you would call your API here
      // await deletePlayer(playerId);
      
      // For now, we'll just update the local state
      setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
      
      setSnackbar({
        open: true,
        message: 'Jugador eliminado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting player:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el jugador',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filter players based on search term
  const filteredPlayers = players.filter(player => {
    const searchLower = searchTerm.toLowerCase();
    return (
      player.nombre.toLowerCase().includes(searchLower) ||
      player.apellido.toLowerCase().includes(searchLower) ||
      player.documentoIdentidad.includes(searchTerm)
    );
  });

  // Pagination
  const paginatedPlayers = filteredPlayers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Jugadores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsRegisterDialogOpen(true)}
          sx={{
            boxShadow: theme.custom.colors.shadows.primary,
            '&:hover': {
              boxShadow: theme.custom.colors.shadows.medium,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
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
          border: '1px solid',
          borderColor: 'divider',
          background: theme.palette.background.paper,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={2} flexWrap="wrap">
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
                sx: {
                  minWidth: 250,
                },
              }}
            />
          </Box>
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
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Apellido</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Fecha Nacimiento</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron jugadores
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primer jugador'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlayers.map((player, index) => (
                  <TableRow 
                    key={player.id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      },
                      animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
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
                        label={player.estado}
                        size="small"
                        sx={{
                          backgroundColor: player.estado === 'ACTIVO' 
                            ? theme.custom.colorWithOpacity.accent2[20]
                            : theme.custom.colorWithOpacity.accent1[20],
                          color: player.estado === 'ACTIVO' 
                            ? theme.custom.colors.accent2
                            : theme.custom.colors.accent1,
                          fontWeight: 600,
                          borderRadius: 1.5,
                          border: `1px solid ${player.estado === 'ACTIVO' 
                            ? theme.custom.colorWithOpacity.accent2[30]
                            : theme.custom.colorWithOpacity.accent1[30]}`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar jugador">
                        <IconButton 
                          size="small" 
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': { 
                              backgroundColor: theme.custom.colorWithOpacity.primary[10],
                            }
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
                            '&:hover': { 
                              backgroundColor: theme.custom.colorWithOpacity.accent1[10],
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlayer(player.id);
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
            count={filteredPlayers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
            sx={{
              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              '& .MuiTablePagination-toolbar': {
                padding: 2,
              },
            }}
          />
        </TableContainer>
      </Paper>

      <RegisterPlayerForm
        open={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
        onSuccess={handleRegisterSuccess}
        token={token || ''}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Players;
