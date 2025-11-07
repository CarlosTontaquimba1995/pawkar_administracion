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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Paper,
  Tooltip,
  Avatar,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import teamService from "@/api/teamService";
import subcategoriaService from "@/api/subcategoriaService";
import serieService from "@/api/serieService";
import { Team } from "@/types/team.types";
import { Subcategoria } from "@/types/subcategoria.types";

interface TeamTableProps {
  refreshKey: number;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onRefresh: () => void;
}

const TeamTable: React.FC<TeamTableProps> = ({
  refreshKey,
  onEdit,
  onDelete,
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Table state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [_, setTotalElements] = useState(0);

  // Filter states
  const [categorias, setCategorias] = useState<Subcategoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const [series, setSeries] = useState<
    Array<{ serieId: number; nombre: string }>
  >([]);
  const [serieSeleccionada, setSerieSeleccionada] = useState<string>("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return !!categoriaSeleccionada || !!serieSeleccionada || !!searchTerm;
  }, [categoriaSeleccionada, serieSeleccionada, searchTerm]);

  // Fetch teams with filters
  const fetchTeams = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      let teamsData: Team[] = [];
      let total = 0;

      if (categoriaSeleccionada) {
        // For getTeamsBySubcategoria which returns a direct array
        response = await teamService.getTeamsBySubcategoria(
          parseInt(categoriaSeleccionada),
          {
            page,
            size: rowsPerPage,
            serieId: serieSeleccionada
              ? parseInt(serieSeleccionada)
              : undefined,
            search: searchTerm || undefined,
          }
        );

        if (response.success) {
          teamsData = Array.isArray(response.data) ? response.data : [];
          total = teamsData.length;
        }
      } else {
        // For getTeams which returns a paginated response
        response = await teamService.getTeams({
          page,
          size: rowsPerPage,
          search: searchTerm || undefined,
        });

        if (response.success && response.data) {
          teamsData = response.data.content || [];
          total = response.data.totalElements || 0;
        }
      }

      setTeams(teamsData);
      setTotalElements(total);

      if (!response.success) {
        console.error(
          "Error loading teams:",
          response.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    token,
    page,
    rowsPerPage,
    categoriaSeleccionada,
    serieSeleccionada,
    searchTerm,
    navigate,
  ]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await subcategoriaService.getCategories();
        if (response.success) {
          setCategorias(response.data || []);
        } else {
          console.error(
            "Error loading categories:",
            response.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    fetchCategorias();
  }, []);

  // Fetch series when category changes
  useEffect(() => {
    const fetchSeries = async () => {
      if (!categoriaSeleccionada) {
        setSeries([]);
        setSerieSeleccionada("");
        return;
      }

      setIsLoadingSeries(true);
      try {
        const seriesData = await serieService.getSeriesBySubcategoria(
          Number(categoriaSeleccionada)
        );
        const formattedSeries = (seriesData.data || []).map((serie: any) => ({
          serieId: serie.serieId,
          nombre: serie.nombreSerie || serie.nombre || "",
        }));
        setSeries(formattedSeries);
      } catch (error) {
        console.error("Error loading series:", error);
        setSeries([]);
      } finally {
        setIsLoadingSeries(false);
      }
    };

    fetchSeries();
  }, [categoriaSeleccionada]);

  // Refresh teams when dependencies change
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams, refreshKey]);

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

  const handleCategoriaChange = (event: SelectChangeEvent) => {
    setCategoriaSeleccionada(event.target.value);
    setPage(0);
  };

  const handleSerieChange = (event: SelectChangeEvent) => {
    setSerieSeleccionada(event.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setCategoriaSeleccionada("");
    setSerieSeleccionada("");
    setSearchTerm("");
    setPage(0);
  };

  // Filter teams based on search term
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        !searchTerm ||
        team.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.subcategoriaNombre?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (team.serieNombre?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesCategoria =
        !categoriaSeleccionada ||
        team.subcategoriaId?.toString() === categoriaSeleccionada;

      const matchesSerie =
        !serieSeleccionada || team.serieId?.toString() === serieSeleccionada;

      return matchesSearch && matchesCategoria && matchesSerie;
    });
  }, [teams, searchTerm, categoriaSeleccionada, serieSeleccionada]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredTeams.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTeams, page, rowsPerPage]);

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar equipos..."
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
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { minWidth: 250 },
            }}
          />

          {/* Category Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="categoria-label">Categoría</InputLabel>
            <Select
              labelId="categoria-label"
              id="categoria-select"
              value={categoriaSeleccionada}
              label="Categoría"
              onChange={handleCategoriaChange}
              sx={{ "& .MuiSelect-select": { padding: "8.5px 14px" } }}
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

          {/* Series Filter */}
          <FormControl
            size="small"
            sx={{ minWidth: 200 }}
            disabled={!categoriaSeleccionada || isLoadingSeries}
          >
            <InputLabel id="serie-label">
              {isLoadingSeries ? "Cargando series..." : "Serie"}
            </InputLabel>
            <Select
              labelId="serie-label"
              id="serie-select"
              value={serieSeleccionada}
              label={isLoadingSeries ? "Cargando series..." : "Serie"}
              onChange={handleSerieChange}
              sx={{ "& .MuiSelect-select": { padding: "8.5px 14px" } }}
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

          {/* Clear Filters Button */}
          {isFilterActive && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                height: "40px",
                whiteSpace: "nowrap",
                alignSelf: "flex-end",
                mb: 1,
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ flex: 1, mb: 3 }}>
        <Table
          size="small"
          sx={{ minWidth: 650 }}
          aria-label="tabla de equipos"
        >
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Equipo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Serie</TableCell>
              <TableCell align="center">Jugadores</TableCell>
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
            ) : filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron equipos
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((team, index) => (
                <TableRow
                  key={`${team.equipoId}-${index}`}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1 + page * rowsPerPage}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        src={`/team-logos/${team.nombre
                          ?.toLowerCase()
                          .replace(/\s+/g, "-")}.png`}
                        alt={team.nombre}
                        sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                      >
                        {team.nombre?.charAt(0) || "T"}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {team.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={team.subcategoriaNombre}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{team.serieNombre || "-"}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={team.jugadoresCount || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={team.estado === "activo" ? "Activo" : "Inactivo"}
                      color={team.estado === "activo" ? "success" : "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(team)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(team)}
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
        count={filteredTeams.length}
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
    </Box>
  );
};

export default TeamTable;
