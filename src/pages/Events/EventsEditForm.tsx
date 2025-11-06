import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import subcategoriaService from "@/api/subcategoriaService";
import { categoriaService } from "@/api/categoriaService";
import { useState, useEffect } from "react";
import { Subcategoria } from "@/types/subcategoria.types";

interface EventsEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: Subcategoria | null;
}

const EventsEditForm: React.FC<EventsEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  event,
}) => {
  const [formData, setFormData] = useState<Subcategoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { token } = useAuth();

  // Load event data when the component opens or the event prop changes
  useEffect(() => {
    const fetchEventData = async () => {
      if (open && event?.subcategoriaId) {
        try {
          const response = await subcategoriaService.getSubcategoriaById(
            event.subcategoriaId
          );
          if (response.data) {
            // Format the date for datetime-local input (YYYY-MM-DDThh:mm)
            const formatDateForInput = (dateString: string) => {
              const date = new Date(dateString);
              // Convert to local timezone and format as YYYY-MM-DDThh:mm
              const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
              const localDate = new Date(date.getTime() - offset);
              return localDate.toISOString().slice(0, 16);
            };

            setFormData({
              ...response.data,
              fechaHora: response.data.fechaHora
                ? formatDateForInput(response.data.fechaHora)
                : new Date().toISOString().slice(0, 16),
            });
          }
        } catch (error) {
          console.error("Error fetching event data:", error);
          setSnackbar({
            open: true,
            message: "Error al cargar los datos del evento",
            severity: "error",
          });
        }
      } else if (open && event) {
        // Fallback to the passed event data if subcategoriaId is not available
        // Format the date for datetime-local input (YYYY-MM-DDThh:mm)
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          // Convert to local timezone and format as YYYY-MM-DDThh:mm
          const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
          const localDate = new Date(date.getTime() - offset);
          return localDate.toISOString().slice(0, 16);
        };

        setFormData({
          ...event,
          fechaHora: event.fechaHora
            ? formatDateForInput(event.fechaHora)
            : new Date().toISOString().slice(0, 16),
        });
      }
    };

    fetchEventData();
  }, [open, event]);

  // Fetch the EVENTOS category on mount
  useEffect(() => {
    const fetchCategoriaEventos = async () => {
      try {
        const response = await categoriaService.getCategoriaByNemonico(
          "EVENTOS"
        );
        if (response.data) {
          setCategoriaId(response.data.categoriaId);
        }
      } catch (error) {
        console.error("Error al obtener la categoría de eventos:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar la categoría de eventos",
          severity: "error",
        });
      }
    };

    if (open) {
      fetchCategoriaEventos();
    }
  }, [open]);

  const handleChange = (field: keyof Subcategoria, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !formData || !categoriaId) {
      setSnackbar({
        open: true,
        message: "Error de autenticación o datos incompletos",
        severity: "error",
      });
      return;
    }

    // Validate required fields
    if (
      !formData.nombre?.trim() ||
      !formData.descripcion?.trim() ||
      !formData.fechaHora ||
      !formData.ubicacion?.trim()
    ) {
      setSnackbar({
        open: true,
        message: "Por favor complete todos los campos requeridos",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Format the date to match backend's LocalDateTime format (ISO-8601 with 'T' separator)
      const formatDateForBackend = (dateString: string) => {
        // The datetime-local input gives us a string like '2026-02-02T19:09'
        // We'll keep it as is since it's already in a format that LocalDateTime can parse
        return dateString + ":00"; // Add seconds to make it '2026-02-02T19:09:00'
      };

      // Prepare the data for the API
      const updateData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fechaHora: formatDateForBackend(formData.fechaHora),
        ubicacion: formData.ubicacion,
        categoriaId: categoriaId,
        proximo: formData.proximo ?? true,
        estado: formData.estado ?? true,
      };

      console.log("Sending data to API:", updateData); // For debugging

      await subcategoriaService.updateSubcategoria(
        formData.subcategoriaId,
        updateData
      );

      setSnackbar({
        open: true,
        message: "Evento actualizado correctamente",
        severity: "success",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      setSnackbar({
        open: true,
        message:
          "Error al actualizar el evento. Por favor, intente nuevamente.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!formData) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Editar Evento</Typography>
            <IconButton onClick={onClose} disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                label="Nombre del Evento"
                value={formData.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
                fullWidth
                margin="normal"
                disabled={loading}
              />

              <TextField
                label="Descripción"
                value={formData.descripcion || ""}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                required
                fullWidth
                multiline
                rows={4}
                margin="normal"
                disabled={loading}
              />

              <TextField
                label="Fecha y Hora"
                type="datetime-local"
                value={formData.fechaHora}
                onChange={(e) => handleChange("fechaHora", e.target.value)}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />

              <TextField
                label="Ubicación"
                value={formData.ubicacion || ""}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                required
                fullWidth
                margin="normal"
                disabled={loading}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EventsEditForm;
