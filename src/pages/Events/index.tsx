import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationOnIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Subcategoria } from "../../types/subcategoria.types";
import subcategoriaService from "@/api/subcategoriaService";
import EventsRegisterForm from "./EventsRegisterForm";

const formatEventDate = (dateString: string | null | undefined) => {
  if (!dateString)
    return { day: "", month: "", time: "", fullDate: "Fecha por definir" };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime()))
      return { day: "", month: "", time: "", fullDate: "Fecha inválida" };

    const day = format(date, "d");
    const month = format(date, "MMMM", { locale: es });
    const time = format(date, "hh:mm a", { locale: es });
    const fullDate = format(date, "d 'de' MMMM 'del' yyyy 'a las' hh:mm a", {
      locale: es,
    });

    return { day, month, time, fullDate };
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return { day: "", month: "", time: "", fullDate: "Error en la fecha" };
  }
};

const Events = () => {
  const [tabValue, setTabValue] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Subcategoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proximosEventos, setProximosEventos] = useState<Subcategoria[]>([]);
  const [eventosPasados, setEventosPasados] = useState<Subcategoria[]>([]);
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenRegisterForm = () => {
    setIsRegisterFormOpen(true);
  };

  const handleCloseRegisterForm = () => {
    setIsRegisterFormOpen(false);
  };

  const handleRegisterSuccess = () => {
    // Refresh the events list when a new event is successfully created
    if (tabValue === "upcoming" || tabValue === "all") {
      fetchEventos(true);
    }
    if (tabValue === "completed" || tabValue === "all") {
      fetchEventos(false);
    }
    handleCloseRegisterForm();
  };

  const fetchEventos = async (isProximo: boolean) => {
    try {
      setIsLoading(true);
      const response = isProximo
        ? await subcategoriaService.getProximosEventos()
        : await subcategoriaService.getEventosPasados();

      if (response.success && response.data) {
        const eventos = response.data.map((event: any) => ({
          subcategoriaId: event.id,
          nombre: event.nombre,
          descripcion: event.descripcion,
          fechaHora: event.fechaHora,
          proximo: event.proximo,
          categoriaId: event.categoriaId,
          categoriaNombre: event.categoriaNombre || "Sin categoría",
          estado: event.estado || true,
          ubicacion: event.ubicacion || "Sin ubicación",
        })) as Subcategoria[];

        if (isProximo) {
          setProximosEventos(eventos);
        } else {
          setEventosPasados(eventos);
        }
      }
    } catch (err) {
      console.error("Error al cargar los eventos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === "upcoming" || tabValue === "all") {
      fetchEventos(true);
    }
    if (tabValue === "completed" || tabValue === "all") {
      fetchEventos(false);
    }
  }, [tabValue]);

  const filteredEvents = useMemo(() => {
    const events =
      tabValue === "upcoming"
        ? proximosEventos
        : tabValue === "completed"
        ? eventosPasados
        : [...proximosEventos, ...eventosPasados];

    if (!searchTerm) return events;

    const searchLower = searchTerm.toLowerCase();
    return events.filter(
      (event) =>
        event.nombre.toLowerCase().includes(searchLower) ||
        (event.descripcion &&
          event.descripcion.toLowerCase().includes(searchLower))
    );
  }, [proximosEventos, eventosPasados, tabValue, searchTerm]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    eventItem: Subcategoria
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      navigate(`/events/edit/${selectedEvent.subcategoriaId}`);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    console.log("Eliminar evento:", selectedEvent);
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Eventos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los eventos programados
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenRegisterForm}
          sx={{
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
            },
          }}
        >
          Nuevo Evento
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ "& .MuiTabs-flexContainer": { gap: 1 } }}
          >
            <Tab
              value="upcoming"
              label="Próximos"
              sx={{ textTransform: "none", minWidth: "auto", px: 2 }}
            />
            <Tab
              value="completed"
              label="Pasados"
              sx={{ textTransform: "none", minWidth: "auto", px: 2 }}
            />
            <Tab
              value="all"
              label="Todos"
              sx={{ textTransform: "none", minWidth: "auto", px: 2 }}
            />
          </Tabs>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { minWidth: 300 },
            }}
          />
        </Box>

        {filteredEvents.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
            textAlign="center"
          >
            <Box
              sx={{
                fontSize: 60,
                color: "text.secondary",
                mb: 2,
                opacity: 0.5,
              }}
            >
              <EventIcon fontSize="inherit" color="disabled" />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay eventos{" "}
              {tabValue === "upcoming"
                ? "próximos"
                : tabValue === "completed"
                ? "pasados"
                : "disponibles"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {tabValue === "upcoming"
                ? "Crea un nuevo evento para comenzar."
                : tabValue === "completed"
                ? "No hay eventos pasados para mostrar."
                : "No hay eventos disponibles."}
            </Typography>
            {tabValue !== "completed" && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenRegisterForm}
                sx={{
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                    borderColor: "primary.main",
                  },
                }}
              >
                Crear Evento
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {filteredEvents.map((event) => (
              <Box
                key={`event-${event.subcategoriaId}`}
                sx={{ width: { xs: "100%", md: "calc(100% - 16px)" } }}
              >
                <Card
                  sx={{
                    mb: 2,
                    height: "100%",
                    width: "100%",
                    maxWidth: "100%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    },
                    "@media (min-width: 900px)": {
                      maxWidth: "none",
                      width: "100%",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", md: 200 },
                        minHeight: { xs: 140, md: "100%" },
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 2,
                        position: "relative",
                        textAlign: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          "& .MuiIconButton-root": {
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.3)",
                            },
                          },
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, event)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: "3rem",
                          fontWeight: 700,
                          lineHeight: 1,
                          mb: 1,
                          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        {formatEventDate(event.fechaHora).day}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          opacity: 0.9,
                        }}
                      >
                        {formatEventDate(event.fechaHora).month}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                    >
                      <CardContent
                        sx={{
                          flex: 1,
                          p: 3,
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {event.nombre}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1,
                              mb: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                bgcolor: "rgba(25, 118, 210, 0.1)",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                color: "primary.main",
                              }}
                            >
                              <EventIcon
                                fontSize="small"
                                sx={{ mr: 0.75, fontSize: "1rem" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.8rem", fontWeight: 500 }}
                              >
                                {formatEventDate(event.fechaHora).fullDate}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: "action.hover",
                                color: "text.secondary",
                              }}
                            >
                              <LocationOnIcon
                                fontSize="small"
                                sx={{ mr: 0.75, fontSize: "1rem" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                {event.ubicacion}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {event.descripcion ||
                            "No hay descripción disponible para este evento."}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pt: 2,
                            mt: "auto",
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: event.estado
                                  ? "success.main"
                                  : "error.main",
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {event.estado ? "Activo" : "Inactivo"}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() =>
                              navigate(`/events/${event.subcategoriaId}`)
                            }
                            sx={{
                              textTransform: "none",
                              fontWeight: 500,
                              borderRadius: 2,
                              px: 2,
                              "&:hover": {
                                bgcolor: "primary.light",
                                color: "primary.contrastText",
                              },
                            }}
                          >
                            Ver detalles
                          </Button>
                        </Box>
                      </CardContent>
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Events Register Form Dialog */}
      <EventsRegisterForm
        open={isRegisterFormOpen}
        onClose={handleCloseRegisterForm}
        onSuccess={handleRegisterSuccess}
      />
    </Box>
  );
};

export default Events;
