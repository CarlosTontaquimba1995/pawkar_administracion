import React, { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import { EstadoEncuentro } from "@/types/encuentro.types";
import encuentroService from "@/api/encuentroService";
import { useAuth } from "@/contexts/AuthContext";

interface EncuentrosEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  encuentroId: number;
}

const EncuentrosEditForm: React.FC<EncuentrosEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  encuentroId,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [hora, setHora] = useState<Date | null>(new Date());
  const [formData, setFormData] = useState<{
    estado: EstadoEncuentro;
    estadioLugar: string;
    subcategoriaId: number;
    equipoLocalId: number;
    equipoVisitanteId: number;
  }>({
    estado: "PROGRAMADO",
    estadioLugar: "",
    subcategoriaId: 0,
    equipoLocalId: 0,
    equipoVisitanteId: 0,
  });

  useEffect(() => {
    if (open && encuentroId > 0) {
      fetchEncuentro();
    } else {
      // Reset form when opening for new encounter
      const now = new Date();
      setFecha(now);
      setHora(now);
      setFormData({
        estado: "PROGRAMADO",
        estadioLugar: "",
        subcategoriaId: 0,
        equipoLocalId: 0,
        equipoVisitanteId: 0,
      });
      setError(null);
    }
  }, [open, encuentroId]);

  const fetchEncuentro = async () => {
    try {
      setLoading(true);
      const response = await encuentroService.getEncuentroById(encuentroId);
      if (response.data) {
        const encuentro = response.data;
        // Parse the date string directly to handle timezone correctly
        const [datePart, timePart] = encuentro.fechaHora.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        
        // Create date objects in local timezone
        const localDate = new Date(year, month - 1, day);
        const localTime = new Date(0);
        localTime.setHours(hours, minutes);
        
        setFecha(localDate);
        setHora(localTime);
        setFormData({
          estado: encuentro.estado,
          estadioLugar: encuentro.estadioLugar,
          subcategoriaId: encuentro.subcategoriaId,
          equipoLocalId: encuentro.equipoLocalId,
          equipoVisitanteId: encuentro.equipoVisitanteId,
        });
      }
    } catch (error) {
      console.error("Error fetching encuentro:", error);
      setError("Error al cargar los datos del encuentro");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !fecha || !hora) return;

    try {
      setLoading(true);
      setError(null);

      // Format the date and time from the component state
      const fechaStr = fecha.toISOString().split('T')[0];
      const horaStr = hora.toTimeString().slice(0, 5);

      const data = {
        equipoLocalId: formData.equipoLocalId,
        equipoVisitanteId: formData.equipoVisitanteId,
        fecha: fechaStr,
        hora: horaStr,
        estadio: formData.estadioLugar,
        estado: formData.estado,
        subcategoriaId: formData.subcategoriaId
      };

      let response;
      if (encuentroId > 0) {
        response = await encuentroService.updateEncuentro(encuentroId, data);
      } else {
        response = await encuentroService.createEncuentro(data);
      }

      if (response.data) {
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || "Error al guardar el encuentro");
      }
    } catch (error: any) {
      console.error("Error saving encuentro:", error);
      setError(
        error.response?.data?.message || "Error al guardar el encuentro"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleDateChange = (newDate: Date | null) => {
    setFecha(newDate);
  };

  const handleTimeChange = (newTime: Date | null) => {
    setHora(newTime);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {encuentroId > 0 ? "Editar Encuentro" : "Nuevo Encuentro"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Box
              mb={2}
              p={1.5}
              bgcolor="error.dark"
              color="white"
              borderRadius={1}
            >
              {error}
            </Box>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box mb={2}>
              <DatePicker
                label="Fecha del encuentro"
                value={fecha}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    required: true,
                  },
                }}
              />
            </Box>
            <Box mb={2}>
              <TimePicker
                label="Hora del encuentro"
                value={hora}
                onChange={handleTimeChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    required: true,
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          <TextField
            fullWidth
            margin="normal"
            label="Estadio/Lugar"
            name="estadioLugar"
            value={formData.estadioLugar}
            onChange={handleChange}
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={formData.estado}
              label="Estado"
              onChange={handleChange}
            >
              <MenuItem value="EN_JUEGO">En Juego</MenuItem>
              <MenuItem value="FINALIZADO">Finalizado</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
              <MenuItem value="PROGRAMADO">Programado</MenuItem>
            </Select>
          </FormControl>

          {/* TODO: Add selectors for subcategoria, equipoLocal, and equipoVisitante */}
          {/* These will need to be populated from your API */}
        </DialogContent>
        <DialogActions>
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
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EncuentrosEditForm;
