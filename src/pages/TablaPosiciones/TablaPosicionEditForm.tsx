import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
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
  const [formData, setFormData] = React.useState<TablaPosicionRequest>(() => ({
    subcategoriaId: posicion.subcategoriaId || 0,
    equipoId: posicion.equipoId || 0,
    partidosJugados: posicion.partidosJugados ?? 0,
    victorias: posicion.victorias ?? 0,
    derrotas: posicion.derrotas ?? 0,
    empates: posicion.empates ?? 0,
    puntos: posicion.puntos ?? 0,
    golesAFavor: posicion.golesAFavor ?? 0,
    golesEnContra: posicion.golesEnContra ?? 0,
    diferenciaGoles: posicion.diferenciaGoles ?? 0,
  }));
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof TablaPosicionRequest, string>>
  >({});
  const [loadingData, setLoadingData] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load team position data when component mounts or when posicion prop changes
  React.useEffect(() => {
    const loadPositionData = async () => {
      if (!posicion?.subcategoriaId || !posicion?.equipoId) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const response = await tablaPosicionService.getPosicionEquipo(
          posicion.subcategoriaId,
          posicion.equipoId
        );

        if (response.success && response.data) {
          const { data } = response;
          setFormData({
            subcategoriaId: data.subcategoriaId,
            equipoId: data.equipoId,
            partidosJugados: data.partidosJugados,
            victorias: data.victorias,
            derrotas: data.derrotas,
            empates: data.empates,
            puntos: data.puntos,
            golesAFavor: data.golesAFavor,
            golesEnContra: data.golesEnContra,
            diferenciaGoles: data.diferenciaGoles,
          });
        }
      } catch (err) {
        console.error("Error al cargar los datos de la posición:", err);
        setError(
          "No se pudo cargar la información de la posición. Por favor, intente nuevamente."
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      loadPositionData();
    }
  }, [open, posicion.subcategoriaId, posicion.equipoId]);

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

    // If the value is empty, set it to undefined to avoid showing 0
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: undefined
      }));
      setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }

    // Convert to number, removing any non-digit characters
    const numericString = value.replace(/\D/g, '');
    const numericValue = parseInt(numericString, 10);

    const error = validateField(numericValue, false);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: numericValue,
      };

      // If golesAFavor or golesEnContra changes, update diferenciaGoles
      if (name === "golesAFavor" || name === "golesEnContra") {
        const golesAFavor =
          name === "golesAFavor" ? numericValue : prev.golesAFavor ?? 0;
        const golesEnContra =
          name === "golesEnContra" ? numericValue : prev.golesEnContra ?? 0;
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

  const handleCloseError = () => {
    setError(null);
  };

  if (loadingData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "1.25rem",
              fontWeight: 500,
              lineHeight: 1.6,
              letterSpacing: "0.0075em",
            }}
          >
            Editar Posición en la Tabla
            <IconButton onClick={onClose} size="small" edge="end">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  name="puntos"
                  label="Puntos"
                  type="number"
                  value={formData.puntos ?? ''}
                  onChange={handleChange}
                  error={!!errors.puntos}
                  helperText={errors.puntos}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />

                <TextField
                  fullWidth
                  name="partidosJugados"
                  label="Partidos Jugados"
                  type="number"
                  value={formData.partidosJugados}
                  onChange={handleChange}
                  error={!!errors.partidosJugados}
                  helperText={errors.partidosJugados}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  name="victorias"
                  label="Victorias"
                  type="number"
                  value={formData.victorias}
                  onChange={handleChange}
                  error={!!errors.victorias}
                  helperText={errors.victorias}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />

                <TextField
                  fullWidth
                  name="empates"
                  label="Empates"
                  type="number"
                  value={formData.empates}
                  onChange={handleChange}
                  error={!!errors.empates}
                  helperText={errors.empates}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  name="derrotas"
                  label="Derrotas"
                  type="number"
                  value={formData.derrotas}
                  onChange={handleChange}
                  error={!!errors.derrotas}
                  helperText={errors.derrotas}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />

                <TextField
                  fullWidth
                  name="golesAFavor"
                  label="Goles a Favor"
                  type="number"
                  value={formData.golesAFavor}
                  onChange={handleChange}
                  error={!!errors.golesAFavor}
                  helperText={errors.golesAFavor}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  name="golesEnContra"
                  label="Goles en Contra"
                  type="number"
                  value={formData.golesEnContra}
                  onChange={handleChange}
                  error={!!errors.golesEnContra}
                  helperText={errors.golesEnContra}
                  variant="outlined"
                  size="small"
                  inputProps={{
                    min: 0,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                />
              </Box>

              <TextField
                fullWidth
                name="diferenciaGoles"
                label="Diferencia de Goles"
                type="number"
                value={formData.diferenciaGoles ?? 0}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{
                  'aria-readonly': true,
                  style: { backgroundColor: '#f5f5f5' },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outlined"
              color="inherit"
              sx={{ minWidth: 100 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
              sx={{ minWidth: 140, ml: 1 }}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default TablaPosicionEditForm;
