// src/pages/Players/index.tsx
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import RegisterPlayerForm from "./RegisterPlayerForm";
import EditPlayer from "./EditPlayerForm";
import { Player } from "@/types/player.types";
import PlayerTable from "./Playertable";

const Players: React.FC = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenRegister = () => setOpenRegister(true);
  const handleCloseRegister = () => setOpenRegister(false);

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleCloseEdit = () => {
    setEditingPlayer(null);
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
        <Typography variant="h4">Jugadores</Typography>
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
          Nuevo Jugador
        </Button>
      </Box>

      <PlayerTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onRefresh={handleSuccess}
      />

      <RegisterPlayerForm
        open={openRegister}
        onClose={handleCloseRegister}
        onSuccess={handleSuccess}
      />

      {editingPlayer && (
        <EditPlayer
          open={!!editingPlayer}
          onClose={handleCloseEdit}
          onSuccess={handleSuccess}
          playerId={editingPlayer.id || 0}
        />
      )}
    </Box>
  );
};

export default Players;
