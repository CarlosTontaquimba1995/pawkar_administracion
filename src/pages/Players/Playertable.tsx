import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Player } from "@/types/player.types";
import playerService from "@/api/playerService";
import DataTable, { Column } from "@/components/common/DataTable/DataTable";

interface PlayerTableProps {
  refreshKey: number;
  onEdit: (player: Player) => void;
  onRefresh: () => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  refreshKey,
  onEdit,
  onRefresh,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalElements, setTotalElements] = useState(0);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await playerService.getPlayers({
        page,
        size: rowsPerPage,
        search: searchTerm.trim(),
      });

      if (response?.success) {
        setPlayers(
          Array.isArray(response.data?.content) ? response.data.content : []
        );
        setTotalElements(Number(response.data?.totalElements) || 0);
      } else {
        setPlayers([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Error loading players:", error);
      setSnackbar({
        open: true,
        message: "Error al cargar los jugadores",
        severity: "error",
      });
      setPlayers([]);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers, refreshKey]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await playerService.deletePlayer(playerToDelete.id || 0);
      setSnackbar({
        open: true,
        message: response.message || "Jugador eliminado",
        severity: "success",
      });
      onRefresh(); // Refresh the parent component
    } catch (error) {
      console.error("Error deleting player:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el jugador",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setPlayerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setPlayerToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const columns: Column[] = [
    {
      id: "index",
      label: "#",
      align: "center",
      minWidth: 50,
      format: (_: any, row: Player) => {
        const index = players.findIndex((p) => p.id === row.id);
        return page * rowsPerPage + index + 1;
      },
    },
    {
      id: "nombre",
      label: "Jugador",
      minWidth: 200,
      format: (_: string, row: Player) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {row.nombre} {row.apellido}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {row.nombreEquipo || "Sin equipo"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "documentoIdentidad",
      label: "Documento",
      minWidth: 150,
      hideOnMobile: true,
    },
    {
      id: "fechaNacimiento",
      label: "Fecha Nacimiento",
      minWidth: 150,
      format: (value: string) => new Date(value).toLocaleDateString(),
      hideOnMobile: true,
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      minWidth: 120,
      format: (_: unknown, row: Player) => (
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Search Bar */}
      <Box
        mb={3}
        display="flex"
        alignItems="center"
        gap={2}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Box flex={1} width="100%">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar jugadores..."
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={players}
        loading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalElements}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No se encontraron jugadores"
        hover
        stickyHeader
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={playerToDelete !== null}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Jugador</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar al jugador{" "}
            {playerToDelete?.nombre} {playerToDelete?.apellido}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlayerTable;
