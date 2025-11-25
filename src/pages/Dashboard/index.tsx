import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import {
  People as PeopleIcon,
  Group as GroupIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import teamService from "../../api/teamService";
import { useAuth } from "@/contexts/AuthContext";
import playerService from "@/api/playerService";
import categoriaService from "@/api/categoriaService";
import subcategoriaService from "@/api/subcategoriaService";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useThemeConfig } from "@/contexts/ThemeContext";

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color,
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  const theme = useMuiTheme();
  const { colors } = useThemeConfig();
  const { token } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [teamsCount, setTeamsCount] = useState<number | null>(null);
  interface TeamStats {
    id: number;
    nombre: string;
    puntos: number;
    partidosJugados: number;
    partidosGanados: number;
    partidosPerdidos: number;
    golesAFavor: number;
    golesEnContra: number;
    diferenciaGoles: number;
  }

  const [teamsStats, setTeamsStats] = useState<TeamStats[]>([]);
  const [activeEventsCount, setActiveEventsCount] = useState<number | null>(
    null
  );
  const [tournamentsCount, setTournamentsCount] = useState<number | null>(null);
  const [proximosEventos, setProximosEventos] = useState<any[]>([]);
  const [categoriesExist, setCategoriesExist] = useState({
    eventos: false,
    torneos: false,
  });
  const [loading, setLoading] = useState({
    players: true,
    teams: true,
    events: true,
    tournaments: true,
    proximosEventos: true,
  });
  const [error, setError] = useState<{
    players: string | null;
    teams: string | null;
    events: string | null;
    tournaments: string | null;
  }>({
    players: null,
    teams: null,
    events: null,
    tournaments: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      // Fetch player count
      try {
        setLoading((prev) => ({ ...prev, players: true }));
        const count = await playerService.getActivePlayersCount();
        setTotalPlayers(count.data.totalJugadores);
      } catch (err) {
        console.error("Error fetching player count:", err);
        setError((prev) => ({
          ...prev,
          players: "Error al cargar el total de jugadores",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, players: false }));
      }

      // Fetch teams data
      try {
        setLoading((prev) => ({ ...prev, teams: true }));

        // Get teams count
        const teamsCountData = await teamService.getTeamsCount();
        setTeamsCount(teamsCountData.data.equiposActivos);

        // Get first 5 teams
        const teamsResponse = await teamService.getTeams({
          page: 0,
          size: 5,
          sort: "id,desc", // Or any other sorting you prefer
        });

        // Map the API response to match the TeamStats interface
        const teamsData = Array.isArray(teamsResponse)
          ? teamsResponse.slice(0, 5)
          : teamsResponse.data?.content?.slice(0, 5) || [];

        const teamsStatsData = teamsData.map((team: any) => ({
          id: team.id,
          nombre: team.nombre || "Sin nombre",
          puntos: team.puntos || 0,
          partidosJugados: team.partidosJugados || 0,
          partidosGanados: team.partidosGanados || 0,
          partidosPerdidos: team.partidosPerdidos || 0,
          golesAFavor: team.golesAFavor || 0,
          golesEnContra: team.golesEnContra || 0,
          diferenciaGoles: (team.golesAFavor || 0) - (team.golesEnContra || 0),
        }));

        setTeamsStats(teamsStatsData);
      } catch (err) {
        console.error("Error fetching teams data:", err);
        setError((prev) => ({
          ...prev,
          teams: "Error al cargar los datos de los equipos",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, teams: false }));
      }

      // Fetch active events count
      try {
        setLoading((prev) => ({ ...prev, events: true }));

        // 1. Get all categories first
        const categoriasResponse = await categoriaService.getCategorias();
        const eventosCategory = categoriasResponse.data.find(
          (cat: any) => cat.nemonico === "EVENTOS"
        );

        if (eventosCategory) {
          // 2. Get subcategories for EVENTOS
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(
              eventosCategory.categoriaId
            );
          // 3. Set the count of subcategories as active events
          setActiveEventsCount(subcategoriasResponse.data?.length || 0);
          setCategoriesExist((prev) => ({ ...prev, eventos: true }));
        } else {
          setActiveEventsCount(0);
          setCategoriesExist((prev) => ({ ...prev, eventos: false }));
        }
      } catch (err) {
        console.error("Error fetching active events count:", err);
        setError((prev) => ({
          ...prev,
          events: "Error al cargar el total de eventos activos",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }

      // Fetch tournaments count
      try {
        setLoading((prev) => ({ ...prev, tournaments: true }));

        // 1. Get all categories first
        const categoriasResponse = await categoriaService.getCategorias();
        const deportesCategory = categoriasResponse.data.find(
          (cat: any) => cat.nemonico === "DEPORTES"
        );

        if (deportesCategory) {
          // 2. Get subcategories for DEPORTES
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(
              deportesCategory.categoriaId
            );
          // 3. Set the count of subcategories as tournaments count
          setTournamentsCount(subcategoriasResponse.data?.length || 0);
          setCategoriesExist((prev) => ({ ...prev, torneos: true }));
        } else {
          setTournamentsCount(0);
          setCategoriesExist((prev) => ({ ...prev, torneos: false }));
        }
      } catch (err) {
        console.error("Error fetching tournaments count:", err);
        setError((prev) => ({
          ...prev,
          tournaments: "Error al cargar el total de torneos",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, tournaments: false }));
      }

      // Fetch próximos eventos
      try {
        setLoading((prev) => ({ ...prev, proximosEventos: true }));
        const eventosResponse = await subcategoriaService.getProximosEventos();

        if (eventosResponse.success && eventosResponse.data) {
          setProximosEventos(eventosResponse.data.slice(0, 3)); // Show only first 3 events
        }
      } catch (err) {
        console.error("Error fetching próximos eventos:", err);
      } finally {
        setLoading((prev) => ({ ...prev, proximosEventos: false }));
      }
    };

    fetchData();
  }, [token]);

  // Format number with thousands separator
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 3 },
        py: 2,
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={600}
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          Panel de Control
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Bienvenido de nuevo, Admin. Aquí tienes un resumen de tu plataforma.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: { xs: 1.5, sm: 2, md: 3 },
          mb: { xs: 3, sm: 4 },
          "& > *": {
            minWidth: 0, // Evita desbordamiento
          },
        }}
      >
        <Box>
          <StatCard
            title="Jugadores Inscritos"
            value={
              loading.players ? (
                <CircularProgress size={24} color="inherit" />
              ) : error.players ? (
                <Typography variant="body2" color="error">
                  Error
                </Typography>
              ) : (
                formatNumber(totalPlayers)
              )
            }
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
          />
        </Box>
        <Box>
          <StatCard
            title="Equipos Inscritos"
            value={
              loading.teams ? (
                <CircularProgress size={24} color="inherit" />
              ) : error.teams ? (
                <Typography variant="body2" color="error">
                  Error
                </Typography>
              ) : (
                formatNumber(teamsCount)
              )
            }
            icon={<GroupIcon />}
            color={theme.palette.secondary.main}
          />
        </Box>
        {categoriesExist.eventos && (
          <Box>
            <StatCard
              title="Eventos Activos"
              value={
                loading.events ? (
                  <CircularProgress size={24} color="inherit" />
                ) : error.events ? (
                  <Typography variant="body2" color="error">
                    Error
                  </Typography>
                ) : (
                  formatNumber(activeEventsCount)
                )
              }
              icon={<EventIcon />}
              color={theme.palette.success.main}
            />
          </Box>
        )}
        {categoriesExist.torneos && (
          <Box>
            <StatCard
              title="Torneos habilitados"
              value={
                loading.tournaments ? (
                  <CircularProgress size={24} color="inherit" />
                ) : error.tournaments ? (
                  <Typography variant="body2" color="error">
                    Error
                  </Typography>
                ) : (
                  formatNumber(tournamentsCount)
                )
              }
              icon={<TrophyIcon />}
              color={theme.palette.warning.main}
            />
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 },
          "& > *": {
            minWidth: 0, // Evita desbordamiento
          },
        }}
      >
        {/* Left Column - Teams Table */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              "&:hover": {
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
              },
              transition: "box-shadow 0.3s ease-in-out",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexWrap="wrap"
              gap={1}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                Clasificación de Equipos
              </Typography>
              <Chip
                label={`${teamsCount || 0} equipos`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontSize: "0.75rem",
                  height: "24px",
                }}
              />
            </Box>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": {
                  height: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "rgba(0,0,0,0.05)",
                },
              }}
            >
              <TableContainer sx={{ minWidth: 300 }}>
                <Table
                  stickyHeader
                  size={isMobile ? "small" : "medium"}
                  aria-label="tabla de equipos"
                  sx={{
                    "& .MuiTableCell-root": {
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 0.5, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      "&:first-of-type": {
                        pl: { xs: 1, sm: 2 },
                      },
                      "&:last-child": {
                        pr: { xs: 1, sm: 2 },
                      },
                    },
                    "& .MuiTableCell-head": {
                      fontWeight: 600,
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Equipo</TableCell>
                      <TableCell align="right">PTS</TableCell>
                      <TableCell align="center">PJ</TableCell>
                      <TableCell align="center">PG</TableCell>
                      <TableCell align="center">PP</TableCell>
                      <TableCell align="center">GF</TableCell>
                      <TableCell align="center">GC</TableCell>
                      <TableCell align="center">DG</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody key="teams-table-body">
                    {loading.teams ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : error.teams ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                          sx={{ py: 3, color: "error.main" }}
                        >
                          {error.teams}
                        </TableCell>
                      </TableRow>
                    ) : teamsStats.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                          sx={{ py: 3, color: "text.secondary" }}
                        >
                          No hay datos disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      teamsStats.map((team, index) => (
                        <TableRow key={team.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                src={`/team-logos/${team.nombre
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}.png`}
                                alt={team.nombre}
                                sx={{
                                  width: 30,
                                  height: 30,
                                  mr: 1,
                                  fontSize: "0.75rem",
                                  display: { xs: "none", sm: "flex" },
                                  bgcolor: colors.primary,
                                  color: "#fff",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    transition: "all 0.2s ease",
                                    boxShadow: `0 0 0 2px ${colors.secondary}`,
                                  },
                                }}
                              >
                                {team.nombre.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box
                                component="span"
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: { xs: "120px", sm: "none" },
                                }}
                              >
                                {team.nombre}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={team.puntos}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {team.partidosJugados}
                          </TableCell>
                          <TableCell align="center">
                            {team.partidosGanados}
                          </TableCell>
                          <TableCell align="center">
                            {team.partidosPerdidos}
                          </TableCell>
                          <TableCell align="center">
                            {team.golesAFavor}
                          </TableCell>
                          <TableCell align="center">
                            {team.golesEnContra}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={team.diferenciaGoles}
                              size="small"
                              color={
                                team.diferenciaGoles > 0
                                  ? "success"
                                  : team.diferenciaGoles < 0
                                  ? "error"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Typography variant="caption" color="text.secondary">
                * Los primeros 3 equipos clasifican a la siguiente fase
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Próximos Eventos */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Próximos Eventos
            </Typography>

            {loading.proximosEventos ? (
              <Box textAlign="center" py={4}>
                <CircularProgress />
              </Box>
            ) : proximosEventos.length === 0 ? (
              <Box textAlign="center" py={4} color="text.secondary">
                <Typography>No hay eventos próximos programados</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {proximosEventos.map((evento, index) => (
                  <Box
                    key={evento.subcategoriaId || evento.id || index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}05`,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {evento.fechaHora
                          ? new Date(evento.fechaHora).getDate()
                          : "?"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ textTransform: "uppercase", fontSize: "0.65rem" }}
                      >
                        {evento.fechaHora
                          ? new Date(evento.fechaHora).toLocaleDateString(
                              "es",
                              { month: "short" }
                            )
                          : ""}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {evento.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {evento.descripcion || "Sin descripción"}
                      </Typography>
                      {evento.fechaHora && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(evento.fechaHora).toLocaleString("es", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={evento.categoriaNombre || "Evento"}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Team Performance Charts - Full Width */}
      <Box mb={4}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" mb={3} fontWeight={600}>
            Rendimiento de Equipos
          </Typography>

          {loading.teams ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
            </Box>
          ) : teamsStats.length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <Typography>No hay datos de equipos disponibles</Typography>
            </Box>
          ) : (
            <Box>
              {/* Team Performance Comparison Chart */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  mb={2}
                  color="text.secondary"
                >
                  Comparación de Rendimiento - Top 5 Equipos
                </Typography>
                <Box sx={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={teamsStats.slice(0, 5).map((team) => ({
                        nombre:
                          team.nombre.length > 15
                            ? team.nombre.substring(0, 15) + "..."
                            : team.nombre,
                        "Partidos Ganados": team.partidosGanados,
                        "Partidos Perdidos": team.partidosPerdidos,
                        "Goles a Favor": team.golesAFavor,
                        "Goles en Contra": team.golesEnContra,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="nombre"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{
                          fill: theme.palette.text.primary,
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                        }}
                      />
                      <Bar
                        dataKey="Partidos Ganados"
                        fill={theme.palette.success.main}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Partidos Perdidos"
                        fill={theme.palette.error.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Goals Comparison Chart */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  mb={2}
                  color="text.secondary"
                >
                  Comparación de Goles - Top 5 Equipos
                </Typography>
                <Box sx={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={teamsStats.slice(0, 5).map((team) => ({
                        nombre:
                          team.nombre.length > 15
                            ? team.nombre.substring(0, 15) + "..."
                            : team.nombre,
                        "Goles a Favor": team.golesAFavor,
                        "Goles en Contra": team.golesEnContra,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="nombre"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{
                          fill: theme.palette.text.primary,
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: theme.palette.text.secondary,
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                        }}
                      />
                      <Bar
                        dataKey="Goles a Favor"
                        fill={theme.palette.warning.main}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Goles en Contra"
                        fill={theme.palette.info.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
