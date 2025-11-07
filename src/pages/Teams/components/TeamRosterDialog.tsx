import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Avatar,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import plantillaService from "@/api/plantillaService";
import { Plantilla } from "@/types/plantilla.types";

interface TeamRosterDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: number;
  teamName: string;
}

const TeamRosterDialog: React.FC<TeamRosterDialogProps> = ({
  open,
  onClose,
  teamId,
  teamName,
}) => {
  const [plantilla, setPlantilla] = useState<Plantilla[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoster = async () => {
      if (!open || !teamId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await plantillaService.getPlantillasByEquipo(teamId);
        if (response.success && response.data) {
          // Extract players from the plantillas response
          const plantillaList = Array.isArray(response.data)
            ? response.data.map((item: any) => item)
            : [];
          setPlantilla(plantillaList);
        } else {
          setError("No se pudieron cargar los jugadores del equipo");
        }
      } catch (err) {
        console.error("Error fetching team roster:", err);
        setError("Error al cargar la plantilla del equipo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoster();
  }, [open, teamId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6">Plantilla de Jugadores</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 2 }}>
            {teamName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : plantilla.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography>No hay jugadores en este equipo</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Jugador</TableCell>
                  <TableCell>Posición</TableCell>
                  <TableCell>Dorsal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plantilla.map((player, index) => (
                  <TableRow key={player.jugadorId} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={`/player-avatars/${player.jugadorNombreCompleto}.jpg`}
                          alt={`${player.jugadorNombreCompleto}`}
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 2,
                            bgcolor: "primary.main",
                          }}
                        >
                          {player.jugadorNombreCompleto?.charAt(0)}
                          {player.jugadorNombreCompleto?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {player.jugadorNombreCompleto}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{player.rolNombre || "-"}</TableCell>
                    <TableCell>{player.numeroCamiseta || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamRosterDialog;
