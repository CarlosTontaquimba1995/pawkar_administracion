import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
const MainLayout = lazy(() => import('@/layouts/MainLayout'));

// Pages
const LoginPage = lazy(() => import('@/pages/Login'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const TeamsPage = lazy(() => import('@/pages/Teams'));
const PlayersPage = lazy(() => import('@/pages/Players'));
const EventsPage = lazy(() => import('@/pages/Events'));
const CategoriesPage = lazy(() => import('@/pages/Categories'));
const RolesPage = lazy(() => import('@/pages/Roles'));
const EncuentrosPage = lazy(() => import("@/pages/Encuentros/indexEncuentros"));
const TablaPosicionesPage = lazy(
  () => import("@/pages/TablaPosiciones/indexTablaPosiciones")
);
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

const LoadingSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Ruta pública de login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="encuentros" element={<EncuentrosPage />} />
          <Route path="posiciones" element={<TablaPosicionesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
