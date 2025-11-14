import React, { useState, useEffect } from "react";
import {
  IconButton,
  TextField,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Card,
  CardContent,
  SelectChangeEvent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Gavel as GavelIcon,
} from "@mui/icons-material";
import { Encuentro } from "@/types/encuentro.types";
import { Estadio } from "@/types/estadio.types";
import { Serie } from "@/types/serie.types";
import encuentroService from "@/api/encuentroService";
import subcategoriaService from "@/api/subcategoriaService";
import estadioService from "@/api/estadioService";
import serieService from "@/api/serieService";
import { Subcategoria } from "@/types/subcategoria.types";
import { Team } from "@/types/team.types";
import teamService from "@/api/teamService";
import categoriaService from "@/api/categoriaService";
import sancionesService from "@/api/sancionesService";
import { Sancion } from "@/types/sancion.types";
import SancionDialog from "@/pages/Encuentros/SancionDialog";
import { Badge } from "@mui/material";
import plantillaService from "@/api/plantillaService";
import DataTable from "@/components/common/DataTable/DataTable";

interface EncuentrosTableProps {
  refreshKey: number;
  onEdit: (encuentro: Encuentro) => void;
  onRefresh: () => void;
}

interface SearchParams {
  fechaInicio: string;
  fechaFin: string;
  subcategoriaId: number;
  serieId: number;
  equipoId: number;
  estadioId: number;
  estado: string;
  page: number;
  size: number;
  [key: string]: string | number | undefined;
}

