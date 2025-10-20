import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClientProvider } from './providers/QueryClientProvider';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import AppRoutes from './routes';
import StorageCleaner from './components/StorageCleaner';

function App() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <StorageCleaner />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppRoutes />
          </Router>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
