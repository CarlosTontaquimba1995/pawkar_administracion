import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
} from "@mui/icons-material";
import { Encuentro } from "@/types/encuentro.types";
import { Estadio } from "@/types/estadio.types";
import { Team } from "@/types/team.types";
import encuentroService from "@/api/encuentroService";
import subcategoriaService from "@/api/subcategoriaService";
import teamService from "@/api/teamService";
import estadioService from "@/api/estadioService";

interface EncuentrosTableProps {
  refreshKey: number;
  onEdit: (encuentro: Encuentro) => void;
  onRefresh: () => void;
}

interface SearchParams {
  fechaInicio: string;
  fechaFin: string;
  subcategoriaId: number;
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
    equipoId: 0,
    estadioId: 0,
    estado: "",
    page: 0,
    size: 10,
  });
  
  // Helper function to format date for display in input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // If the date already includes time, extract just the date part
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };
  const [subcategorias, setSubcategorias] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
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

  // Fetch subcategorias
  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const response = await subcategoriaService.getSubcategorias();
        setSubcategorias(
          response.data.map((sub: any) => ({
            id: sub.subcategoriaId,
            nombre: sub.nombre,
          }))
        );
      } catch (err) {
        console.error("Error loading subcategorias:", err);
      }
    };

    fetchSubcategorias();
  }, []);

  // Fetch teams when subcategoria changes
  useEffect(() => {
    const fetchTeams = async () => {
      if (searchParams.subcategoriaId > 0) {
        try {
          setLoadingTeams(true);
          const response = await teamService.getTeamsBySubcategoria(
            searchParams.subcategoriaId
          );
          setTeams(response.data || []);
        } catch (err) {
          console.error("Error loading teams:", err);
          setTeams([]);
        } finally {
          setLoadingTeams(false);
        }
      } else {
        setTeams([]);
      }
    };

    fetchTeams();
  }, [searchParams.subcategoriaId]);

  // Fetch estadios
  useEffect(() => {
    const fetchEstadios = async () => {
      try {
        const response = await estadioService.getAllEstadios();
        setEstadios(response.data || []);
      } catch (err) {
        console.error("Error loading estadios:", err);
      }
    };

    fetchEstadios();
  }, []);

  const handleFilterChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | number>
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Handle date inputs
    if ((name === "fechaInicio" || name === "fechaFin") && value) {
      // For date inputs, append T00:00:00 for start date and T23:59:59 for end date
      const timePart = name === "fechaInicio" ? "T00:00:00" : "T23:59:59";
      formattedValue = `${value}${timePart}`;
    }

    setSearchParams((prev) => ({
      ...prev,
      [name]: formattedValue,
      page: 0,
    }));

    // Reset equipoId if subcategoria changes
    if (name === "subcategoriaId") {
      setSearchParams((prev) => ({
        ...prev,
        equipoId: 0,
        page: 0,
      }));
    }
  };

  const handlePageChange = (_: any, newPage: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
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
      equipoId: 0,
      estadioId: 0,
      estado: "",
      page: 0,
      size: searchParams.size,
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
      searchParams.equipoId > 0 ||
      searchParams.estadioId > 0 ||
      searchParams.estado !== ""
    );
  };

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
              <InputLabel>Subcategoría</InputLabel>
              <Select
                name="subcategoriaId"
                value={searchParams.subcategoriaId}
                onChange={handleFilterChange}
                label="Subcategoría"
              >
                <MenuItem value={0}>Todas</MenuItem>
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
              disabled={loadingTeams}
            >
              <InputLabel>Equipo</InputLabel>
              <Select
                name="equipoId"
                value={searchParams.equipoId}
                onChange={handleFilterChange}
                label="Equipo"
              >
                <MenuItem value={0}>Todos</MenuItem>
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
                value={searchParams.estadioId}
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

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Partido</TableCell>
              <TableCell>Subcategoría</TableCell>
              <TableCell>Estadio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : encuentros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron encuentros
                </TableCell>
              </TableRow>
            ) : (
              encuentros.map((encuentro) => (
                <TableRow key={encuentro.id}>
                  <TableCell>
                    {new Date(encuentro.fechaHora).toLocaleString()}
                  </TableCell>
                  <TableCell>{encuentro.titulo}</TableCell>
                  <TableCell>{encuentro.subcategoriaNombre}</TableCell>
                  <TableCell>{encuentro.estadioNombre}</TableCell>
                  <TableCell>
                    <Chip
                      label={encuentro.estado}
                      color={
                        encuentro.estado === "FINALIZADO"
                          ? "success"
                          : encuentro.estado === "EN_JUEGO"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(encuentro)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(encuentro)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={searchParams.size}
        page={searchParams.page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
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
