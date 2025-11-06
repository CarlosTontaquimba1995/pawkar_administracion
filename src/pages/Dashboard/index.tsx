import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import RecentActivities from './components/RecentActivities';
import PerformanceChart from './components/PerformanceChart';
import teamService from '../../api/teamService';
import { useAuth } from '@/contexts/AuthContext';
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
  value: React.ReactNode; // Allow React nodes for loading/error states
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

      // Fetch teams count
      try {
        setLoading((prev) => ({ ...prev, teams: true }));
        const teamsData = await teamService.getTeamsCount();
        setTeamsCount(teamsData.data.equiposActivos);
      } catch (err) {
        console.error("Error fetching teams count:", err);
        setError((prev) => ({
          ...prev,
          teams: "Error al cargar el total de equipos",
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
              Rendimiento Mensual
            </Typography>
            <Box height={300}>
              <PerformanceChart />
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
              Actividad Reciente
            </Typography>
            <RecentActivities />
          </Paper>
        </Box>
      </Box>

      {/* Upcoming Events */}
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
  );
};

export default Dashboard;
