import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import plantillaService from "@/api/plantillaService";
import sancionesService from "@/api/sancionesService";
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
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [sancionToDelete, setSancionToDelete] = useState<{id: number, jugadorNombre: string} | null>(null);

  const handleDeleteSancion = (sancionId: number, jugadorNombre: string) => {
    setSancionToDelete({ id: sancionId, jugadorNombre });
  };

  const handleDeleteConfirm = async () => {
    if (!sancionToDelete) return;
    
    try {
      setIsDeleting(sancionToDelete.id);
      await sancionesService.deleteSancion(sancionToDelete.id);
      
      // Refresh the player's data
      const response = await plantillaService.getPlantillasByEquipo(teamId);
      if (response.success && response.data) {
        const updatedPlantilla = Array.isArray(response.data) ? response.data : [];
        setPlantilla(updatedPlantilla);
      }
      
      setSancionToDelete(null);
    } catch (error) {
      console.error("Error deleting sanción:", error);
      setError("Error al eliminar la sanción");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setSancionToDelete(null);
  };

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
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plantilla.map((player, index) => (
                  <TableRow key={player.jugadorId} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          alt={player.jugadorNombreCompleto}
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 2,
                            bgcolor: "primary.main",
                            color: "white",
                          }}
                        >
                          {player.jugadorNombreCompleto
                            ?.charAt(0)
                            .toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {player.jugadorNombreCompleto}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{player.rolNombre || "-"}</TableCell>
                    <TableCell>{player.numeroCamiseta || "-"}</TableCell>
                    <TableCell>
                      {player.tieneSancion &&
                      player.sanciones?.some(
                        (s) => s.tipoSancion === "TARJETA_ROJA"
                      ) ? (
                        <Tooltip
                          title={
                            <>
                              <div>Jugador suspendido</div>
                              <ul
                                style={{
                                  paddingLeft: "16px",
                                  margin: "8px 0 0 0",
                                  listStyle: "none",
                                }}
                              >
                                {player.sanciones
                                  .filter(
                                    (s) => s.tipoSancion === "TARJETA_ROJA"
                                  )
                                  .map((sancion) => (
                                    <li
                                      key={sancion.sancionId}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "4px",
                                        padding: "4px 0",
                                        borderBottom: "1px solid #eee",
                                      }}
                                    >
                                      <span>
                                        {sancion.tipoSancion
                                          .replace("_", " ")
                                          .toLowerCase()}{" "}
                                        - {sancion.fechaRegistro}
                                        {sancion.motivo &&
                                          ` (${sancion.motivo})`}
                                      </span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSancion(
                                            sancion.sancionId,
                                            player.jugadorNombreCompleto
                                          );
                                        }}
                                        disabled={
                                          isDeleting === sancion.sancionId
                                        }
                                      >
                                        {isDeleting === sancion.sancionId ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <DeleteIcon fontSize="small" />
                                        )}
                                      </IconButton>
                                    </li>
                                  ))}
                              </ul>
                            </>
                          }
                          arrow
                        >
                          <Chip
                            icon={<WarningIcon />}
                            label="Suspendido"
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : player.tieneSancion &&
                        player.sanciones?.some(
                          (s) => s.tipoSancion === "TARJETA_AMARILLA"
                        ) ? (
                        <Tooltip
                          title={
                            <>
                              <div>Amonestado</div>
                              <ul
                                style={{
                                  paddingLeft: "16px",
                                  margin: "8px 0 0 0",
                                  listStyle: "none",
                                }}
                              >
                                {player.sanciones
                                  .filter(
                                    (s) => s.tipoSancion === "TARJETA_AMARILLA"
                                  )
                                  .map((sancion) => (
                                    <li
                                      key={sancion.sancionId}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "4px",
                                        padding: "4px 0",
                                        borderBottom: "1px solid #eee",
                                      }}
                                    >
                                      <span>
                                        {sancion.tipoSancion
                                          .replace("_", " ")
                                          .toLowerCase()}{" "}
                                        - {sancion.fechaRegistro}
                                        {sancion.motivo &&
                                          ` (${sancion.motivo})`}
                                      </span>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSancion(
                                            sancion.sancionId,
                                            player.jugadorNombreCompleto
                                          );
                                        }}
                                        disabled={
                                          isDeleting === sancion.sancionId
                                        }
                                      >
                                        {isDeleting === sancion.sancionId ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <DeleteIcon fontSize="small" />
                                        )}
                                      </IconButton>
                                    </li>
                                  ))}
                              </ul>
                            </>
                          }
                          arrow
                        >
                          <Chip
                            icon={<WarningIcon />}
                            label="Amonestado"
                            color="warning"
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          label="Disponible"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={sancionToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la sanción del jugador "
            {sancionToDelete?.jugadorNombre}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting !== null}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting !== null}
            startIcon={
              isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamRosterDialog;
