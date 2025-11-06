// src/pages/TablaPosiciones/TablaPosicionRegisterForm.tsx
import React, { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { TablaPosicionRequest } from "@/types/tablaPosicion.types";
import tablaPosicionService from "@/api/tablaPosicionService";
import subcategoriaService from "@/api/subcategoriaService";
import teamService from "@/api/teamService";
import { Subcategoria } from "@/types/subcategoria.types";
import { Team } from "@/types/team.types";

interface TablaPosicionRegisterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TablaPosicionRegisterForm: React.FC<TablaPosicionRegisterFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [equipos, setEquipos] = useState<Team[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);

  const [formData, setFormData] = useState<TablaPosicionRequest>({
    subcategoriaId: 0,
    equipoId: 0,
    partidosJugados: 0,
    victorias: 0,
    derrotas: 0,
    empates: 0,
    puntos: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    diferenciaGoles: 0,
  });

  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const data = await subcategoriaService.getSubcategorias();
        setSubcategorias(data.data);
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar subcategorías",
          severity: "error",
        });
      }
    };

    if (open) {
      fetchSubcategorias();
      setFormData({
        subcategoriaId: 0,
        equipoId: 0,
        partidosJugados: 0,
        victorias: 0,
        derrotas: 0,
        empates: 0,
        puntos: 0,
        golesAFavor: 0,
        golesEnContra: 0,
        diferenciaGoles: 0,
      });
    }
  }, [open]);

  const handleSubcategoriaChange = async (event: SelectChangeEvent<number>) => {
    const subcategoriaId = event.target.value;
    setFormData((prev) => ({ ...prev, subcategoriaId, equipoId: 0 }));

    if (subcategoriaId) {
      try {
        setLoadingEquipos(true);
        const data = await teamService.getTeamsBySubcategoria(subcategoriaId);
        setEquipos(data.data);
      } catch (error) {
        console.error("Error al cargar equipos:", error);
        setSnackbar({
          open: true,
          message: "Error al cargar equipos",
          severity: "error",
        });
      } finally {
        setLoadingEquipos(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: Number(value),
      };
      
      // If golesAFavor or golesEnContra changes, update diferenciaGoles
      if (name === 'golesAFavor' || name === 'golesEnContra') {
        const golesAFavor = name === 'golesAFavor' ? Number(value) : prev.golesAFavor;
        const golesEnContra = name === 'golesEnContra' ? Number(value) : prev.golesEnContra;
        newData.diferenciaGoles = golesAFavor - golesEnContra;
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await tablaPosicionService.saveOrUpdate(formData);
      setSnackbar({
        open: true,
        message: "Posición guardada exitosamente",
        severity: "success",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar la posición:", error);
      setSnackbar({
        open: true,
        message: "Error al guardar la posición",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nueva Posición en la Tabla</DialogTitle>
        <DialogContent>
          <Box mt={2} mb={2}>
            <Typography variant="subtitle1" color="textSecondary">
              Complete los datos de la posición
            </Typography>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Subcategoría</InputLabel>
            <Select
              name="subcategoriaId"
              value={formData.subcategoriaId}
              onChange={handleSubcategoriaChange}
              label="Subcategoría"
              required
            >
              <MenuItem value={0} disabled>
                Seleccione una subcategoría
              </MenuItem>
              {subcategorias.map((sub) => (
                <MenuItem key={sub.subcategoriaId} value={sub.subcategoriaId}>
                  {sub.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Equipo</InputLabel>
            <Select
              name="equipoId"
              value={formData.equipoId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  equipoId: e.target.value as number,
                }))
              }
              label="Equipo"
              disabled={!formData.subcategoriaId || loadingEquipos}
              required
            >
              <MenuItem value={0} disabled>
                {loadingEquipos
                  ? "Cargando equipos..."
                  : "Seleccione un equipo"}
              </MenuItem>
              {equipos.map((equipo) => (
                <MenuItem key={equipo.equipoId} value={equipo.equipoId}>
                  {equipo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            name="victorias"
            label="Victorias"
            type="number"
            value={formData.victorias}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="empates"
            label="Empates"
            type="number"
            value={formData.empates}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="derrotas"
            label="Derrotas"
            type="number"
            value={formData.derrotas}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="puntos"
            label="Puntos"
            type="number"
            value={formData.puntos}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="partidosJugados"
            label="Partidos Jugados"
            type="number"
            value={formData.partidosJugados}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="golesAFavor"
            label="Goles a Favor"
            type="number"
            value={formData.golesAFavor}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="golesEnContra"
            label="Goles en Contra"
            type="number"
            value={formData.golesEnContra}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            name="diferenciaGoles"
            label="Diferencia de Goles"
            type="number"
            value={formData.diferenciaGoles}
            InputProps={{
              readOnly: true,
            }}
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
            {loading ? <CircularProgress size={24} /> : "Guardar"}
          </Button>
        </DialogActions>
      </form>

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
    </Dialog>
  );
};

export default TablaPosicionRegisterForm;
