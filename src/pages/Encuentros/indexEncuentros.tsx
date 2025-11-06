import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import EncuentrosRegisterForm from "./EncuentrosRegisterForm";
import EncuentrosEditForm from "./EncuentrosEditForm";
import { Encuentro } from "@/types/encuentro.types";
import { Estadio } from "@/types/estadio.types";
import estadioService from "@/api/estadioService";
import EncuentrosTable from "./EncuentrosTable";

const EncuentrosPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEncuentro, setEditingEncuentro] = useState<Encuentro | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [loading, setLoading] = useState(true);

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
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Gestión de Encuentros</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          sx={{
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
            },
          }}
        >
          Nuevo Encuentro
        </Button>
      </Box>

      <EncuentrosTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onRefresh={handleSuccess}
      />

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
    </Box>
  );
};

export default EncuentrosPage;
