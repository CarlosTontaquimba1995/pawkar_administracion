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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4} />

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
    </Container>
  );
};

export default TablaPosiciones;
