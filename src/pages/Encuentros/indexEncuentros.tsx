import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import EncuentrosRegisterForm from "./EncuentrosRegisterForm";
import EncuentrosEditForm from "./EncuentrosEditForm";
import { Encuentro } from "@/types/encuentro.types";
import { Estadio } from "@/types/estadio.types";
import estadioService from "@/api/estadioService";
import EncuentrosTable from "./EncuentrosTable";

const PageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  p: theme.spacing(3),
  maxWidth: "100vw",
  overflowX: "hidden",
  [theme.breakpoints.down("sm")]: {
    p: 1,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  [theme.breakpoints.down("sm")]: {
    boxShadow: "none",
    borderRadius: 0,
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
    <PageContainer>
      <StyledCard>
        <CardContent>
          <Box
            display="flex"
            justifyContent={isMobile ? "stretch" : "flex-end"}
            alignItems="center"
            mb={3}
            flexDirection={isMobile ? "column" : "row"}
            gap={isMobile ? 2 : 0}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
            >
              {isMobile ? "Nuevo" : "Nuevo Encuentro"}
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <EncuentrosTable
              refreshKey={refreshKey}
              onEdit={handleEdit}
              onRefresh={handleSuccess}
            />
          )}
        </CardContent>
      </StyledCard>

      {showAddForm && (
        <EncuentrosRegisterForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleSuccess}
          estadios={estadios}
        />
      )}

      {editingEncuentro && (
        <EncuentrosEditForm
          open={!!editingEncuentro}
          onClose={handleCloseEdit}
          encuentroId={editingEncuentro?.id || 0}
          onSuccess={handleSuccess}
        />
      )}
    </PageContainer>
  );
};

export default EncuentrosPage;
