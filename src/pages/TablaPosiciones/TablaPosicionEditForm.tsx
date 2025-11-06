import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  TablaPosicion,
  TablaPosicionRequest,
} from "@/types/tablaPosicion.types";
import tablaPosicionService from "@/api/tablaPosicionService";

interface TablaPosicionEditFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  posicion: TablaPosicion;
}

const TablaPosicionEditForm: React.FC<TablaPosicionEditFormProps> = ({
  open,
  onClose,
  onSuccess,
  posicion,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<TablaPosicionRequest>({
    subcategoriaId: posicion.subcategoriaId,
    equipoId: posicion.equipoId,
    partidosJugados: posicion.partidosJugados,
    victorias: posicion.victorias,
    derrotas: posicion.derrotas,
    empates: posicion.empates,
    puntos: posicion.puntos,
    golesAFavor: posicion.golesAFavor,
    golesEnContra: posicion.golesEnContra,
    diferenciaGoles: posicion.diferenciaGoles,
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof TablaPosicionRequest, string>>
  >({});

  const validateField = (value: any, isFullFormValidation = false) => {
    const actualValue = isFullFormValidation ? value[1] : value;
    const numValue = Number(actualValue);
    if (isNaN(numValue) || numValue < 0) {
      return "Debe ser un número mayor o igual a 0";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(value, false);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: Number(value),
      };

      // If golesAFavor or golesEnContra changes, update diferenciaGoles
      if (name === "golesAFavor" || name === "golesEnContra") {
        const golesAFavor =
          name === "golesAFavor" ? Number(value) : prev.golesAFavor;
        const golesEnContra =
          name === "golesEnContra" ? Number(value) : prev.golesEnContra;
        newData.diferenciaGoles = golesAFavor - golesEnContra;
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof TablaPosicionRequest, string>> = {};
    let hasError = false;

    (Object.keys(formData) as Array<keyof TablaPosicionRequest>).forEach(
      (key) => {
        const error = validateField([key, formData[key]], true);
        if (error) {
          newErrors[key] = error;
          hasError = true;
        }
      }
    );

    setErrors(newErrors);
    if (hasError) return;

    try {
      setLoading(true);
      await tablaPosicionService.saveOrUpdate(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar la posición:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Editar Posición en la Tabla</DialogTitle>
        <DialogContent>
          <Box mt={2} mb={2}>
            <Typography variant="subtitle1" color="textSecondary">
              Modifique los datos de la posición
            </Typography>
          </Box>

          <TextField
            fullWidth
            margin="normal"
            name="puntos"
            label="Puntos"
            type="number"
            value={formData.puntos}
            onChange={handleChange}
            error={!!errors.puntos}
            helperText={errors.puntos}
          />

          {/* Add other fields similarly */}
          <TextField
            fullWidth
            margin="normal"
            name="partidosJugados"
            label="Partidos Jugados"
            type="number"
            value={formData.partidosJugados}
            onChange={handleChange}
            error={!!errors.partidosJugados}
            helperText={errors.partidosJugados}
          />

          <TextField
            fullWidth
            margin="normal"
            name="victorias"
            label="Victorias"
            type="number"
            value={formData.victorias}
            onChange={handleChange}
            error={!!errors.victorias}
            helperText={errors.victorias}
          />

          <TextField
            fullWidth
            margin="normal"
            name="empates"
            label="Empates"
            type="number"
            value={formData.empates}
            onChange={handleChange}
            error={!!errors.empates}
            helperText={errors.empates}
          />

          <TextField
            fullWidth
            margin="normal"
            name="derrotas"
            label="Derrotas"
            type="number"
            value={formData.derrotas}
            onChange={handleChange}
            error={!!errors.derrotas}
            helperText={errors.derrotas}
          />

          <TextField
            fullWidth
            margin="normal"
            name="golesAFavor"
            label="Goles a Favor"
            type="number"
            value={formData.golesAFavor}
            onChange={handleChange}
            error={!!errors.golesAFavor}
            helperText={errors.golesAFavor}
          />

          <TextField
            fullWidth
            margin="normal"
            name="golesEnContra"
            label="Goles en Contra"
            type="number"
            value={formData.golesEnContra}
            onChange={handleChange}
            error={!!errors.golesEnContra}
            helperText={errors.golesEnContra}
          />

          <TextField
            fullWidth
            margin="normal"
            name="diferenciaGoles"
            label="Diferencia de Goles"
            type="number"
            value={formData.diferenciaGoles}
            onChange={handleChange}
            error={!!errors.diferenciaGoles}
            helperText={errors.diferenciaGoles}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TablaPosicionEditForm;
