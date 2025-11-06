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
  TextField,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { TablaPosicion } from "@/types/tablaPosicion.types";
import type { Serie } from "@/types/serie.types";
import type { Subcategoria } from "@/types/subcategoria.types";
import tablaPosicionService from "@/api/tablaPosicionService";
import categoriaService from "@/api/categoriaService";
import subcategoriaService from "@/api/subcategoriaService";
import serieService from "@/api/serieService";

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
  const [searchTerm, setSearchTerm] = useState("");

  // State for categories and series
  const [categorias, setCategorias] = useState<
    Array<{ subcategoriaId: number; nombre: string; categoriaId?: number }>
  >([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const [series, setSeries] = useState<Serie[]>([]);
  const [serieSeleccionada, setSerieSeleccionada] = useState<string>("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);

  // Filter positions based on search term and filters
  const filteredData = React.useMemo(() => {
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

      return matchesSearch && matchesCategoria && matchesSerie;
    });
  }, [posiciones, searchTerm, categoriaSeleccionada, serieSeleccionada]);

  // Get paginated data
  const paginatedData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Fetch data
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
        } else if (response && typeof response === "object") {
          // Handle paginated response
          const paginatedResponse = response as {
            content: TablaPosicion[];
            totalElements: number;
          };
          setPosiciones(paginatedResponse.content || []);
        }
      } catch (error) {
        console.error("Error al cargar posiciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey, page, rowsPerPage, categoriaSeleccionada, serieSeleccionada]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        // First, get the category with nemonico 'DEPORTES'
        const categoriaResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );

        if (categoriaResponse?.success && categoriaResponse.data) {
          const categoriaId = categoriaResponse.data.categoriaId;

          // Then get subcategories for this category
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(categoriaId);

          if (subcategoriasResponse?.success && subcategoriasResponse.data) {
            // Map the response to match the expected format for categorias state
            const categoriasData = subcategoriasResponse.data.map(
              (subcat: Subcategoria) => ({
                subcategoriaId: subcat.subcategoriaId,
                nombre: subcat.nombre,
                categoriaId: subcat.categoriaId,
              })
            );

            setCategorias(categoriasData);
          }
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        // You might want to show a user-friendly error message here
      }
    };

    fetchCategorias();
  }, [categoriaSeleccionada]);

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
        console.error("Error al cargar series:", error);
        setSeries([]);
      } finally {
        setIsLoadingSeries(false);
      }
    };

    fetchSeries();
  }, [categoriaSeleccionada]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  // Fetch series for a category
  const fetchSeries = async (subcategoriaId: number) => {
    try {
      const response = await serieService.getSeriesBySubcategoria(
        subcategoriaId
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Error al cargar series:", error);
    } finally {
      setIsLoadingSeries(false);
    }
  };

  // Handle category change
  const handleCategoriaChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCategoriaSeleccionada(value);
    setPage(0); // Reset to first page when filters change

    // Reset serie selection when category changes
    setSerieSeleccionada("");

    // Fetch series for the selected category
    if (value) {
      fetchSeries(parseInt(value));
    } else {
      setSeries([]);
    }
  };

  // Handle series change
  const handleSerieChange = (event: SelectChangeEvent) => {
    setSerieSeleccionada(event.target.value);
    setPage(0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setCategoriaSeleccionada("");
    setSerieSeleccionada("");
    setPage(0);
  };

  // Check if any filter is active
  const isFilterActive = Boolean(
    categoriaSeleccionada || serieSeleccionada || searchTerm
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
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
      {/* Search and Filter Bar */}
      <Box mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap">
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
          {isFilterActive && (
            <Tooltip title="Limpiar filtros">
              <IconButton onClick={clearFilters} size="small">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

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
            {filteredData.length > 0 ? (
              paginatedData.map((posicion: TablaPosicion) => (
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
                  <TableCell align="center">{posicion.golesEnContra}</TableCell>
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
                        handleDelete(posicion.subcategoriaId, posicion.equipoId)
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
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredData.length}
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

export default TablaPosicionesTable;