const EncuentrosTable: React.FC<EncuentrosTableProps> = ({
  refreshKey,
  onEdit,
  onRefresh,
}) => {
  const [encuentros, setEncuentros] = useState<Encuentro[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fechaInicio: "",
    fechaFin: "",
    subcategoriaId: 0,
    serieId: 0,
    equipoId: 0,
    estadioId: 0,
    estado: "",
    page: 0,
    size: 10,
  });

  // Helper function to format date for display in input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    // If the date already includes time, extract just the date part
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }
    return dateString;
  };

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [estadios, setEstadios] = useState<Estadio[]>([]);

  // Sanciones state
  const [sancionesDialogOpen, setSancionesDialogOpen] = useState(false);
  const [currentEncuentroId, setCurrentEncuentroId] = useState<number | null>(
    null
  );
  interface Jugador {
    id: number;
    nombre: string;
    equipoId: number;
    equipoNombre: string;
  }

  interface JugadoresPorEquipo {
    local: Jugador[];
    visitante: Jugador[];
    todos: Jugador[];
  }

  const [jugadores, setJugadores] = useState<JugadoresPorEquipo>({
    local: [],
    visitante: [],
    todos: [],
  });
  const [loadingSanciones, setLoadingSanciones] = useState(false);
  const [sancionToEdit, setSancionToEdit] = useState<Sancion | null>(null);
  const [sancionesByEncuentro, setSancionesByEncuentro] = useState<
    Record<number, Sancion[]>
  >({});
  const [_, setEquipos] = useState<Team[]>([]);
  const [filteredEquipos, setFilteredEquipos] = useState<Team[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [encuentroToDelete, setEncuentroToDelete] = useState<Encuentro | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Helper function to clean params - only include non-default values
  const getCleanParams = (params: SearchParams) => {
    const cleanParams: Record<string, string | number> = {
      page: params.page || 0,
      size: params.size || 10,
    };

    // Only add filters that have been explicitly set by the user
    if (params.fechaInicio) cleanParams.fechaInicio = params.fechaInicio;
    if (params.fechaFin) cleanParams.fechaFin = params.fechaFin;
    if (params.subcategoriaId)
      cleanParams.subcategoriaId = params.subcategoriaId;
    if (params.serieId) cleanParams.serieId = params.serieId;
    if (params.equipoId) cleanParams.equipoId = params.equipoId;
    if (params.estadioId) cleanParams.estadioId = params.estadioId;
    if (params.estado) cleanParams.estado = params.estado;

    return cleanParams;
  };

  // Fetch encuentros
  useEffect(() => {
    const fetchEncuentros = async () => {
      try {
        setLoading(true);
        const params = getCleanParams(searchParams);
        const response = await encuentroService.searchEncuentrosByQuery(params);
        setEncuentros(response.content);
        setTotalElements(response.totalElements);
      } catch (err) {
        setError("Error al cargar los encuentros");
        console.error("Error loading encuentros:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEncuentros();
  }, [searchParams, refreshKey]);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriaResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );
        const categoriaId = categoriaResponse.data?.categoriaId;
        if (categoriaId === undefined) {
          throw new Error("No se pudo obtener el ID de la categoría DEPORTES");
        }

        const [subcategoriasRes, estadiosRes] = await Promise.all([
          subcategoriaService.getSubcategoriasByCategoria(categoriaId),
          estadioService.getAllEstadios(),
        ]);

        setSubcategorias(subcategoriasRes.data);
        setEstadios(estadiosRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // En caso de error, intentamos cargar todas las subcategorías como respaldo
        try {
          const subcategoriasRes = await subcategoriaService.getSubcategorias();
          setSubcategorias(subcategoriasRes.data);
        } catch (fallbackError) {
          console.error("Error fetching all subcategories:", fallbackError);
        }
      }
    };

    fetchData();
  }, []);

  // Cargar series cuando se selecciona una subcategoría
  useEffect(() => {
    const fetchSeries = async () => {
      if (searchParams.subcategoriaId > 0) {
        try {
          const seriesRes = await serieService.getSeriesBySubcategoria(
            searchParams.subcategoriaId
          );
          setSeries(seriesRes.data);
        } catch (error) {
          console.error("Error fetching series:", error);
          setSeries([]);
        }
      } else {
        setSeries([]);
        setFilteredEquipos([]);
        setSearchParams((prev) => ({ ...prev, serieId: 0, equipoId: 0 }));
      }
    };

    fetchSeries();
  }, [searchParams.subcategoriaId]);

  // Cargar equipos cuando se selecciona una serie
  useEffect(() => {
    const fetchEquiposBySerie = async () => {
      if (searchParams.serieId > 0) {
        try {
          const equiposRes = await teamService.getTeamsBySerie(
            searchParams.serieId
          );
          setEquipos(equiposRes.data);
          setFilteredEquipos(equiposRes.data);
        } catch (error) {
          console.error("Error fetching equipos:", error);
          setFilteredEquipos([]);
        }
      } else {
        setFilteredEquipos([]);
        setSearchParams((prev) => ({ ...prev, equipoId: 0 }));
      }
    };

    if (searchParams.serieId > 0) {
      fetchEquiposBySerie();
    } else {
      setFilteredEquipos([]);
    }
  }, [searchParams.serieId]);

  const handleFilterChange = (
    e:
      | SelectChangeEvent<number | string>
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as {
      name: string;
      value: string | number;
    };

    setSearchParams((prev) => {
      const newParams = { ...prev };

      if (
        name === "subcategoriaId" ||
        name === "serieId" ||
        name === "equipoId" ||
        name === "estadioId"
      ) {
        newParams[name] = Number(value);
        // Reset dependent fields if needed
        if (name === "subcategoriaId") {
          newParams.serieId = 0;
          newParams.equipoId = 0;
        } else if (name === "serieId") {
          newParams.equipoId = 0;
        }
      } else if (name === "page" || name === "size") {
        newParams[name] = Number(value);
      } else {
        newParams[name as keyof SearchParams] = String(value);
      }

      return newParams;
    });
  };

  const handlePageChange = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Handler for DataTable component
  const handleDataTableRowsPerPageChange = (rowsPerPage: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      size: rowsPerPage,
    }));
  };

  // Handler for MUI TablePagination component
  const handleTablePaginationRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 0,
      size: parseInt(event.target.value, 10),
    }));
  };

  const handleClearFilters = () => {
    setSearchParams({
      fechaInicio: "",
      fechaFin: "",
      subcategoriaId: 0,
      serieId: 0,
      equipoId: 0,
      estadioId: 0,
      estado: "",
      page: 0,
      size: 10,
    });
  };

  const handleDeleteClick = (encuentro: Encuentro) => {
    setEncuentroToDelete(encuentro);
  };

  const handleDeleteConfirm = async () => {
    if (!encuentroToDelete || encuentroToDelete.id === undefined) {
      setError("No se puede eliminar: ID de encuentro no válido");
      return;
    }

    try {
      setIsDeleting(true);
      await encuentroService.deleteEncuentro(encuentroToDelete.id);
      onRefresh();
      setEncuentroToDelete(null);
    } catch (err) {
      setError("Error al eliminar el encuentro");
      console.error("Error deleting encuentro:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const isFilterActive = () => {
    return (
      searchParams.fechaInicio !== "" ||
      searchParams.fechaFin !== "" ||
      searchParams.subcategoriaId > 0 ||
      searchParams.serieId > 0 ||
      searchParams.equipoId > 0 ||
      searchParams.estadioId > 0 ||
      searchParams.estado !== ""
    );
  };

  // Load jugadores for sanciones
  const loadJugadores = async (
    equipoLocalId: number,
    equipoVisitanteId: number
  ) => {
    try {
      const [localResponse, visitanteResponse, equiposResponse] =
        await Promise.all([
          plantillaService.getPlantillasByEquipo(equipoLocalId),
          plantillaService.getPlantillasByEquipo(equipoVisitanteId),
          teamService.getTeams({ page: 0, size: 1000 }), // Obtener la lista de equipos para los nombres
        ]);

      // Buscar los nombres de los equipos en el array content de la respuesta paginada
      const equipoLocal = equiposResponse.data.content.find(
        (e: any) => e.equipoId === equipoLocalId
      );
      const equipoVisitante = equiposResponse.data.content.find(
        (e: any) => e.equipoId === equipoVisitanteId
      );

      const jugadoresLocal =
        localResponse.data?.map((j) => ({
          id: j.jugadorId,
          nombre: j.jugadorNombreCompleto,
          equipoId: equipoLocalId,
          equipoNombre: equipoLocal?.nombre || "Equipo Local",
        })) || [];

      const jugadoresVisitante =
        visitanteResponse.data?.map((j) => ({
          id: j.jugadorId,
          nombre: j.jugadorNombreCompleto,
          equipoId: equipoVisitanteId,
          equipoNombre: equipoVisitante?.nombre || "Equipo Visitante",
        })) || [];

      // Mantenemos los jugadores separados por equipo
      const jugadoresPorEquipo = {
        local: jugadoresLocal,
        visitante: jugadoresVisitante,
        todos: [...jugadoresLocal, ...jugadoresVisitante], // Para compatibilidad con código existente
      };

      setJugadores(jugadoresPorEquipo);
      return jugadoresPorEquipo;
    } catch (error) {
      console.error("Error cargando jugadores:", error);
      const emptyState = { local: [], visitante: [], todos: [] };
      setJugadores(emptyState);
      return emptyState;
    }
  };

  // Handle open sanciones dialog
  const handleOpenSancionesDialog = async (encuentro: Encuentro) => {
    try {
      setLoadingSanciones(true);
      setCurrentEncuentroId(encuentro.id!);

      // Cargar jugadores de ambos equipos
      if (encuentro.equipoLocalId && encuentro.equipoVisitanteId) {
        await loadJugadores(
          encuentro.equipoLocalId,
          encuentro.equipoVisitanteId
        );
      } else {
        setJugadores({
          local: [],
          visitante: [],
          todos: [],
        });
      }

      // Load existing sanciones for this encounter
      const response = await sancionesService.getSancionesByEncuentro(
        encuentro.id!
      );
      setSancionesByEncuentro((prev) => ({
        ...prev,
        [encuentro.id!]: response.data,
      }));
      setSancionesDialogOpen(true);
    } catch (error) {
      console.error("Error al cargar sanciones:", error);
      // Handle error (show notification, etc.)
    } finally {
      setLoadingSanciones(false);
    }
  };

  // Handle save sancion
  const handleSaveSancion = async (sancionData: any) => {
    try {
      setLoadingSanciones(true);

      if (sancionToEdit) {
        // Update existing sancion
        await sancionesService.updateSancion(sancionToEdit.id, sancionData);
      } else {
        // Create new sancion
        await sancionesService.createSancion({
          ...sancionData,
          encuentroId: currentEncuentroId,
        });
      }

      // Refresh sanciones
      await refreshSanciones();

      // Reset edit state
      setSancionToEdit(null);
    } catch (error) {
      console.error("Error al guardar sanción:", error);
      // Handle error (show notification, etc.)
      throw error; // Re-throw to allow the dialog to handle the error
    } finally {
      setLoadingSanciones(false);
    }
  };

  // Handle delete sancion
  const handleDeleteSancion = async (sancionId: number) => {
    try {
      setLoadingSanciones(true);
      await sancionesService.deleteSancion(sancionId);

      // Refresh sanciones after deletion
      await refreshSanciones();
    } catch (error) {
      console.error("Error al eliminar sanción:", error);
      throw error;
    } finally {
      setLoadingSanciones(false);
    }
  };

  // Refresh sanciones for current encuentro
  const refreshSanciones = async () => {
    if (currentEncuentroId) {
      const response = await sancionesService.getSancionesByEncuentro(
        currentEncuentroId
      );
      // Update sanciones in the state
      setSancionesByEncuentro((prev) => ({
        ...prev,
        [currentEncuentroId]: response.data,
      }));
    }
  };

  // Close sanciones dialog
  const handleCloseSancionesDialog = () => {
    setSancionesDialogOpen(false);
    setSancionToEdit(null);
  };

  // Add a new useEffect to load sanciones for all encuentros
  useEffect(() => {
    const loadSancionesForEncuentros = async () => {
      try {
        const sancionesMap: Record<number, Sancion[]> = {};

        // Load sanciones for each encuentro
        await Promise.all(
          encuentros.map(async (encuentro) => {
            try {
              const response = await sancionesService.getSancionesByEncuentro(
                encuentro.id!
              );
              sancionesMap[encuentro.id!] = response.data;
            } catch (error) {
              console.error(
                `Error cargando sanciones para encuentro ${encuentro.id}:`,
                error
              );
              sancionesMap[encuentro.id!] = [];
            }
          })
        );

        setSancionesByEncuentro(sancionesMap);
      } catch (error) {
        console.error("Error cargando sanciones:", error);
      }
    };

    if (encuentros.length > 0) {
      loadSancionesForEncuentros();
    }
  }, [encuentros]);

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {/* Fecha Inicio */}
            <TextField
              label="Fecha Inicio"
              type="date"
              name="fechaInicio"
              value={formatDateForInput(searchParams.fechaInicio)}
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
              value={formatDateForInput(searchParams.fechaFin)}
              onChange={handleFilterChange}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />

            {/* Subcategoría */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="subcategoria-label">Subcategoría</InputLabel>
              <Select
                labelId="subcategoria-label"
                name="subcategoriaId"
                value={searchParams.subcategoriaId || 0}
                onChange={handleFilterChange}
                label="Subcategoría"
              >
                <MenuItem value={0}>
                  <em>Seleccione subcategoría</em>
                </MenuItem>
                {subcategorias.map((subcategoria) => (
                  <MenuItem
                    key={subcategoria.subcategoriaId}
                    value={subcategoria.subcategoriaId}
                  >
                    {subcategoria.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Serie */}
            <FormControl
              size="small"
              sx={{ minWidth: 200 }}
              disabled={!searchParams.subcategoriaId}
            >
              <InputLabel id="serie-label">Serie</InputLabel>
              <Select
                labelId="serie-label"
                name="serieId"
                value={searchParams.serieId || 0}
                onChange={handleFilterChange}
                label="Serie"
              >
                <MenuItem value={0}>
                  <em>Todas las series</em>
                </MenuItem>
                {series.map((serie) => (
                  <MenuItem key={serie.serieId} value={serie.serieId}>
                    {serie.nombreSerie}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Equipo */}
            <FormControl
              size="small"
              sx={{ minWidth: 200 }}
              disabled={!searchParams.serieId}
            >
              <InputLabel id="equipo-label">Equipo</InputLabel>
              <Select
                labelId="equipo-label"
                name="equipoId"
                value={searchParams.equipoId || 0}
                onChange={handleFilterChange}
                label="Equipo"
              >
                <MenuItem value={0}>
                  <em>Todos los equipos</em>
                </MenuItem>
                {filteredEquipos.map((equipo) => (
                  <MenuItem key={equipo.equipoId} value={equipo.equipoId}>
                    {equipo.nombre}
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
                onChange={handleFilterChange}
                label="Estadio"
              >
                <MenuItem value={0}>Todos</MenuItem>
                {estadios.map((estadio) => (
                  <MenuItem key={estadio.id} value={estadio.id}>
                    {estadio.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Estado */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                name="estado"
                value={searchParams.estado}
                onChange={handleFilterChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                <MenuItem value="EN_JUEGO">En juego</MenuItem>
                <MenuItem value="SUSPENDIDO">Suspendido</MenuItem>
                <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                <MenuItem value="APLAZADO">Aplazado</MenuItem>
              </Select>
            </FormControl>

            {/* Clear Filters Button */}
            {isFilterActive() && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{
                  ml: 1,
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
        </CardContent>
      </Card>

      <DataTable
        columns={[
          {
            id: "fechaHora",
            label: "Fecha y Hora",
            format: (value: string) => new Date(value).toLocaleString(),
            sortable: true,
          },
          {
            id: "titulo",
            label: "Partido",
            sortable: true,
          },
          {
            id: "subcategoriaNombre",
            label: "Subcategoría",
            sortable: true,
          },
          {
            id: "estadioNombre",
            label: "Estadio",
            sortable: true,
          },
          {
            id: "estado",
            label: "Estado",
            format: (value: string) => (
              <Chip
                label={value}
                color={
                  value === "FINALIZADO"
                    ? "success"
                    : value === "EN_JUEGO"
                    ? "primary"
                    : "default"
                }
                size="small"
              />
            ),
            sortable: true,
          },
          {
            id: "acciones",
            label: "Acciones",
            align: "right",
            format: (_: any, row: any) => (
              <>
                <IconButton
                  size="small"
                  onClick={() => onEdit(row)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(row)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
          {
            id: "sanciones",
            label: "Sancionar Jugador",
            align: "center",
            format: (_: any, row: any) => (
              <IconButton
                onClick={() => handleOpenSancionesDialog(row)}
                color="primary"
                title="Gestionar sanciones"
              >
                <Badge
                  badgeContent={sancionesByEncuentro[row.id!]?.length || 0}
                  color="error"
                >
                  <GavelIcon />
                </Badge>
              </IconButton>
            ),
          },
        ]}
        data={encuentros}
        loading={loading}
        emptyMessage="No se encontraron encuentros"
        onRowClick={onEdit}
        page={searchParams.page}
        rowsPerPage={searchParams.size}
        totalRows={totalElements}
        onPageChange={(newPage) => handlePageChange(null, newPage)}
        onRowsPerPageChange={handleDataTableRowsPerPageChange}
      />

      {/* Sanciones Dialog */}
      <SancionDialog
        open={sancionesDialogOpen}
        onClose={handleCloseSancionesDialog}
        onSave={handleSaveSancion}
        onDelete={handleDeleteSancion}
        jugadores={jugadores}
        encuentroId={currentEncuentroId || 0}
        sancion={sancionToEdit}
        loading={loadingSanciones}
        equipoLocalNombre={
          encuentros.find((e) => e.id === currentEncuentroId)
            ?.equipoLocalNombre || "Equipo Local"
        }
        equipoVisitanteNombre={
          encuentros.find((e) => e.id === currentEncuentroId)
            ?.equipoVisitanteNombre || "Equipo Visitante"
        }
      />

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={searchParams.size}
        page={searchParams.page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleTablePaginationRowsPerPageChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!encuentroToDelete}
        onClose={() => setEncuentroToDelete(null)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este encuentro? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEncuentroToDelete(null)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EncuentrosTable;
