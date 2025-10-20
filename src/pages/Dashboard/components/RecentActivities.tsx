import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { green, blue, orange } from '@mui/material/colors';
import {
  PersonAdd as PersonAddIcon,
  SportsSoccer as SportsSoccerIcon,
  EventAvailable as EventAvailableIcon,
} from '@mui/icons-material';

const StyledList = styled(List)({
  '& .MuiListItem-root': {
    px: 0,
    py: 1,
  },
});

const activities = [
  {
    id: 1,
    user: 'Juan Pérez',
    action: 'se unió al equipo Los Halcones',
    time: 'Hace 5 minutos',
    icon: <PersonAddIcon />,
    color: green[500],
  },
  {
    id: 2,
    user: 'María García',
    action: 'anotó 2 goles en el partido vs Águilas',
    time: 'Hace 1 hora',
    icon: <SportsSoccerIcon />,
    color: blue[500],
  },
  {
    id: 3,
    user: 'Carlos López',
    action: 'creó un nuevo torneo: Torneo Primavera 2025',
    time: 'Hace 3 horas',
    icon: <EventAvailableIcon />,
    color: orange[500],
  },
  {
    id: 4,
    user: 'Ana Martínez',
    action: 'actualizó su perfil',
    time: 'Ayer',
    icon: <PersonAddIcon />,
    color: green[500],
  },
];

const RecentActivities = () => {
  return (
    <Box>
      <StyledList>
        {activities.map((activity) => (
          <ListItem key={activity.id}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: activity.color,
                  color: 'white',
                }}
              >
                {activity.icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  <Typography component="span" variant="subtitle2" fontWeight={500}>
                    {activity.user}{' '}
                  </Typography>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {activity.action}
                  </Typography>
                </>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </StyledList>
      <Box textAlign="center" mt={2}>
        <Typography
          variant="button"
          color="primary"
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          Ver toda la actividad
        </Typography>
      </Box>
    </Box>
  );
};

export default RecentActivities;
