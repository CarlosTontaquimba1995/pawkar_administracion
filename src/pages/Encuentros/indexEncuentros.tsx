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
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Clear as ClearIcon } from "@mui/icons-material";
import { Encuentro } from "@/types/encuentro.types";
import EncuentrosTable from "./EncuentrosTable";
import EncuentrosRegisterForm from "./EncuentrosRegisterForm";
import encuentroService from "@/api/encuentroService";
import subcategoriaService from "@/api/subcategoriaService";
import { Subcategoria } from "@/types/subcategoria.types";
import teamService from "@/api/teamService";
import { Team } from "@/types/team.types";
import PlaceIcon from "@mui/icons-material/Place";

interface SearchParams {
  fechaInicio: string;
  fechaFin: string;
  subcategoriaId: number;
  equipoId: number;
  estadioLugar: string;
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
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Search and pagination state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fechaInicio: "",
    fechaFin: "",
    subcategoriaId: 0,
    equipoId: 0,
    estadioLugar: "",
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
        cleanParams.fechaInicio = searchParams.fechaInicio;
      if (searchParams.fechaFin) cleanParams.fechaFin = searchParams.fechaFin;
      if (searchParams.subcategoriaId)
        cleanParams.subcategoriaId = searchParams.subcategoriaId;
      if (searchParams.equipoId) cleanParams.equipoId = searchParams.equipoId;
      if (searchParams.estadioLugar)
        cleanParams.estadioLugar = searchParams.estadioLugar;
      if (searchParams.estado) cleanParams.estado = searchParams.estado;

      const response = await encuentroService.searchEncuentrosByQuery(
        cleanParams
      );
      setEncuentros(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching encuentros:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los encuentros",
        severity: "error",
      });
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
                estado: "activo", // Default value for estado as it's required
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

  // Load subcategories on mount
  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const response = await subcategoriaService.getSubcategorias();
        const mappedSubcategorias = response.data.map((sub: Subcategoria) => ({
          id: sub.subcategoriaId,
          nombre: sub.nombre,
        }));
        setSubcategorias(mappedSubcategorias);
      } catch (error) {
        console.error("Error fetching subcategorias:", error);
      }
    };

    fetchSubcategorias();
  }, []);

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

  const handleSuccess = () => {
    fetchEncuentros();
    setSnackbar({
      open: true,
      message: "Operación realizada con éxito",
      severity: "success",
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchParams({
      fechaInicio: "",
      fechaFin: "",
      subcategoriaId: 0,
      equipoId: 0,
      estadioLugar: "",
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
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
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
                value={searchParams.equipoId}
                onChange={handleSelectChange}
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

            {/* Estadio/Lugar */}
            <TextField
              name="estadioLugar"
              label="Estadio/Lugar"
              value={searchParams.estadioLugar || ""}
              onChange={handleFilterChange}
              size="small"
              sx={{ minWidth: 200 }}
              placeholder="Filtrar por estadio/lugar"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Estado */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={searchParams.estado}
                onChange={handleSelectChange}
                label="Estado"
              >
                <MenuItem value="">
                  <em>Todos los estados</em>
                </MenuItem>
                <MenuItem value="PENDIENTE">Pendiente</MenuItem>
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
          handleSuccess();
          setShowAddForm(false);
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EncuentrosPage;
