import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Button,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { TablaPosicion } from "@/types/tablaPosicion.types";
import type { Serie } from "@/types/serie.types";
import type { Subcategoria } from "@/types/subcategoria.types";
import DataTable, { Column } from "@/components/common/DataTable/DataTable";
import tablaPosicionService from "@/api/tablaPosicionService";
import categoriaService from "@/api/categoriaService";
import subcategoriaService from "@/api/subcategoriaService";
import serieService from "@/api/serieService";
import teamService from "@/api/teamService";

interface TablaPosicionesTableProps {
  refreshKey: number;
  onEdit: (posicion: TablaPosicion) => void;
  onRefresh: () => void;
}

const TablaPosicionesTable: React.FC<TablaPosicionesTableProps> = ({
  refreshKey,
  onEdit,
}) => {
  // State for table data and pagination
  const [posiciones, setPosiciones] = useState<TablaPosicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [categorias, setCategorias] = useState<
    Array<{
      subcategoriaId: number;
      nombre: string;
      categoriaId?: number;
    }>
  >([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");

  const [series, setSeries] = useState<Serie[]>([]);
  const [serieSeleccionada, setSerieSeleccionada] = useState<string>("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);

  const [teams, setTeams] = useState<
    Array<{
      equipoId: number;
      nombre: string;
    }>
  >([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string>("");
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Fetch positions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await tablaPosicionService.search({
          subcategoriaId: categoriaSeleccionada
            ? parseInt(categoriaSeleccionada)
            : undefined,
          serieId: serieSeleccionada ? parseInt(serieSeleccionada) : undefined,
          page,
          size: rowsPerPage,
        });

        if (Array.isArray(response)) {
          setPosiciones(response);
        } else if (response) {
          setPosiciones(response);
        }
      } catch (error) {
        console.error("Error loading positions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey, page, rowsPerPage, categoriaSeleccionada, serieSeleccionada]);

  // Fetch categories
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriaResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );
        if (categoriaResponse?.success && categoriaResponse.data) {
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(
              categoriaResponse.data.categoriaId
            );

          if (subcategoriasResponse?.success && subcategoriasResponse.data) {
            setCategorias(
              subcategoriasResponse.data.map((subcat: Subcategoria) => ({
                subcategoriaId: subcat.subcategoriaId,
                nombre: subcat.nombre,
                categoriaId: subcat.categoriaId,
              }))
            );
          }
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
        return;
      }

      try {
        setIsLoadingSeries(true);
        const response = await serieService.getSeriesBySubcategoria(
          Number(categoriaSeleccionada)
        );

        if (response.success && response.data) {
          setSeries(response.data);
        } else {
          setSeries([]);
        }
      } catch (error) {
        console.error("Error loading series:", error);
        setSeries([]);
      } finally {
        setIsLoadingSeries(false);
      }
    };

    fetchSeries();
  }, [categoriaSeleccionada]);

  // Fetch teams when series changes
  useEffect(() => {
    const fetchTeams = async () => {
      if (!serieSeleccionada) {
        setTeams([]);
        setEquipoSeleccionado("");
        return;
      }

      try {
        setIsLoadingTeams(true);
        const response = await teamService.getTeamsBySerie(
          Number(serieSeleccionada)
        );

        if (response.success && response.data) {
          const teamsData = response.data.map((team: any) => ({
            equipoId: team.equipoId,
            nombre: team.nombre,
          }));
          setTeams(teamsData);
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error("Error loading teams:", error);
        setTeams([]);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [serieSeleccionada]);

  const theme = useTheme();

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    return posiciones.filter((posicion) => {
      const matchesSearch =
        !searchTerm ||
        (posicion.equipoNombre?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (posicion.serieNombre?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (posicion.categoriaNombre?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesCategoria =
        !categoriaSeleccionada ||
        posicion.subcategoriaId?.toString() === categoriaSeleccionada;

      const matchesSerie =
        !serieSeleccionada ||
        posicion.serieId?.toString() === serieSeleccionada;

      const matchesEquipo =
        !equipoSeleccionado ||
        posicion.equipoId?.toString() === equipoSeleccionado;

      return matchesSearch && matchesCategoria && matchesSerie && matchesEquipo;
    });
  }, [
    posiciones,
    searchTerm,
    categoriaSeleccionada,
    serieSeleccionada,
    equipoSeleccionado,
  ]);

  // Define columns for DataTable
  const columns: Column[] = [
    {
      id: "posicion",
      label: "#",
      align: "center",
      minWidth: 60,
      format: (_, row) => {
        const rowIndex = posiciones.findIndex(
          (p) => p.posicion === row.posicion
        );
        return (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor:
                rowIndex < 3
                  ? rowIndex === 0
                    ? "gold"
                    : rowIndex === 1
                    ? "silver"
                    : "#cd7f32"
                  : theme.palette.grey[300],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <Typography variant="body2" color="text.primary">
              {rowIndex + 1}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: "equipoNombre",
      label: "Equipo",
      minWidth: 200,
      format: (_, row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={`/team-logos/${row.equipoNombre
              ?.toLowerCase()
              .replace(/\s+/g, "-")}.png`}
            alt={row.equipoNombre}
            sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
          >
            {row.equipoNombre?.charAt(0) || "T"}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {row.equipoNombre}
          </Typography>
        </Box>
      ),
    },
    {
      id: "puntos",
      label: "PTS",
      align: "right",
      minWidth: 70,
      format: (value) => (
        <Typography fontWeight="bold" color="primary">
          {value || 0}
        </Typography>
      ),
    },
    {
      id: "partidosJugados",
      label: "PJ",
      align: "center",
      minWidth: 50,
      hideOnMobile: true,
    },
    {
      id: "victorias",
      label: "PG",
      align: "center",
      minWidth: 50,
      hideOnMobile: true,
      format: (value) => (
        <Chip
          label={value || 0}
          size="small"
          color="success"
          variant="outlined"
          sx={{ minWidth: 30 }}
        />
      ),
    },
    {
      id: "empates",
      label: "PE",
      align: "center",
      minWidth: 50,
      hideOnMobile: true,
      format: (value) => (
        <Chip
          label={value || 0}
          size="small"
          color="warning"
          variant="outlined"
          sx={{ minWidth: 30 }}
        />
      ),
    },
    {
      id: "derrotas",
      label: "PP",
      align: "center",
      minWidth: 50,
      hideOnMobile: true,
      format: (value) => (
        <Chip
          label={value || 0}
          size="small"
          color="error"
          variant="outlined"
          sx={{ minWidth: 30 }}
        />
      ),
    },
    {
      id: "golesAFavor",
      label: "GF",
      align: "center",
      minWidth: 50,
      hideOnMobile: true,
    },
    {
      id: "golesEnContra",
      label: "GC",
      align: "center",
      minWidth: 50,
      hideOnMobile: true,
    },
    {
      id: "diferenciaGoles",
      label: "+/-",
      align: "center",
      minWidth: 70,
      format: (value) => (
        <Typography
          sx={{
            color: (value || 0) >= 0 ? "success.main" : "error.main",
            fontWeight: "bold",
          }}
        >
          {(value || 0) > 0 ? "+" : ""}
          {value || 0}
        </Typography>
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "center",
      minWidth: 80,
      format: (_, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          color="primary"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleCategoriaChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCategoriaSeleccionada(value);
    setSerieSeleccionada("");
    setEquipoSeleccionado("");
    setPage(0);
  };

  const handleSerieChange = (event: SelectChangeEvent) => {
    setSerieSeleccionada(event.target.value);
    setEquipoSeleccionado("");
    setPage(0);
  };

  const handleEquipoChange = (event: SelectChangeEvent) => {
    setEquipoSeleccionado(event.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setCategoriaSeleccionada("");
    setSerieSeleccionada("");
    setEquipoSeleccionado("");
    setSearchTerm("");
    setPage(0);
  };

  const isFilterActive = () => {
    return (
      !!categoriaSeleccionada ||
      !!serieSeleccionada ||
      !!equipoSeleccionado ||
      !!searchTerm
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
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
      {/* Search and Filter Bar */}
      <Box mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleSearch("")}>
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
                  {serie.nombreSerie}
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

          {/* Team Filter */}
          <FormControl
            size="small"
            sx={{ minWidth: 200 }}
            disabled={!serieSeleccionada || isLoadingTeams}
          >
            <InputLabel id="equipo-label">
              {isLoadingTeams ? "Cargando equipos..." : "Equipo"}
            </InputLabel>
            <Select
              labelId="equipo-label"
              id="equipo-select"
              value={equipoSeleccionado}
              label={isLoadingTeams ? "Cargando equipos..." : "Equipo"}
              onChange={handleEquipoChange}
              sx={{ "& .MuiSelect-select": { padding: "8.5px 14px" } }}
            >
              <MenuItem value="">
                <em>Todos los equipos</em>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem
                  key={`team-${team.equipoId}`}
                  value={team.equipoId.toString()}
                >
                  {team.nombre}
                </MenuItem>
              ))}
            </Select>
            {isLoadingTeams && (
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
          {isFilterActive() && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
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

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={filteredData.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRowClick={(row) => onEdit(row)}
        emptyMessage="No se encontraron posiciones"
      />
    </Box>
  );
};

export default TablaPosicionesTable;
