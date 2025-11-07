import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, useTheme, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar } from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import RecentActivities from "./components/RecentActivities";
import PerformanceChart from "./components/PerformanceChart";
import teamService from "../../api/teamService";
import { useAuth } from "@/contexts/AuthContext";
import playerService from "@/api/playerService";
import categoriaService from "@/api/categoriaService";
import subcategoriaService from "@/api/subcategoriaService";

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
  const theme = useTheme();
  const { token } = useAuth();
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [teamsCount, setTeamsCount] = useState<number | null>(null);
  const [teamsStats, setTeamsStats] = useState<Array<{
    id: number;
    nombre: string;
    puntos: number;
    partidosJugados: number;
    partidosGanados: number;
    partidosPerdidos: number;
    golesAFavor: number;
    golesEnContra: number;
    diferenciaGoles: number;
  }>>([]);
  const [activeEventsCount, setActiveEventsCount] = useState<number | null>(
    null
  );
  const [tournamentsCount, setTournamentsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    players: true,
    teams: true,
    events: true,
    tournaments: true,
  });
  const [error, setError] = useState({
    players: null as string | null,
    teams: null as string | null,
    events: null as string | null,
    tournaments: null as string | null,
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
        const teamsData = await teamService.getTeamsCount();
        setTeamsCount(teamsData.data.equiposActivos);
        
        // Datos de ejemplo (reemplazar con llamada real a la API)
        const teamsStatsData = [
          {
            id: 1,
            nombre: 'Los Tigres',
            puntos: 12,
            partidosJugados: 5,
            partidosGanados: 4,
            partidosPerdidos: 1,
            golesAFavor: 15,
            golesEnContra: 5,
            diferenciaGoles: 10
          },
          {
            id: 2,
            nombre: 'Águilas FC',
            puntos: 10,
            partidosJugados: 5,
            partidosGanados: 3,
            partidosPerdidos: 2,
            golesAFavor: 12,
            golesEnContra: 8,
            diferenciaGoles: 4
          },
          {
            id: 3,
            nombre: 'Leones del Sur',
            puntos: 9,
            partidosJugados: 5,
            partidosGanados: 3,
            partidosPerdidos: 2,
            golesAFavor: 10,
            golesEnContra: 7,
            diferenciaGoles: 3
          },
          {
            id: 4,
            nombre: 'Cóndores FC',
            puntos: 7,
            partidosJugados: 5,
            partidosGanados: 2,
            partidosPerdidos: 3,
            golesAFavor: 8,
            golesEnContra: 10,
            diferenciaGoles: -2
          },
          {
            id: 5,
            nombre: 'Halcones Rojos',
            puntos: 1,
            partidosJugados: 4,
            partidosGanados: 0,
            partidosPerdidos: 4,
            golesAFavor: 3,
            golesEnContra: 15,
            diferenciaGoles: -12
          }
        ];
        
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

        // 1. Get EVENTOS category by nemonico
        const eventosResponse = await categoriaService.getCategoriaByNemonico(
          "EVENTOS"
        );
        if (
          eventosResponse &&
          eventosResponse.data &&
          eventosResponse.data.categoriaId
        ) {
          // 2. Get subcategories for EVENTOS
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(
              eventosResponse.data.categoriaId
            );
          // 3. Set the count of subcategories as active events
          setActiveEventsCount(subcategoriasResponse.data.length);
        } else {
          setActiveEventsCount(0);
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

        // 1. Get DEPORTES category by nemonico
        const deportesResponse = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );

        if (deportesResponse?.success && deportesResponse.data?.categoriaId) {
          // 2. Get subcategories for DEPORTES
          const subcategoriasResponse =
            await subcategoriaService.getSubcategoriasByCategoria(
              deportesResponse.data.categoriaId
            );
          // 3. Set the count of subcategories as tournaments count
          setTournamentsCount(subcategoriasResponse.data?.length || 0);
        } else {
          setTournamentsCount(0);
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
    };

    fetchData();
  }, [token]);

  // Format number with thousands separator
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Panel de Control
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Bienvenido de nuevo, Admin. Aquí tienes un resumen de tu plataforma.
      </Typography>

      {/* Stats Grid */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        }}
        gap={3}
        mb={4}
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
      </Box>

      {/* Charts Row */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "3fr 2fr" }}
        gap={3}
        mb={4}
      >
        <Box gridColumn={{ xs: '1 / -1', md: 'span 2' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Clasificación de Equipos
              </Typography>
              <Chip 
                label={`${teamsCount || 0} equipos`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            
            {loading.teams ? (
              <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : error.teams ? (
              <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                <Typography color="error">Error al cargar los equipos</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ flex: 1 }}>
                <Table size="small" sx={{ minWidth: 650 }} aria-label="tabla de equipos">
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
                      <TableCell align="center">+/-</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamsStats.map((team, index) => (
                      <TableRow 
                        key={team.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          bgcolor: index < 3 ? 'rgba(25, 118, 210, 0.04)' : 'inherit'
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box 
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: index < 3 ? 'white' : 'inherit',
                              fontWeight: index < 3 ? 'bold' : 'normal'
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar 
                              src={`/team-logos/${team.nombre.toLowerCase().replace(/\s+/g, '-')}.png`} 
                              alt={team.nombre}
                              sx={{ width: 28, height: 28, fontSize: '0.75rem' }}
                            >
                              {team.nombre.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {team.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="primary">
                            {team.puntos}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{team.partidosJugados}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={team.partidosGanados} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ minWidth: 30 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={team.partidosPerdidos} 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            sx={{ minWidth: 30 }}
                          />
                        </TableCell>
                        <TableCell align="center">{team.golesAFavor}</TableCell>
                        <TableCell align="center">{team.golesEnContra}</TableCell>
                        <TableCell align="center" sx={{ color: team.diferenciaGoles >= 0 ? 'success.main' : 'error.main' }}>
                          {team.diferenciaGoles > 0 ? '+' : ''}{team.diferenciaGoles}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Typography variant="caption" color="text.secondary">
                * Los primeros 3 equipos clasifican a la siguiente fase
              </Typography>
            </Box>
          </Paper>
        </Box>
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Participación Total
            </Typography>
            <Box height={300}>
              <PerformanceChart
                data={[
                  {
                    name: "Hoy",
                    jugadores: totalPlayers || 0,
                    equipos: teamsCount || 0,
                    total: (totalPlayers || 0) + (teamsCount || 0),
                  },
                ]}
                loading={loading.players || loading.teams}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Recent Activities */}
      <Box mb={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Actividad Reciente
          </Typography>
          <RecentActivities />
        </Paper>
      </Box>

      {/* Upcoming Events */}
      <Box mb={4}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Próximos Eventos
          </Typography>
          <Box textAlign="center" py={4} color="text.secondary">
            <Typography>No hay eventos próximos programados</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
