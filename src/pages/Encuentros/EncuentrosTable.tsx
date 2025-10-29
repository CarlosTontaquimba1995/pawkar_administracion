import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Encuentro, EstadoEncuentro } from "@/types/encuentro.types";
import encuentroService from "@/api/encuentroService";
import EncuentrosEditForm from "./EncuentrosEditForm";

interface EncuentrosTableProps {
  encuentros: Encuentro[];
  onRefresh: () => Promise<void>;
  loading: boolean;
}

const EncuentrosTable: React.FC<EncuentrosTableProps> = ({
  encuentros: initialEncuentros,
  onRefresh,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [encuentroToDelete, setEncuentroToDelete] = useState<Encuentro | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEncuentroId, setEditingEncuentroId] = useState<number | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const filteredEncuentros = initialEncuentros.filter((encuentro) =>
    Object.values(encuentro).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedEncuentros = filteredEncuentros;

  const formatFechaHora = (fechaHora: string) => {
    return new Date(fechaHora).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoColor = (estado: EstadoEncuentro) => {
    switch (estado) {
      case "FINALIZADO":
        return "success";
      case "EN_JUEGO":
        return "warning";
      case "CANCELADO":
        return "error";
      case "PENDIENTE":
      default:
        return "info";
    }
  };

  const handleDelete = async () => {
    if (!encuentroToDelete) return;

    try {
      setIsDeleting(true);
      await encuentroService.deleteEncuentro(encuentroToDelete.id);
      setSnackbar({
        open: true,
        message: "Encuentro eliminado correctamente",
        severity: "success",
      });
      await onRefresh();
    } catch (error) {
      console.error("Error al eliminar el encuentro:", error);
      setSnackbar({
        open: true,
        message: "Error al eliminar el encuentro",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
      setEncuentroToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Definir el ancho fijo para las celdas
  const tableCellStyle = {
    minWidth: "150px", // Ancho mínimo para cada celda
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: "1000px", // Ancho mínimo para el contenedor
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          flexShrink: 0,
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 300px)",
          minHeight: "400px",
          overflow: "hidden",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellStyle}>Título</TableCell>
              <TableCell sx={tableCellStyle}>Fecha y Hora</TableCell>
              <TableCell sx={tableCellStyle}>Estadio/Lugar</TableCell>
              <TableCell sx={tableCellStyle}>Estado</TableCell>
              <TableCell sx={tableCellStyle}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ overflowY: "auto" }}>
            {paginatedEncuentros.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    height: "300px", // Altura similar a cuando hay datos
                    verticalAlign: "middle",
                    fontSize: "1rem",
                    color: "text.secondary",
                  }}
                >
                  {searchTerm
                    ? "No se encontraron coincidencias"
                    : "No hay encuentros para mostrar"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEncuentros.map((encuentro) => (
                <TableRow key={encuentro.id}>
                  <TableCell>{encuentro.titulo}</TableCell>
                  <TableCell>{formatFechaHora(encuentro.fechaHora)}</TableCell>
                  <TableCell>{encuentro.estadioLugar}</TableCell>
                  <TableCell>
                    <Chip
                      label={encuentro.estado}
                      color={getEstadoColor(encuentro.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingEncuentroId(encuentro.id);
                        setEditDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setEncuentroToDelete(encuentro)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EncuentrosEditForm
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={async () => {
          await onRefresh();
          setEditDialogOpen(false);
          setSnackbar({
            open: true,
            message: "Encuentro actualizado correctamente",
            severity: "success",
          });
        }}
        encuentroId={editingEncuentroId || 0}
      />

      <Dialog
        open={!!encuentroToDelete}
        onClose={() => !isDeleting && setEncuentroToDelete(null)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este encuentro? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEncuentroToDelete(null)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EncuentrosTable;
