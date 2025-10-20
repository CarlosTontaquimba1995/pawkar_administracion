import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          px: 3,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: 'primary.main',
            mb: 3,
            opacity: 0.8,
          }}
        />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          fontWeight={700}
          color="text.primary"
        >
          404 - Página no encontrada
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          paragraph
          maxWidth="600px"
          mb={4}
        >
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Puedes volver a la página de inicio o contactar con el soporte si
          necesitas ayuda.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            Volver al inicio
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => window.location.reload()}
            sx={{ textTransform: 'none' }}
          >
            Recargar página
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;
