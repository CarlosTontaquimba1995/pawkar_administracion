import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import RegisterTeam from "./RegisterTeamForm";
import EditTeam from "./EditTeamForm";
import TeamTable from "./TeamTable"; // Assuming TeamTable is in the same directory
import { Team } from "@/types/team.types";

const Teams: React.FC = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenRegister = () => setOpenRegister(true);
  const handleCloseRegister = () => setOpenRegister(false);

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
  };


  const handleCloseEdit = () => {
    setEditingTeam(null);
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
        <Typography variant="h4">Equipos</Typography>
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
          Nuevo Equipo
        </Button>
      </Box>

      <TeamTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onRefresh={handleSuccess}
      />

      <RegisterTeam
        open={openRegister}
        onClose={handleCloseRegister}
        onSuccess={handleSuccess}
      />

      {editingTeam && (
        <EditTeam
          open={!!editingTeam}
          onClose={handleCloseEdit}
          onSuccess={handleSuccess}
          teamId={editingTeam?.equipoId || 0}
        />
      )}
    </Box>
  );
};

export default Teams;
