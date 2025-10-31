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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import serieService from '../../api/serieService';
import RegisterTeam from './RegisterTeamForm';
import EditTeam from './EditTeamForm';
import { Team } from "@/types/team.types";
import { Subcategoria } from "@/types/subcategoria.types";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.background.default,
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.paper,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Teams = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState<Subcategoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const [series, setSeries] = useState<
    Array<{ serieId: number; nombre: string }>
  >([]);
  const [serieSeleccionada, setSerieSeleccionada] = useState<string>("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch series when a subcategory is selected
  const fetchSeries = useCallback(
    async (subcategoriaId: number) => {
      if (!token) return;

      setIsLoadingSeries(true);
      setSerieSeleccionada("");

      try {
        const seriesData = await serieService.getSeriesBySubcategoria(
          subcategoriaId
        );
        const formattedSeries = seriesData.data.map((serie: any) => ({
          serieId: serie.serieId,
          nombre: serie.nombreSerie || serie.nombre || "",
        }));
        setSeries(formattedSeries);
      } catch (error) {
        console.error("Error al cargar las series:", error);
        setSeries([]);
      } finally {
        setIsLoadingSeries(false);
      }
    },
    [token]
  );

  // Fetch categories on component mount
  useEffect(() => {
    if (!token) {
      console.error("No authentication token found");
      navigate("/login");
      return;
    }

    const fetchCategorias = async () => {
      try {
        const response = await subcategoriaService.getCategories(token);
        if (response.success) {
          setCategorias(response.data || []);
        }
      } catch (error) {
        console.error("Error al obtener subcategorías:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar las subcategorías",
          severity: "error",
        });
      }
    };

    fetchCategorias();
  }, [token, navigate, page, rowsPerPage]);

  // Fetch all teams
  const fetchEquipos = useCallback(
    async (page = 0, size = 10) => {
      if (!token) {
        console.error("No authentication token found");
        navigate("/login");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await teamService.getTeams({ page, size });
        if (response.success) {
          // Los equipos están en response.data.content
          const teamsData = response.data || [];

          // Actualizar el estado de paginación
          setTotalElements(response.data.totalElements);
          setPage(response.data.number);

          // Mapear la respuesta de la API para que coincida con nuestra interfaz Equipo
          const formattedTeams = teamsData.content.map((team: any) => ({
            // Original API fields
            equipoId: team.equipoId,
            subcategoriaId: team.subcategoriaId,
            subcategoriaNombre: team.subcategoriaNombre,
            serieId: team.serieId,
            serieNombre: team.serieNombre,
            nombre: team.nombre,
            fundacion: team.fundacion,
            jugadoresCount: team.jugadoresCount,
            estado: team.estado || "activo", // Usando 'activo' en español

            // Backward compatibility
            id: team.equipoId,
            name: team.nombre,
            sport: team.subcategoriaNombre,
            members: team.jugadoresCount || 0,
            status: team.estado || "activo", // Mantenemos status para compatibilidad
            created: team.fundacion,
            categoriaId: team.subcategoriaId,
          }));

          // Update teams and filtered teams
          // Actualizar el estado con los equipos formateados
          setTeams(formattedTeams);
          setFilteredTeams(formattedTeams);
        }
      } catch (error) {
        console.error("Error al obtener equipos:", error);
        setError("Error al cargar los equipos");
        setSnackbar({
          open: true,
          message: "Error al cargar los equipos",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [token, page, rowsPerPage]
  );

  // Fetch teams by subcategory and optional serie
  const fetchEquiposBySubcategoria = useCallback(
    async (subcategoriaId: number, serieId?: number, page = 0, size = 10) => {
      if (!token) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await teamService.getTeamsBySubcategoria(
          subcategoriaId,
          {
            serieId,
            page,
            size,
            sort: "nombre,asc", // Opcional: ordenar por nombre
          }
        );

        if (response.success) {
          // Los equipos están en response.data (que es un array)
          const teamsData = Array.isArray(response.data) ? response.data : [];

          // Actualizar el estado de paginación con valores por defecto
          // ya que la respuesta de la API no incluye información de paginación
          const totalElements = teamsData.length;

          setTotalElements(totalElements);
          setPage(0); // Siempre mostramos la primera página

          // Mapear la respuesta de la API para que coincida con nuestra interfaz Equipo
          const formattedTeams = teamsData.map((team: any) => ({
            // Original API fields
            equipoId: team.equipoId,
            subcategoriaId: team.subcategoriaId,
            subcategoriaNombre: team.subcategoriaNombre,
            serieId: team.serieId,
            serieNombre: team.serieNombre,
            nombre: team.nombre,
            fundacion: team.fundacion,
            jugadoresCount: team.jugadoresCount,
            estado: team.estado || "activo", // Usando 'activo' en español

            // Backward compatibility
            id: team.equipoId,
            name: team.nombre,
            sport: team.subcategoriaNombre,
            members: team.jugadoresCount || 0,
            status: team.estado || "activo", // Mantenemos status para compatibilidad
            created: team.fundacion,
            categoriaId: team.subcategoriaId,
          }));
          // Actualizar el estado con los equipos formateados
          setTeams(formattedTeams);
          setFilteredTeams(formattedTeams);
        }
      } catch (error) {
        console.error("Error al filtrar equipos por subcategoría:", error);
        setError("Error al filtrar equipos");
        setSnackbar({
          open: true,
          message: "Error al filtrar equipos por subcategoría",
          severity: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Handle subcategory filter change
  useEffect(() => {
    if (categoriaSeleccionada) {
      const subcategoriaId = parseInt(categoriaSeleccionada, 10);
      const serieId = serieSeleccionada
        ? parseInt(serieSeleccionada, 10)
        : undefined;
      fetchEquiposBySubcategoria(subcategoriaId, serieId);
    } else {
      // If no category is selected, show all teams
      fetchEquipos();
    }
    // Reset search term when changing categories
    setSearchTerm("");
  }, [
    categoriaSeleccionada,
    serieSeleccionada,
    fetchEquipos,
    fetchEquiposBySubcategoria,
  ]);

  // Handle category change
  const handleCategoriaChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setCategoriaSeleccionada(value);
    setSerieSeleccionada("");
    setPage(0);

    if (value) {
      const subcategoriaId = parseInt(value, 10);
      fetchSeries(subcategoriaId);
    } else {
      setSeries([]);
    }
  };

  // Handle series change
  const handleSerieChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSerieSeleccionada(value);

    if (categoriaSeleccionada) {
      const subcategoriaId = parseInt(categoriaSeleccionada, 10);
      const serieId = value ? parseInt(value, 10) : undefined;
      fetchEquiposBySubcategoria(subcategoriaId, serieId);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle team deletion
  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete || !token) return;

    setIsDeleting(true);
    try {
      await teamService.deleteTeam(teamToDelete.equipoId);

      setSnackbar({
        open: true,
        message: "Equipo eliminado correctamente",
        severity: "success",
      });

      // Refresh the team list
      if (categoriaSeleccionada) {
        const subcategoriaId = parseInt(categoriaSeleccionada, 10);
        const serieId = serieSeleccionada
          ? parseInt(serieSeleccionada, 10)
          : undefined;
        fetchEquiposBySubcategoria(subcategoriaId, serieId);
      } else {
        fetchEquipos();
      }
    } catch (error) {
      console.error("Error al eliminar el equipo:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el equipo",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setTeamToDelete(null);
    }
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = teams.filter(
      (team) =>
        (team.nombre || "").toLowerCase().includes(value) ||
        (team.subcategoriaNombre || "").toLowerCase().includes(value) ||
        (team.serieNombre || "").toLowerCase().includes(value)
    );
    setFilteredTeams(filtered);
    setPage(0); // Reset to first page when searching
    setTotalElements(filtered.length);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredTeams.length) : 0;

  const handleRegisterSuccess = () => {
    setIsRegisterDialogOpen(false);
    fetchEquipos();
    setSnackbar({
      open: true,
      message: "Equipo(s) registrado(s) exitosamente",
      severity: "success",
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

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" component="h1">
            Equipos
          </Typography>
          <Chip
            label={`${totalElements} ${
              totalElements === 1 ? "equipo" : "equipos"
            }`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsRegisterDialogOpen(true)}
          sx={{
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
            },
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
            <FormControl size="small" sx={{ minWidth: 200 }} variant="outlined">
              <InputLabel id="categoria-label">Categoría</InputLabel>
              <Select
                labelId="categoria-label"
                id="categoria-select"
                value={categoriaSeleccionada}
                label="Categoría"
                onChange={handleCategoriaChange}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "8.5px 14px",
                  },
                }}
              >
                <MenuItem value="">
                  <em>Todas las categorías</em>
                </MenuItem>
                {categorias.map((categoria) => (
                  <MenuItem
                    key={`cat-${categoria.subcategoriaId}`}
                    value={categoria.subcategoriaId.toString()}
                  >
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{ minWidth: 200 }}
              disabled={!categoriaSeleccionada || isLoadingSeries}
            >
              <InputLabel id="serie-label">Serie</InputLabel>
              <Select
                labelId="serie-label"
                id="serie-select"
                value={serieSeleccionada}
                label="Serie"
                onChange={handleSerieChange}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "8.5px 14px",
                  },
                }}
              >
                <MenuItem value="">
                  <em>Todas las series</em>
                </MenuItem>
                {series.map((serie) => (
                  <MenuItem
                    key={`serie-${serie.serieId}`}
                    value={serie.serieId.toString()}
                  >
                    {serie.nombre}
                  </MenuItem>
                ))}
              </Select>
              {isLoadingSeries && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    right: "30px",
                    top: "50%",
                    marginTop: "-12px",
                  }}
                />
              )}
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
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Deporte
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Jugadores
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Fecha de creación
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
                    <StyledTableRow
                      key={`team-${team?.equipoId || "unknown"}-${
                        team?.nombre?.replace(/\s+/g, "-").toLowerCase() ||
                        index
                      }`}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: "primary.light",
                              color: "primary.contrastText",
                              mr: 2,
                            }}
                          >
                            <GroupIcon />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {team.nombre || team.nombre || "Equipo sin nombre"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={team.subcategoriaNombre || "Sin categoría"}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "primary.light",
                            color: "primary.dark",
                            "&:hover": {
                              bgcolor: "primary.light",
                              color: "white",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {team.jugadoresCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            team.estado === "activo" ? "Activo" : "Inactivo"
                          }
                          color={
                            team.estado === "activo" ? "success" : "default"
                          }
                          size="small"
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
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {team.fundacion
                            ? new Date(team.fundacion).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => setEditingTeam(team)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: "primary.light",
                                color: "white",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(team)}
                            disabled={isDeleting}
                            color="error"
                          >
                            {isDeleting ? (
                              <CircularProgress size={20} />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!teamToDelete}
        onClose={() => !isDeleting && setTeamToDelete(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar el equipo "
            {teamToDelete?.nombre || teamToDelete?.nombre || "este equipo"}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTeamToDelete(null)}
            disabled={isDeleting}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            color="error"
            autoFocus
            startIcon={
              isDeleting ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      {editingTeam && (
        <EditTeam
          open={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          onSuccess={() => {
            setSnackbar({
              open: true,
              message: "Equipo actualizado correctamente",
              severity: "success",
            });
            setEditingTeam(null);
            fetchEquipos(); // Refresh the team list
          }}
          teamId={editingTeam.equipoId}
        />
      )}
    </React.Fragment>
  );
};

export default Teams;
