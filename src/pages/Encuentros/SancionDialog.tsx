import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";
import {
  Sancion,
  CreateSancionRequest,
  UpdateSancionRequest,
} from "@/types/sancion.types";

const TIPOS_SANCION = [
  {
    value: "TARJETA_AMARILLA",
    label: "Tarjeta Amarilla",
    color: "warning" as const,
  },
  { value: "TARJETA_ROJA", label: "Tarjeta Roja", color: "error" as const },
  { value: "SUSPENSION", label: "Suspensión", color: "default" as const },
  { value: "OTRA", label: "Otra", color: "default" as const },
];

interface JugadorOption {
  id: number;
  nombre: string;
  equipoId: number;
  equipoNombre: string;
}

interface JugadoresPorEquipo {
  local: JugadorOption[];
  visitante: JugadorOption[];
  todos: JugadorOption[];
}

interface SancionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSancionRequest | UpdateSancionRequest) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  jugadores: JugadoresPorEquipo;
  encuentroId: number;
  sancion?: Sancion | null;
  loading?: boolean;
  equipoLocalNombre: string;
  equipoVisitanteNombre: string;
}

const SancionDialog: React.FC<SancionDialogProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  jugadores,
  encuentroId,
  sancion,
  loading = false,
  equipoLocalNombre,
  equipoVisitanteNombre,
}) => {
  // Initialize form data with empty values first
  const [formData, setFormData] = useState<CreateSancionRequest>({
    jugadorId: 0, // Will be updated in useEffect
    encuentroId,
    tipoSancion: "TARJETA_AMARILLA",
    detalleSancion: "",
    fechaRegistro: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Define teams data with proper typing using the passed team names
  const equipoLocal = {
    id: 1,
    nombre: equipoLocalNombre,
    jugadores: jugadores.local,
  };

  const equipoVisitante = {
    id: 2,
    nombre: equipoVisitanteNombre,
    jugadores: jugadores.visitante,
  };

  // Update form data when players are loaded or when editing an existing sancion
  useEffect(() => {
    if (sancion) {
      // If editing an existing sancion
      setFormData({
        jugadorId: sancion.jugadorId,
        encuentroId: sancion.encuentroId,
        tipoSancion: sancion.tipoSancion,
        detalleSancion: sancion.detalleSancion || "",
        fechaRegistro: sancion.fechaRegistro || new Date().toISOString(),
      });
    } else if (jugadores.todos && jugadores.todos.length > 0) {
      // For new sancion, set the first available player
      const firstPlayerId = jugadores.todos[0]?.id;
      setFormData((prev) => ({
        ...prev,
        jugadorId: firstPlayerId,
        encuentroId,
        tipoSancion: "TARJETA_AMARILLA",
      }));
    } else if (
      (jugadores.local && jugadores.local.length > 0) ||
      (jugadores.visitante && jugadores.visitante.length > 0)
    ) {
      // Fallback for older versions that might not have the 'todos' array
      const firstPlayerId =
        (jugadores.local && jugadores.local[0]?.id) ||
        (jugadores.visitante && jugadores.visitante[0]?.id);
      setFormData((prev) => ({
        ...prev,
        jugadorId: firstPlayerId || 0,
        encuentroId,
        tipoSancion: "TARJETA_AMARILLA",
      }));
    }
  }, [sancion, encuentroId, jugadores]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.jugadorId) {
      newErrors.jugadorId = "Seleccione un jugador";
    }
    if (!formData.tipoSancion) {
      newErrors.tipoSancion = "Seleccione un tipo de sanción";
    }
    if (!formData.detalleSancion?.trim()) {
      newErrors.detalleSancion = "Ingrese la descripción de la sanción";
    }
    if (!formData.fechaRegistro) {
      newErrors.fechaRegistro = "Seleccione una fecha";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const dataToSend = {
          ...formData,
          encuentroId: Number(encuentroId), // Ensure encuentroId is a number
        };
        await onSave(dataToSend);
        onClose();
      } catch (error) {
        console.error("Error saving sanción:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (sancion?.id && onDelete) {
      try {
        await onDelete(sancion.id);
        onClose();
      } catch (error) {
        console.error("Error deleting sanción:", error);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        fechaSancion: date.toISOString(),
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          m: 0,
          p: 2,
          "& .MuiTypography-root": {
            m: 0,
            flex: 1,
          },
          "& .MuiIconButton-root": {
            p: 0.5,
          },
        }}
      >
        <Typography variant="h6" component="div">
          {sancion ? "Editar Sanción" : "Nueva Sanción"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <div style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Equipo Local Dropdown */}
              <div>
                <FormControl fullWidth error={!!errors.jugadorId}>
                  <InputLabel id="jugador-local-label">
                    {equipoLocal.nombre}
                  </InputLabel>
                  <Select
                    labelId="jugador-local-label"
                    name="jugadorId"
                    value={formData.jugadorId || ""}
                    onChange={(e) => {
                      const value = e.target.value as number;
                      setFormData((prev) => ({
                        ...prev,
                        jugadorId: value,
                        equipoId: equipoLocal.id, // Set the team ID when a player is selected
                      }));
                    }}
                    label={equipoLocal.nombre}
                    disabled={equipoLocal.jugadores.length === 0}
                  >
                    {equipoLocal.jugadores.length > 0 ? (
                      equipoLocal.jugadores.map((jugador) => (
                        <MenuItem
                          key={`local-${jugador.id}`}
                          value={jugador.id}
                        >
                          {jugador.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No hay jugadores en la plantilla de {equipoLocal.nombre}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </div>

              {/* Equipo Visitante Dropdown */}
              <div>
                <FormControl fullWidth error={!!errors.jugadorId}>
                  <InputLabel id="jugador-visitante-label">
                    {equipoVisitante.nombre}
                  </InputLabel>
                  <Select
                    labelId="jugador-visitante-label"
                    name="jugadorId"
                    value={formData.jugadorId || ""}
                    onChange={(e) => {
                      const value = e.target.value as number;
                      setFormData((prev) => ({
                        ...prev,
                        jugadorId: value,
                        equipoId: equipoVisitante.id, // Set the team ID when a player is selected
                      }));
                    }}
                    label={equipoVisitante.nombre}
                    disabled={equipoVisitante.jugadores.length === 0}
                  >
                    {equipoVisitante.jugadores.length > 0 ? (
                      equipoVisitante.jugadores.map((jugador) => (
                        <MenuItem
                          key={`visitante-${jugador.id}`}
                          value={jugador.id}
                        >
                          {jugador.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No hay jugadores en la plantilla de{" "}
                        {equipoVisitante.nombre}
                      </MenuItem>
                    )}
                  </Select>
                  {errors.jugadorId && (
                    <Typography color="error" variant="caption">
                      {errors.jugadorId}
                    </Typography>
                  )}
                </FormControl>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <FormControl fullWidth error={!!errors.tipoSancion}>
                  <InputLabel id="tipo-sancion-label">
                    Tipo de Sanción
                  </InputLabel>
                  <Select
                    labelId="tipo-sancion-label"
                    name="tipoSancion"
                    value={formData.tipoSancion}
                    onChange={(e) => {
                      const value = e.target.value as string;
                      setFormData((prev) => ({
                        ...prev,
                        tipoSancion: value as any,
                      }));
                    }}
                    label="Tipo de Sanción"
                  >
                    {TIPOS_SANCION.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        <Chip
                          label={tipo.label}
                          size="small"
                          color={tipo.color}
                          sx={{ minWidth: "120px" }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipoSancion && (
                    <Typography color="error" variant="caption">
                      {errors.tipoSancion}
                    </Typography>
                  )}
                </FormControl>
              </div>
              <div>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    label="Fecha de Registro"
                    value={
                      formData.fechaRegistro
                        ? new Date(formData.fechaRegistro)
                        : null
                    }
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>
                {errors.fechaRegistro && (
                  <Typography color="error" variant="caption">
                    {errors.fechaRegistro}
                  </Typography>
                )}
              </div>
            </div>
            <div>
              <TextField
                fullWidth
                label="Detalles Adicionales"
                name="detalleSancion"
                value={formData.detalleSancion || ""}
                onChange={handleChange}
                helperText="Información adicional sobre la sanción (opcional)"
                variant="outlined"
                size="small"
                multiline
                rows={3}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <div>
            {sancion?.id && onDelete && (
              <Button onClick={handleDelete} color="error" disabled={loading}>
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            )}
          </div>
          <div>
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Guardando..." : sancion ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SancionDialog;
