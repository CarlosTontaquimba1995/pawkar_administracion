import React, { useState } from "react";
import { Box, Container } from "@mui/material";
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
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Box mb={{ xs: 2, sm: 3, md: 4 }} />

      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
        }}
      >
        <TablaPosicionesTable
          refreshKey={refreshKey}
          onEdit={handleEdit}
          onRefresh={handleSuccess}
        />
      </Box>

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
    </Container>
  );
};

export default TablaPosiciones;
