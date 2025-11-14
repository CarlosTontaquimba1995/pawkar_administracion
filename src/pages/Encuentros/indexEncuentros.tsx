import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  styled,
  Paper,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import EncuentrosRegisterForm from "./EncuentrosRegisterForm";
import EncuentrosEditForm from "./EncuentrosEditForm";
import { Encuentro } from "@/types/encuentro.types";
import { Estadio } from "@/types/estadio.types";
import estadioService from "@/api/estadioService";
import EncuentrosTable from "./EncuentrosTable";

const PageContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 1600,
  margin: "0 auto",
  padding: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const EncuentrosPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEncuentro, setEditingEncuentro] = useState<Encuentro | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleEdit = (encuentro: Encuentro) => {
    setEditingEncuentro(encuentro);
  };

  const handleCloseEdit = () => {
    setEditingEncuentro(null);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setShowAddForm(false);
    setEditingEncuentro(null);
  };

  useEffect(() => {
    const fetchEstadios = async () => {
      try {
        const response = await estadioService.getAllEstadios();
        setEstadios(response.data);
      } catch (error) {
        console.error("Error fetching estadios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadios();
  }, []);

  if (loading) {
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <PageContainer elevation={3}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          mb={3}
          gap={2}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 500,
              textAlign: { xs: "center", sm: "left" },
              mb: { xs: 2, sm: 0 },
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Gestión de Encuentros
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
            sx={{
              whiteSpace: "nowrap",
              minWidth: isMobile ? "100%" : "auto",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              py: 1,
              px: 3,
            }}
          >
            Nuevo Encuentro
          </Button>
        </Box>

        <Box mt={3}>
          <EncuentrosTable
            refreshKey={refreshKey}
            onEdit={handleEdit}
            onRefresh={handleSuccess}
          />
        </Box>

        <EncuentrosRegisterForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleSuccess}
          estadios={estadios}
        />

        {editingEncuentro && (
          <EncuentrosEditForm
            open={!!editingEncuentro}
            onClose={handleCloseEdit}
            encuentroId={editingEncuentro?.id || 0}
            onSuccess={handleSuccess}
          />
        )}
      </PageContainer>
    </Box>
  );
};

export default EncuentrosPage;
