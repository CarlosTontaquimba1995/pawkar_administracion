import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import TablaPosicionesTable from "./TablaPosicionesTable";
import TablaPosicionRegisterForm from "./TablaPosicionRegisterForm";
import TablaPosicionEditForm from "./TablaPosicionEditForm";
import { TablaPosicion } from "@/types/tablaPosicion.types";

const TablaPosiciones: React.FC = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [editingPosicion, setEditingPosicion] = useState<TablaPosicion | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenRegister = () => setOpenRegister(true);
  const handleCloseRegister = () => setOpenRegister(false);

  const handleEdit = (posicion: TablaPosicion) => {
    setEditingPosicion(posicion);
  };

  const handleCloseEdit = () => {
    setEditingPosicion(null);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Tabla de Posiciones</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenRegister}
          sx={{
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
            },
            textTransform: "none",
          }}
        >
          Nueva Posición
        </Button>
      </Box>

      <TablaPosicionesTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onRefresh={handleSuccess}
      />

      <TablaPosicionRegisterForm
        open={openRegister}
        onClose={handleCloseRegister}
        onSuccess={handleSuccess}
      />

      {editingPosicion && (
        <TablaPosicionEditForm
          open={!!editingPosicion}
          onClose={handleCloseEdit}
          onSuccess={handleSuccess}
          posicion={editingPosicion}
        />
      )}
    </Box>
  );
};

export default TablaPosiciones;
