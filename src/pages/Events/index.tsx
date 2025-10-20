import React, { JSX, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  SportsSoccer as SoccerIcon,
  SportsBasketball as BasketballIcon,
  SportsVolleyball as VolleyballIcon,
  SportsBaseball as BaseballIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const sportIcons: { [key: string]: JSX.Element } = {
  'Fútbol': <SoccerIcon />,
  'Baloncesto': <BasketballIcon />,
  'Voleibol': <VolleyballIcon />,
  'Béisbol': <BaseballIcon />,
};

const events = [
  {
    id: 1,
    title: 'Torneo de Fútbol Primavera 2025',
    sport: 'Fútbol',
    date: '2025-11-15T14:00:00',
    location: 'Estadio Municipal',
    participants: 8,
    status: 'upcoming',
    description: 'Torneo de fútbol 7 con equipos locales.',
    image: '/static/images/events/football-tournament.jpg',
  },
  {
    id: 2,
    title: 'Liga de Baloncesto Interbarrios',
    sport: 'Baloncesto',
    date: '2025-11-20T16:30:00',
    location: 'Polideportivo Central',
    participants: 6,
    status: 'upcoming',
    description: 'Liga de baloncesto para equipos de diferentes barrios de la ciudad.',
    image: '/static/images/events/basketball-league.jpg',
  },
  {
    id: 3,
    title: 'Torneo de Voleibol Playa',
    sport: 'Voleibol',
    date: '2025-11-25T10:00:00',
    location: 'Playa Central',
    participants: 12,
    status: 'upcoming',
    description: 'Torneo de voleibol playa en parejas mixtas.',
    image: '/static/images/events/beach-volleyball.jpg',
  },
  {
    id: 4,
    title: 'Clínica de Béisbol Juvenil',
    sport: 'Béisbol',
    date: '2025-12-05T09:00:00',
    location: 'Campo de Béisbol Municipal',
    participants: 30,
    status: 'upcoming',
    description: 'Clínica de béisbol para jugadores juveniles de 12 a 16 años.',
    image: '/static/images/events/baseball-clinic.jpg',
  },
  {
    id: 5,
    title: 'Torneo de Fútbol Infantil',
    sport: 'Fútbol',
    date: '2025-10-10T10:00:00',
    location: 'Canchas Infantiles',
    participants: 16,
    status: 'completed',
    description: 'Torneo de fútbol para niños de 8 a 12 años.',
    image: '/static/images/events/kids-soccer.jpg',
  },
];

const Events = () => {
  const [tabValue, setTabValue] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      navigate(`/events/edit/${selectedEvent}`);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    // Lógica para eliminar el evento
    console.log('Eliminar evento:', selectedEvent);
    handleMenuClose();
  };

  const filteredEvents = events.filter(
    (event) =>
      (tabValue === 'all' || event.status === tabValue) &&
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: format(date, 'd', { locale: es }),
      month: format(date, 'MMM', { locale: es }),
      time: format(date, 'HH:mm'),
      fullDate: format(date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
        locale: es,
      }),
    };
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Eventos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los eventos deportivos programados
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/new')}
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
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: 1,
              },
            }}
          >
            <Tab
              label="Próximos"
              value="upcoming"
              sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
            />
            <Tab
              label="Pasados"
              value="completed"
              sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
            />
            <Tab
              label="Todos"
              value="all"
              sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }}
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
              sx: {
                minWidth: 300,
              },
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
            <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay eventos {tabValue === 'upcoming' ? 'próximos' : 'pasados'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {tabValue === 'upcoming'
                ? 'Crea un nuevo evento para comenzar.'
                : 'No se encontraron eventos en esta categoría.'}
            </Typography>
            {tabValue === 'upcoming' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/events/new')}
              >
                Crear Evento
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map((event) => {
              const eventDate = formatEventDate(event.date);
              const iconElement = sportIcons[event.sport] || <EventIcon />;

              return (
                <Grid 
                  key={event.id}
                  component="div"
                  sx={{
                    gridColumn: {
                      xs: 'span 12',
                      md: 'span 6'
                    }
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: { xs: '100%', sm: 140 },
                        minHeight: { xs: 120, sm: 'auto' },
                        bgcolor: 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, event.id)}
                          sx={{
                            backgroundColor: 'background.paper',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight={700}
                        lineHeight={1}
                      >
                        {eventDate.day}
                      </Typography>
                      <Typography
                        variant="button"
                        color="text.secondary"
                        textTransform="uppercase"
                        fontSize="0.75rem"
                        letterSpacing={0.5}
                      >
                        {eventDate.month}
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: 'background.paper',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {React.cloneElement(iconElement, {
                          sx: {
                            color: 'primary.main',
                            fontSize: 28,
                          }
                        })}
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flex: 1, p: 3 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={1}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            fontWeight={600}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {event.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {event.description}
                        </Typography>
                        <Box mt="auto">
                          <Box display="flex" alignItems="center" mb={1}>
                            <EventIcon
                              fontSize="small"
                              sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {eventDate.fullDate}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationIcon
                              fontSize="small"
                              sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <GroupIcon
                              fontSize="small"
                              sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {event.participants}{' '}
                              {event.participants === 1 ? 'participante' : 'participantes'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <Box
                        sx={{
                          px: 3,
                          pb: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          label={event.status === 'upcoming' ? 'Próximo' : 'Finalizado'}
                          color={event.status === 'upcoming' ? 'primary' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Ver detalles
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
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
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Events;
