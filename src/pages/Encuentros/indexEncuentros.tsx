import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import {
  Place as PlaceIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { Encuentro } from "@/types/encuentro.types";
import { Estadio } from "@/types/estadio.types";
import EncuentrosTable from "./EncuentrosTable";
import EncuentrosRegisterForm from "./EncuentrosRegisterForm";
import encuentroService from "@/api/encuentroService";
import subcategoriaService from "@/api/subcategoriaService";
import teamService from "@/api/teamService";
import estadioService from "@/api/estadioService";
import { Team } from "@/types/team.types";

interface SearchParams {
  fechaInicio: string;
  fechaFin: string;
  subcategoriaId: number;
  equipoId: number;
  estadioId: number;
  estado: string;
  page: number;
  size: number;
  [key: string]: string | number | undefined; // Allow undefined in the index signature
}

const EncuentrosPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [encuentros, setEncuentros] = useState<Encuentro[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [subcategorias, setSubcategorias] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Search and pagination state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fechaInicio: "",
    fechaFin: "",
    subcategoriaId: 0,
    equipoId: 0,
    estadioId: 0,
    estado: "",
    page: 0,
    size: 10,
  });

  const fetchEncuentros = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const cleanParams: Record<string, any> = {
        page: searchParams.page,
        size: searchParams.size,
      };

      if (searchParams.fechaInicio)
        cleanParams.fechaInicio = `${searchParams.fechaInicio}T00:00:00`;
      if (searchParams.fechaFin)
        cleanParams.fechaFin = `${searchParams.fechaFin}T23:59:59`;
      if (searchParams.subcategoriaId)
        cleanParams.subcategoriaId = searchParams.subcategoriaId;
      if (searchParams.equipoId) cleanParams.equipoId = searchParams.equipoId;
      if (searchParams.estadioId) cleanParams.estadioId = searchParams.estadioId;
      if (searchParams.estado) cleanParams.estado = searchParams.estado;

      const response = await encuentroService.searchEncuentrosByQuery(
        cleanParams
      );
      setEncuentros(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching encuentros:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, token]);

  // Load teams when subcategory changes
  useEffect(() => {
    const loadTeams = async () => {
      if (searchParams.subcategoriaId > 0) {
        try {
          setLoadingTeams(true);
          const response = await teamService.getTeamsBySubcategoria(
            searchParams.subcategoriaId
          );

          // Map the response to match the expected format
          const mappedTeams = Array.isArray(response.data)
            ? response.data.map((team) => ({
                equipoId: team.equipoId,
                nombre: team.nombre,
                subcategoriaId: team.subcategoriaId,
                subcategoriaNombre: team.subcategoriaNombre,
                serieId: team.serieId,
                serieNombre: team.serieNombre,
                fundacion: team.fundacion,
                jugadoresCount: team.jugadoresCount,
                estado: "activo",
              }))
            : [];

          setTeams(mappedTeams);
        } catch (error) {
          console.error("Error loading teams:", error);
          setTeams([]);
        } finally {
          setLoadingTeams(false);
        }
      } else {
        setTeams([]);
      }
    };

    loadTeams();
  }, [searchParams.subcategoriaId]);

  // Fetch subcategorias
  const fetchSubcategorias = useCallback(async () => {
    try {
      const response = await subcategoriaService.getSubcategorias();
      const mappedSubcategorias = Array.isArray(response.data)
        ? response.data.map((sub: any) => ({
            id: sub.subcategoriaId,
            nombre: sub.nombre,
          }))
        : [];
      setSubcategorias(mappedSubcategorias);
      return mappedSubcategorias;
    } catch (error) {
      console.error("Error fetching subcategorias:", error);
      return [];
    }
  }, []);

  // Fetch estadios
  const fetchEstadios = useCallback(async () => {
    try {
      const data = await estadioService.getAllEstadios();
      setEstadios(data.data);
    } catch (error) {
      console.error("Error fetching estadios:", error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchSubcategorias();
      await fetchEstadios();
    };
    loadInitialData();
  }, [fetchEstadios, fetchSubcategorias]);

  // Fetch encuentros when search params change
  useEffect(() => {
    if (searchParams.subcategoriaId !== 0 || !searchParams.subcategoriaId) {
      fetchEncuentros();
    }
  }, [searchParams, fetchEncuentros]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      size: parseInt(event.target.value, 10),
    }));
  };

  const handleFilterChange = (
    e: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: string | number }
    >
  ) => {
    const { name, value } = e.target;
    if (!name) return;

    setSearchParams((prev) => {
      const updates: Partial<SearchParams> = {
        ...prev,
        [name]: value as string | number,
      };
      if (name !== "page") {
        updates.page = 0;
      }
      return {
        ...prev,
        ...updates,
      } as SearchParams;
    });
  };

  const handleSelectChange = (event: SelectChangeEvent<number | string>) => {
    const { name, value } = event.target as {
      name: keyof SearchParams;
      value: unknown;
    };
    if (!name) return;

    setSearchParams((prev: SearchParams) => {
      const updates: Partial<SearchParams> = {
        ...prev,
        page: 0, // Reset to first page (0-based index) when filters change
      };

      // Handle number fields
      if (name === "subcategoriaId" || name === "equipoId") {
        const numericValue = value === "" ? 0 : Number(value);
        updates[name] = numericValue;

        // When selecting a team, make sure subcategoriaId is included if it exists
        if (name === "equipoId" && prev.subcategoriaId) {
          updates.subcategoriaId = prev.subcategoriaId;
        }
      }
      // Handle string fields
      else if (name === "estado" || name === "estadioLugar") {
        updates[name] = String(value);
      }

      // Reset equipoId when subcategoriaId changes
      if (name === "subcategoriaId") {
        updates.equipoId = 0;
      }

      return { ...prev, ...updates };
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchParams({
      fechaInicio: "",
      fechaFin: "",
      subcategoriaId: 0,
      equipoId: 0,
      estadioId: 0,
      estado: "",
      page: 0,
      size: searchParams.size,
    });
    setTeams([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          Gestión de Encuentros
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          sx={{
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
            },
          }}
        >
          Nuevo Encuentro
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {/* Fecha Inicio */}
            <TextField
              label="Fecha Inicio"
              type="date"
              name="fechaInicio"
              value={searchParams.fechaInicio}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />

            {/* Fecha Fin */}
            <TextField
              label="Fecha Fin"
              type="date"
              name="fechaFin"
              value={searchParams.fechaFin}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />

            {/* Subcategoría */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Subcategoría</InputLabel>
              <Select
                name="subcategoriaId"
                value={searchParams.subcategoriaId}
                onChange={handleSelectChange}
                label="Subcategoría"
              >
                <MenuItem value={0}>
                  <em>Todas las categorías</em>
                </MenuItem>
                {subcategorias.map((sub) => (
                  <MenuItem key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Equipo */}
            <FormControl
              size="small"
              sx={{ minWidth: 200 }}
              disabled={!searchParams.subcategoriaId}
            >
              <InputLabel>Equipo</InputLabel>
              <Select
                name="equipoId"
                value={searchParams.equipoId ?? 0}
                onChange={(e) => {
                  const equipoId = Number(e.target.value) || 0;
                  setSearchParams((prev) => ({
                    ...prev,
                    equipoId,
                    page: 0, // Reset to first page
                  }));
                }}
                label="Equipo"
                disabled={!searchParams.subcategoriaId || loadingTeams}
              >
                <MenuItem value={0}>
                  <em>Todos los equipos</em>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.equipoId} value={team.equipoId}>
                    {team.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Estadio */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Estadio</InputLabel>
              <Select
                name="estadioId"
                value={searchParams.estadioId || 0}
                onChange={(e) => {
                  setSearchParams((prev) => ({
                    ...prev,
                    estadioId: Number(e.target.value),
                    page: 0, // Reset to first page
                  }));
                }}
                label="Estadio"
                startAdornment={
                  <InputAdornment position="start">
                    <PlaceIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value={0}>
                  <em>Todos los estadios</em>
                </MenuItem>
                {estadios.map((estadio) => (
                  <MenuItem key={estadio.id} value={estadio.id}>
                    {estadio.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Estado */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={searchParams.estado || "TODOS"}
                onChange={(e) => {
                  setSearchParams((prev) => ({
                    ...prev,
                    estado:
                      e.target.value === "TODOS"
                        ? ""
                        : (e.target.value as string),
                    page: 0, // Reset to first page
                  }));
                }}
                label="Estado"
              >
                <MenuItem value="TODOS">
                  <em>Todos los estados</em>
                </MenuItem>
                <MenuItem value="PROGRAMADO">Programado</MenuItem>
                <MenuItem value="EN_JUEGO">En juego</MenuItem>
                <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                <MenuItem value="CANCELADO">Cancelado</MenuItem>
              </Select>
            </FormControl>

            {/* Clear Filters Button */}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleClearFilters}
              size="small"
              startIcon={<ClearIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                height: "40px",
                whiteSpace: "nowrap",
                alignSelf: "flex-end",
                mb: 1,
              }}
            >
              Limpiar
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <EncuentrosTable
          encuentros={encuentros}
          loading={loading}
          onRefresh={fetchEncuentros}
        />

        <TablePagination
          component="div"
          count={totalElements}
          page={searchParams.page}
          onPageChange={handleChangePage}
          rowsPerPage={searchParams.size}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Box>

      <EncuentrosRegisterForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          fetchEstadios();
          fetchEncuentros();
        }}
        estadios={estadios}
      />
    </Box>
  );
};

export default EncuentrosPage;
