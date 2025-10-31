import React, { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import { EstadoEncuentro } from "@/types/encuentro.types";
import estadioService from "@/api/estadioService";
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
  const [estadios, setEstadios] = useState<
    Array<{ id: number; nombre: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [hora, setHora] = useState<Date | null>(new Date());
  const [formData, setFormData] = useState<{
    estado: EstadoEncuentro;
    estadioId: number;
    subcategoriaId: number;
  }>({
    estado: "PROGRAMADO",
    estadioId: 0,
    subcategoriaId: 0,
  });

  useEffect(() => {
    // Cargar la lista de estadios
    const fetchEstadios = async () => {
      try {
        const response = await estadioService.getAllEstadios();
        if (response.data) {
          setEstadios(response.data);
        }
      } catch (error) {
        console.error("Error cargando estadios:", error);
      }
    };

    if (open) {
      fetchEstadios();
      if (encuentroId > 0) {
        fetchEncuentro();
      } else {
        // Reset form when opening for new encounter
        const now = new Date();
        setFecha(now);
        setHora(now);
        setFormData({
          estado: "PROGRAMADO",
          estadioId: 0,
          subcategoriaId: 0,
        });
      }
    }
  }, [open, encuentroId]);

  const fetchEncuentro = async () => {
    try {
      setLoading(true);
      console.log("Fetching encuentro with ID:", encuentroId);
      const response = await encuentroService.getEncuentroById(encuentroId);
      if (response.data) {
        const encuentro = response.data;
        console.log("API Response:", encuentro);

        // Parse the date string directly to handle timezone correctly
        const [datePart, timePart] = encuentro.fechaHora.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hours, minutes] = timePart.split(":").map(Number);

        // Create date objects in local timezone
        const localDate = new Date(year, month - 1, day);
        const localTime = new Date(0);
        localTime.setHours(hours, minutes);

        setFormData({
          estado: encuentro.estado,
          estadioId: encuentro.estadioId, // Asegúrate de que la API devuelva estadioId
          subcategoriaId: encuentro.subcategoriaId,
        });

        console.log("Setting form data:", formData);

        setFecha(localDate);
        setHora(localTime);
      }
    } catch (error) {
      console.error("Error fetching encuentro:", error);
      showSnackbar("Error al cargar los datos del encuentro", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !fecha || !hora) return;

    try {
      setLoading(true);

      // Combine date and time into a single ISO string
      const fechaHora = new Date(fecha);
      fechaHora.setHours(hora.getHours());
      fechaHora.setMinutes(hora.getMinutes());
      const fechaHoraISO = fechaHora.toISOString();

      const data = {
        subcategoriaId: formData.subcategoriaId,
        fechaHora: fechaHoraISO,
        estadioId: formData.estadioId,
        estado: formData.estado,
      };

      console.log("Sending data:", data);

      const response = await encuentroService.updateEncuentro(
        encuentroId,
        data
      );

      if (response.success) {
        // Show success message and then call onSuccess after a delay
        setSnackbar({
          open: true,
          message: response.message || "Encuentro actualizado",
          severity: "success",
        });

        // Close the dialog and refresh the parent component after a delay
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);  
      } else {
        throw new Error(response.message || "Error al guardar el encuentro");
      }
    } catch (error: any) {
      console.error("Error saving encuentro:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al guardar el encuentro";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | SelectChangeEvent<number | EstadoEncuentro>
  ) => {
    const name = e.target.name as keyof typeof formData;
    const value = e.target.value;

    console.log("handleChange - name:", name, "value:", value);

    if (name) {
      setFormData((prev) => {
        // Convert value to the appropriate type based on the field name
        let newValue: any = value;

        if (name === "estadioId" || name === "subcategoriaId") {
          newValue = Number(value);
        } else if (name === "estado") {
          // Ensure the value is one of the allowed EstadoEncuentro values
          if (
            ["PROGRAMADO", "EN_JUEGO", "FINALIZADO", "CANCELADO"].includes(
              value as string
            )
          ) {
            newValue = value as EstadoEncuentro;
          } else {
            console.warn(`Invalid estado value: ${value}`);
            return prev; // Don't update if the value is invalid
          }
        }

        const newData = {
          ...prev,
          [name]: newValue,
        };
        console.log("Updating form data:", newData);
        return newData as typeof prev;
      });
    }
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

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Estadio</InputLabel>
            <Select
              name="estadioId"
              value={formData.estadioId}
              label="Estadio"
              onChange={handleChange}
              inputProps={{ "data-testid": "estadio-select" }}
            >
              {estadios.map((estadio) => (
                <MenuItem key={estadio.id} value={estadio.id}>
                  {estadio.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={formData.estado || "PROGRAMADO"}
              label="Estado"
              onChange={handleChange}
              inputProps={{ "data-testid": "estado-select" }}
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
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: 2,
              },
              transition: "all 0.2s ease",
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: 2,
              },
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Guardando..." : "Editar encuentro"}
          </Button>
        </DialogActions>
      </form>

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
    </Dialog>
  );
};

export default EncuentrosEditForm;
