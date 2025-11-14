// src/pages/Players/index.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            alignItems={{ xs: "stretch", sm: "center" }}
            mb={3}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenRegister}
              size={isMobile ? "medium" : "large"}
              sx={{
                whiteSpace: "nowrap",
                minWidth: isMobile ? "100%" : "220px",
                width: isMobile ? "100%" : "auto",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
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
        </CardContent>
      </Card>

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
