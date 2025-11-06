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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { TablaPosicion, SearchParams } from "@/types/tablaPosicion.types";
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
  const [filteredPosiciones, setFilteredPosiciones] = useState<TablaPosicion[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<
    Omit<SearchParams, "page" | "size" | "sort">
  >({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await tablaPosicionService.search({
          ...filters,
          page,
          size: rowsPerPage,
        });
        console.log(response);

        if (Array.isArray(response)) {
          setPosiciones(response);
          setFilteredPosiciones(response);
          setTotalItems(response.length);
        } else {
          // Handle paginated response
          setPosiciones(response || []);
          setFilteredPosiciones(response || []);
          setTotalItems(response || 0);
        }
      } catch (error) {
        console.error("Error al cargar posiciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey, filters, page, rowsPerPage]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setFilteredPosiciones(posiciones);
      setTotalItems(posiciones.length);
      setPage(0);
      return;
    }

    const filtered = posiciones.filter(
      (posicion) =>
        (posicion.equipoNombre || "").toLowerCase().includes(value) ||
        (posicion.serieNombre || "").toLowerCase().includes(value) ||
        (posicion.categoriaNombre || "").toLowerCase().includes(value)
    );

    setFilteredPosiciones(filtered);
    setTotalItems(filtered.length);
    setPage(0);
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));

    // Reset to first page when filters change
    if (page !== 0) {
      setPage(0);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setPage(0);
  };

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

  // Check if any filter is active
  const isFilterActive = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box mb={3}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nombre de equipo..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchTerm("");
                        setFilteredPosiciones(posiciones);
                        setTotalItems(posiciones.length);
                      }}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box>
            <Tooltip
              title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            >
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={isFilterActive ? "primary" : "default"}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            {isFilterActive && (
              <Tooltip title="Limpiar filtros">
                <IconButton onClick={clearFilters} size="small">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Advanced Filters */}
        {showFilters && (
          <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="ID de Categoría"
                  type="number"
                  value={filters.categoriaId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "categoriaId",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  InputProps={{
                    endAdornment: filters.categoriaId && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleFilterChange("categoriaId", "")}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="ID de Subcategoría"
                  type="number"
                  value={filters.subcategoriaId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "subcategoriaId",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  InputProps={{
                    endAdornment: filters.subcategoriaId && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleFilterChange("subcategoriaId", "")
                          }
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="ID de Equipo"
                  type="number"
                  value={filters.equipoId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "equipoId",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  InputProps={{
                    endAdornment: filters.equipoId && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleFilterChange("equipoId", "")}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="ID de Serie"
                  type="number"
                  value={filters.serieId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "serieId",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  InputProps={{
                    endAdornment: filters.serieId && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleFilterChange("serieId", "")}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
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
            {filteredPosiciones.length > 0 ? (
              filteredPosiciones
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
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredPosiciones.length}
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
