import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import RegisterTeam from "./RegisterTeamForm";
import EditTeam from "./EditTeamForm";
import TeamTable from "./TeamTable";
import { Team } from "@/types/team.types";

const Teams: React.FC = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    <Box
      sx={{
        width: "100%",
        p: isMobile ? 1 : 3,
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <Card
        elevation={isMobile ? 0 : 1}
        sx={{
          borderRadius: isMobile ? 0 : 2,
          width: isMobile ? "100%" : "800px",
          maxWidth: "100%",
          margin: "0 auto",
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          minHeight: "500px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: isMobile ? 2 : 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            "&:last-child": { pb: isMobile ? 2 : 3 },
          }}
        >
          <Box display="flex" justifyContent="flex-end" mb={3} width="100%">
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
                boxShadow: "none",
                px: 3,
                justifyContent: "center",
                "&:hover": {
                  boxShadow: theme.shadows[3],
                  backgroundColor: "primary.dark",
                },
                "& .MuiButton-startIcon": {
                  marginRight: 1,
                },
              }}
            >
              Nuevo Equipo
            </Button>
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <TeamTable
              refreshKey={refreshKey}
              onEdit={handleEdit}
              onRefresh={handleSuccess}
            />
          </Box>
        </CardContent>
      </Card>

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
