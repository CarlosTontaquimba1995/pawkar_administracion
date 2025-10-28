import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  TablePagination,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from "@mui/icons-material";
import { Encuentro } from "@/types/encuentro.types";
import EncuentrosTable from "./EncuentrosTable";
import EncuentrosRegisterForm from "./EncuentrosRegisterForm";
import encuentroService from "@/api/encuentroService";
import subcategoriaService from "@/api/subcategoriaService";
import { Subcategoria } from "@/types/subcategoria.types";

const EncuentrosPage = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Search and pagination state
  const [searchParams, setSearchParams] = useState({
    fechaInicio: "",
    fechaFin: "",
    subcategoriaId: 0, // Will be set after fetching subcategorias
    equipoId: 0,
    estadioLugar: "",
    estado: "",
    page: 0,
    size: 10,
  });

  const [encuentros, setEncuentros] = useState<Encuentro[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [subcategorias, setSubcategorias] = useState<
    Array<{ id: number; nombre: string }>
  >([]);

  // Fetch encuentros when component mounts or searchParams/token changes
  useEffect(() => {
    if (token) {
      fetchEncuentros();
    }
  }, [searchParams, token]);

  const fetchEncuentros = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Create a clean params object with only non-empty values
      const cleanParams: Record<string, any> = {
        page: searchParams.page,
        size: searchParams.size,
      };

      // Only add parameters that have values
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
  };

  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const response = await subcategoriaService.getSubcategorias();
        const mappedSubcategorias = response.data.map((sub: Subcategoria) => ({
          id: sub.subcategoriaId,
          nombre: sub.nombre,
        }));
        setSubcategorias(mappedSubcategorias);

        // If we have subcategorias, update the searchParams with the first valid subcategoriaId
        if (mappedSubcategorias.length > 0) {
          const firstValidSubcategoriaId = mappedSubcategorias[0].id;
          setSearchParams((prev) => ({
            ...prev,
            subcategoriaId: firstValidSubcategoriaId,
            // Reset page to 0 when changing subcategoria
            page: 0,
          }));

          // Fetch encuentros with the new subcategoriaId
          fetchEncuentros();
        }
      } catch (error) {
        console.error("Error fetching subcategorias:", error);
      }
    };

    fetchSubcategorias();
  }, []);

  useEffect(() => {
    // Only fetch if we have a subcategoria selected or if we're not filtering by subcategoria
    if (searchParams.subcategoriaId !== 0 || !searchParams.subcategoriaId) {
      fetchEncuentros();
    }
  }, [searchParams, token]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 0, // Reset to first page when changing page size
      size: parseInt(event.target.value, 10),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (
    e:
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | (Event & { target: { value: string; name: string } })
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    // If we have subcategorias and the selected subcategoria is not in the list,
    // select the first available subcategoria
    if (name === "subcategoriaId" && subcategorias.length > 0) {
      const selectedId = Number(value);
      const subcategoriaExists = subcategorias.some(
        (sc) => sc.id === selectedId
      );

      if (!subcategoriaExists) {
        setSearchParams((prev) => ({
          ...prev,
          subcategoriaId: subcategorias[0].id,
          page: 0, // Reset to first page when changing subcategoria
        }));
        return;
      }
    }

    // For all other cases, update the search params normally
    setSearchParams((prev) => ({
      ...prev,
      [name as string]: value,
      ...(name !== "page" && { page: 0 }), // Reset to first page for non-pagination changes
    }));
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name } = e.target;
    if (name !== "subcategoriaId" && searchParams.subcategoriaId === 0) {
      setSearchParams((prev) => ({
        ...prev,
        subcategoriaId: 0, // Clear the default subcategoriaId when other filters are used
        [name as string]: e.target.value,
      }));
    } else {
      handleInputChange(e);
    }
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
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4" component="h1">
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

      <Card
        variant="outlined"
        sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Filtros de Búsqueda
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
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
              }}
              size="small"
              startIcon={<ClearIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              Limpiar todo
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Filtro de Fechas */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={500}
                color="text.secondary"
                gutterBottom
              >
                Rango de Fechas
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  alignItems: "end",
                }}
              >
                <Box>
                  <TextField
                    fullWidth
                    label="Fecha de inicio"
                    type="date"
                    name="fechaInicio"
                    value={searchParams.fechaInicio}
                    onChange={handleFilterChange}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      sx: { backgroundColor: "background.paper" },
                    }}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Fecha de fin"
                    type="date"
                    name="fechaFin"
                    value={searchParams.fechaFin}
                    onChange={handleFilterChange}
                    size="small"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      sx: { backgroundColor: "background.paper" },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Filtros Adicionales */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  color="text.secondary"
                  gutterBottom
                >
                  Búsqueda por Lugar
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ej: Estadio Olímpico"
                  name="estadioLugar"
                  value={searchParams.estadioLugar}
                  onChange={handleFilterChange}
                  size="small"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { backgroundColor: "background.paper" },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  color="text.secondary"
                  gutterBottom
                >
                  Estado del Encuentro
                </Typography>
                <FormControl fullWidth size="small" variant="outlined">
                  <Select
                    name="estado"
                    value={searchParams.estado}
                    onChange={handleSelectChange}
                    displayEmpty
                    inputProps={{ "aria-label": "Estado del encuentro" }}
                    sx={{ backgroundColor: "background.paper" }}
                  >
                    <MenuItem value="">
                      <em>Todos los estados</em>
                    </MenuItem>
                    <MenuItem value="PENDIENTE">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FiberManualRecordIcon fontSize="small" color="info" />
                        Pendiente
                      </Box>
                    </MenuItem>
                    <MenuItem value="EN_JUEGO">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FiberManualRecordIcon
                          fontSize="small"
                          color="warning"
                        />
                        En Juego
                      </Box>
                    </MenuItem>
                    <MenuItem value="FINALIZADO">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FiberManualRecordIcon
                          fontSize="small"
                          color="success"
                        />
                        Finalizado
                      </Box>
                    </MenuItem>
                    <MenuItem value="CANCELADO">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <FiberManualRecordIcon fontSize="small" color="error" />
                        Cancelado
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <EncuentrosTable
          encuentros={encuentros}
          loading={loading}
          subcategorias={subcategorias}
          onSubcategoriaChange={(subcategoriaId: number) => {
            setSearchParams((prev) => ({
              ...prev,
              subcategoriaId,
              page: 0,
            }));
          }}
          onRefresh={fetchEncuentros}
        />

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={searchParams.size}
          page={searchParams.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          sx={{ mt: 2 }}
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
