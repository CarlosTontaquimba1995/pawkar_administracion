import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Fade,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import teamService from '../../api/teamService';
import subcategoriaService from '../../api/subcategoriaService';
import RegisterTeam from './RegisterTeam';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.background.default,
  },
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.background.paper,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

interface Subcategoria {
  subcategoriaId: number;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string;
}

interface Equipo {
  equipoId: number;
  subcategoriaId: number;
  subcategoriaNombre: string;
  serieId: number;
  serieNombre: string;
  nombre: string;
  fundacion: string;
  jugadoresCount: number;
  // Keeping these for backward compatibility
  id?: number;
  name?: string;
  sport?: string;
  members?: number;
  status?: 'active' | 'inactive';
  created?: string;
  categoriaId?: number;
}


const Teams = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<Subcategoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [teams, setTeams] = useState<Equipo[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Equipo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch categories on component mount
  useEffect(() => {
    if (!token) {
      console.error('No authentication token found');
      navigate('/login');
      return;
    }

    const fetchCategorias = async () => {
      try {
        const response = await subcategoriaService.getCategories(token);
        if (response.success) {
          // The API returns the subcategories in response.data
          setCategorias(response.data || []);
        }
      } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar las subcategorías',
          severity: 'error',
        });
      }
    };

    fetchCategorias();
  }, [token, navigate, page, rowsPerPage]);

  // Fetch all teams
  const fetchEquipos = useCallback(async () => {
    if (!token) {
      console.error('No authentication token found');
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await teamService.getTeams(token, undefined, page, rowsPerPage);
      if (response.success) {
        // Handle both paginated and non-paginated responses
        let teamsData: Equipo[] = [];
        
        if (Array.isArray(response.data)) {
          // Non-paginated response
          teamsData = response.data;
        } else if (response.data && Array.isArray(response.data.content)) {
          // Paginated response
          teamsData = response.data.content;
          
          // Update pagination info if available
          if (response.data.totalElements !== undefined) {
            setTotalElements(response.data.totalElements);
          }
          if (response.data.totalPages !== undefined) {
            setTotalPages(response.data.totalPages);
          }
        }
        // Map the API response to match our Equipo interface
        const formattedTeams = teamsData.map((team: any) => ({
          equipoId: team.equipoId,
          subcategoriaId: team.subcategoriaId,
          subcategoriaNombre: team.subcategoriaNombre,
          serieId: team.serieId,
          serieNombre: team.serieNombre,
          nombre: team.nombre,
          fundacion: team.fundacion,
          jugadoresCount: team.jugadoresCount || 0,
          // Backward compatibility
          id: team.equipoId,
          name: team.nombre,
          sport: team.subcategoriaNombre,
          members: team.jugadoresCount || 0,
          status: 'active' as const, // Default status
          created: team.fundacion,
          categoriaId: team.subcategoriaId,
        }));
        
        setTeams(formattedTeams);
        setFilteredTeams(formattedTeams);
        
        // Update pagination info if available
        if (response.data) {
          setTotalElements(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 1);
        }
      }
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      setError('Error al cargar los equipos');
      setSnackbar({
        open: true,
        message: 'Error al cargar los equipos',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, page, rowsPerPage]);

  // Fetch teams by subcategory
  const fetchEquiposBySubcategoria = useCallback(async (subcategoriaId: number) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await teamService.getTeamsBySubcategoria(token, subcategoriaId);
      
      if (response.success) {
        const teamsData = Array.isArray(response.data) ? response.data : [];
        
        // Map the API response to match our Equipo interface
        const formattedTeams = teamsData.map((team: any) => ({
          equipoId: team.equipoId,
          subcategoriaId: team.subcategoriaId,
          subcategoriaNombre: team.subcategoriaNombre,
          serieId: team.serieId,
          serieNombre: team.serieNombre,
          nombre: team.nombre,
          fundacion: team.fundacion,
          jugadoresCount: team.jugadoresCount || 0,
          // Backward compatibility
          id: team.equipoId,
          name: team.nombre,
          sport: team.subcategoriaNombre,
          members: team.jugadoresCount || 0,
          status: 'active' as const,
          created: team.fundacion,
          categoriaId: team.subcategoriaId,
        }));
        
        setTeams(formattedTeams);
        setFilteredTeams(formattedTeams);
        
        // Reset pagination when filtering
        setPage(0);
        setTotalElements(formattedTeams.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error al filtrar equipos por subcategoría:', error);
      setError('Error al filtrar equipos');
      setSnackbar({
        open: true,
        message: 'Error al filtrar equipos por subcategoría',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Initial load of teams
  useEffect(() => {
    if (!categoriaSeleccionada) {
      fetchEquipos();
    }
  }, [categoriaSeleccionada, fetchEquipos]);

  // Handle subcategory filter change
  useEffect(() => {
    if (categoriaSeleccionada) {
      fetchEquiposBySubcategoria(parseInt(categoriaSeleccionada, 10));
    } else {
      // If no category is selected, show all teams
      fetchEquipos();
    }
    // Reset search term when changing categories
    setSearchTerm('');
  }, [categoriaSeleccionada, fetchEquipos, fetchEquiposBySubcategoria]);

  // Handle category change
  const handleCategoriaChange = (event: SelectChangeEvent<string>) => {
    setCategoriaSeleccionada(event.target.value);
    setPage(0); // Reset to first page
    // The fetchEquipos will be triggered by the useEffect due to categoriaSeleccionada change
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = teams.filter(team => 
      (team.nombre || '').toLowerCase().includes(value) ||
      (team.subcategoriaNombre || '').toLowerCase().includes(value) ||
      (team.serieNombre || '').toLowerCase().includes(value)
    );
    setFilteredTeams(filtered);
    setPage(0); // Reset to first page when searching
    setTotalElements(filtered.length);
    setTotalPages(Math.ceil(filtered.length / rowsPerPage));
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredTeams.length) : 0;

  const handleRegisterSuccess = () => {
    setIsRegisterDialogOpen(false);
    fetchEquipos();
    setSnackbar({
      open: true,
      message: 'Equipo(s) registrado(s) exitosamente',
      severity: 'success',
    });
  };

  return (
    <React.Fragment>
      <RegisterTeam
        open={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
      <RegisterTeam
        open={isRegisterDialogOpen}
        onClose={() => setIsRegisterDialogOpen(false)}
        onSuccess={handleRegisterSuccess}
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
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Equipos
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
          Inscribir Equipos
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
              placeholder="Buscar equipos..."
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
            <FormControl size="small" sx={{ minWidth: 250 }} variant="outlined">
              <InputLabel id="categoria-label">Categoría</InputLabel>
              <Select
                labelId="categoria-label"
                id="categoria-select"
                value={categoriaSeleccionada}
                label="Categoría"
                onChange={handleCategoriaChange}
                sx={{
                  '& .MuiSelect-select': {
                    padding: '8.5px 14px',
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return <span>Seleccionar categoría</span>;
                  const selectedCat = categorias.find(cat => cat.subcategoriaId.toString() === selected);
                  return selectedCat?.nombre || 'Seleccionar categoría';
                }}
              >
                {categorias.map((categoria) => (
                  <MenuItem 
                    key={`cat-${categoria.subcategoriaId}-${categoria.nombre.replace(/\s+/g, '-').toLowerCase()}`} 
                    value={categoria.subcategoriaId.toString()}
                  >
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </Select>
              </FormControl>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Deporte</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Jugadores</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Fecha de creación</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No se encontraron equipos
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(filteredTeams) ? filteredTeams : [])
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((team, index) => (
                    <StyledTableRow key={`team-${team?.id || 'unknown'}-${team?.name?.replace(/\s+/g, '-').toLowerCase() || index}`}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              mr: 2,
                            }}
                          >
                            <GroupIcon />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {team.nombre || team.name || 'Equipo sin nombre'}
                          </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={team.subcategoriaNombre || 'Sin categoría'}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'primary.light',
                              color: 'primary.dark',
                              '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'white'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{team.members}</Typography>
                        </TableCell>
                        <TableCell>
                            <Chip
                              label={team.status === 'active' ? 'Activo' : 'Inactivo'}
                              color={team.status === 'active' ? 'success' : 'default'}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                '&.MuiChip-colorSuccess': {
                                  bgcolor: 'accent2.light',
                                  color: 'accent2.dark',
                                  '&:hover': {
                                    bgcolor: 'accent2.main',
                                    color: 'white'
                                  }
                                }
                              }}
                            />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {team.fundacion ? new Date(team.fundacion).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small" 
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                  color: 'white'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              sx={{
                                color: 'accent1.main',
                                '&:hover': {
                                  bgcolor: 'accent1.light',
                                  color: 'white'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </StyledTableRow>
                    ))
                )}
                {!isLoading && emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTeams.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>
    </React.Fragment>
  );
};

export default Teams;
