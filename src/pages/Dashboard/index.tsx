import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon,
  Event as EventIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import RecentActivities from './components/RecentActivities';
import PerformanceChart from './components/PerformanceChart';

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Panel de Control
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Bienvenido de nuevo, Admin. Aquí tienes un resumen de tu plataforma.
      </Typography>

      {/* Stats Grid */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={3} mb={4}>
        <Box>
          <StatCard
            title="Jugadores Totales"
            value="1,245"
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
          />
        </Box>
        <Box>
          <StatCard
            title="Equipos"
            value="48"
            icon={<GroupIcon />}
            color={theme.palette.secondary.main}
          />
        </Box>
        <Box>
          <StatCard
            title="Eventos Activos"
            value="12"
            icon={<EventIcon />}
            color={theme.palette.success.main}
          />
        </Box>
        <Box>
          <StatCard
            title="Torneos"
            value="8"
            icon={<TrophyIcon />}
            color={theme.palette.warning.main}
          />
        </Box>
      </Box>

      {/* Charts Row */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '3fr 2fr' }} gap={3} mb={4}>
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
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
              height: '100%',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
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
          border: '1px solid',
          borderColor: 'divider',
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
