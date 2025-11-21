import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Tooltip,
  Avatar,
  Chip,
  Typography,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  Snackbar,
  Alert,
} from "@mui/material";
import DataTable, { Column } from "@/components/common/DataTable/DataTable";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import teamService from "@/api/teamService";
import subcategoriaService from "@/api/subcategoriaService";
import categoriaService from "@/api/categoriaService";
import serieService from "@/api/serieService";
import { Team } from "@/types/team.types";
import { Subcategoria } from "@/types/subcategoria.types";
import TeamRosterDialog from "./components/TeamRosterDialog";

type TeamWithDetails = Team & {
  subcategoriaNombre?: string;
  serieNombre?: string;
  jugadoresCount?: number;
};

interface TeamTableProps {
  refreshKey: number;
  onEdit: (team: Team) => void;
  onRefresh: () => void;
}

const TeamTable: React.FC<TeamTableProps> = ({
  refreshKey,
  onEdit,
  onRefresh,
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Table state
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [_, setTotalElements] = useState(0);

  // Filter states
  const [categorias, setCategorias] = useState<Subcategoria[]>([]);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [teamToViewRoster, setTeamToViewRoster] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const [series, setSeries] = useState<
    Array<{ serieId: number; nombre: string }>
  >([]);
  const [serieSeleccionada, setSerieSeleccionada] = useState<string>("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Check if any filter is active
  const isFilterActive = useMemo(() => {
    return !!categoriaSeleccionada || !!serieSeleccionada || !!searchTerm;
  }, [categoriaSeleccionada, serieSeleccionada, searchTerm]);

  // Fetch teams with filters
  const fetchTeams = useCallback(async () => {
    if (!token) {
      navigate("/iniciar-sesiongin");
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
        // First, get the DEPORTES category by its mnemonic
        const categoriaResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );

        if (categoriaResponse.success && categoriaResponse.data) {
          // Then get subcategories for the DEPORTES category
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(
              categoriaResponse.data.categoriaId
            );

          if (subcategoriasResponse.success) {
            setCategorias(subcategoriasResponse.data || []);
          } else {
            console.error(
              "Error loading subcategories:",
              subcategoriasResponse.message || "Unknown error"
            );
          }
        } else {
          console.error(
            "Error loading DEPORTES category:",
            categoriaResponse.message || "Unknown error"
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

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setTeamToDelete(null);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
  };

  const handleViewRoster = (team: Team) => {
    setTeamToViewRoster({
      id: team.equipoId,
      name: team.nombre,
    });
  };

  const handleCloseRosterDialog = () => {
    setTeamToViewRoster(null);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      const response = await teamService.deleteTeam(teamToDelete.equipoId || 0);
      setSnackbar({
        open: true,
        message: response.message || "Equipo eliminado",
        severity: "success",
      });
      onRefresh(); // Refresh the parent component
    } catch (error) {
      console.error("Error deleting team:", error);
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

  // Define table columns
  const columns: Column[] = useMemo(
    () => [
      {
        id: "nombre",
        label: "Equipo",
        format: (value: string, row: TeamWithDetails) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={`/team-logos/${row.nombre
                ?.toLowerCase()
                .replace(/\s+/g, "-")}.png`}
              alt={row.nombre}
              sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
            >
              {row.nombre?.charAt(0) || "T"}
            </Avatar>
            <Typography variant="body2" fontWeight={500}>
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: "subcategoriaNombre",
        label: "Categoría",
        hideOnMobile: true,
      },
      {
        id: "serieNombre",
        label: "Serie",
        hideOnMobile: true,
      },
      {
        id: "jugadoresCount",
        label: "Jugadores",
        align: "center" as const,
        format: (value: number) => (
          <Chip label={value || 0} size="small" variant="outlined" />
        ),
      },
      {
        id: "actions",
        label: "Acciones",
        align: "right" as const,
        format: (_: unknown, row: TeamWithDetails) => (
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver plantilla">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRoster(row);
                }}
              >
                <PeopleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [handleViewRoster, handleDeleteClick, onEdit]
  );

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box mb={3}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          flexWrap="wrap"
          alignItems={{ xs: "stretch", sm: "center" }}
          width="100%"
        >
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
              sx: {
                minWidth: { xs: "100%", sm: 250 },
                width: { xs: "100%", sm: "auto" },
              },
            }}
          />

          {/* Category Filter */}
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 200 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
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
            sx={{
              minWidth: { xs: "100%", sm: 200 },
              width: { xs: "100%", sm: "auto" },
            }}
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
              fullWidth
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                height: "40px",
                whiteSpace: "nowrap",
                alignSelf: { xs: "stretch", sm: "center" },
                mb: 1,
                mt: { xs: 1, sm: 0 },
                width: { xs: "100%", sm: "auto" },
                "@media (min-width: 600px)": {
                  width: "auto",
                  alignSelf: "center",
                },
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <Box sx={{ flex: 1, mb: 3 }}>
        <DataTable
          columns={columns}
          data={filteredTeams}
          loading={isLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={filteredTeams.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={(event) => handleChangeRowsPerPage(event)}
          onRowClick={onEdit}
          emptyMessage="No se encontraron equipos"
          hover
          stickyHeader
        />
      </Box>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={teamToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Equipo</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar al equipo {teamToDelete?.nombre}?
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

      {/* Team Roster Dialog */}
      {teamToViewRoster && (
        <TeamRosterDialog
          open={!!teamToViewRoster}
          onClose={handleCloseRosterDialog}
          teamId={teamToViewRoster.id}
          teamName={teamToViewRoster.name}
        />
      )}
    </Box>
  );
};

export default TeamTable;
