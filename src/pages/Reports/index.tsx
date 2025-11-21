import React, { useState, useEffect } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
// Import jsPDF with autoTable plugin
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";

// Import services
import plantillaService from "../../api/plantillaService";
import categoriaService from "../../api/categoriaService";
import subcategoriaService from "../../api/subcategoriaService";
import serieService from "../../api/serieService";
import teamService from "../../api/teamService";

// Import types
import { Subcategoria } from "../../types/subcategoria.types";
import { TeamListResponse } from "../../types/team.types";
import { Plantilla } from "../../types/plantilla.types";

const Reports: React.FC = () => {
  // State for categories, subcategories, series, teams, and plantillas
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [series, setSeries] = useState<
    Array<{ serieId: number; nombre: string }>
  >([]);
  const [teams, setTeams] = useState<TeamListResponse>({
    data: [],
    success: false,
    message: "",
    timestamp: new Date().toISOString(),
  });
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);

  // Selected values
  const [_, setSelectedCategoria] = useState<string>("");
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<number | "">(
    ""
  );
  const [selectedSerie, setSelectedSerie] = useState<number | "">("");
  const [selectedTeam, setSelectedTeam] = useState<number | "">("");

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);

      // Get the plantillas for the selected team
      const plantillasData = await plantillaService.getPlantillasByEquipo(
        selectedTeam
      );
      setPlantillas(plantillasData.data || []);

      // Generate the PDF with the plantillas data
      generatePDF();
    } catch (error) {
      console.error("Error generating report:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  // Fetch all plantillas on component mount
  useEffect(() => {
    fetchAllPlantillas();
  }, []);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingFilters(true);

        // Load DEPORTES category
        const response = await categoriaService.getCategoriaByNemonico(
          "DEPORTES"
        );
        setSelectedCategoria(response.data?.categoriaId.toString() || "");

        // Load subcategories for DEPORTES
        if (response.data?.categoriaId) {
          const subcats = await subcategoriaService.getSubcategoriasByCategoria(
            parseInt(response.data.categoriaId.toString())
          );
          setSubcategorias(subcats.data);
        }

        // Initialize empty teams list
        setTeams({
          data: [],
          success: true,
          message: "Seleccione una subcategoría y serie para ver los equipos",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error loading initial data:", error);
        setTeams({
          data: [],
          success: false,
          message: "Error al cargar los datos iniciales",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoadingFilters(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle subcategory change
  const handleSubcategoriaChange = async (subcategoriaId: number) => {
    setSelectedSubcategoria(subcategoriaId);
    setSelectedSerie("");
    setSelectedTeam("");
    setPlantillas([]);

    if (subcategoriaId) {
      try {
        setLoadingFilters(true);
        const seriesData = await serieService.getSeriesBySubcategoria(
          subcategoriaId
        );

        const formattedSeries = (seriesData.data || []).map((serie: any) => ({
          serieId: serie.serieId,
          nombre: serie.nombreSerie || serie.nombre || "",
        }));
        setSeries(formattedSeries);
      } catch (error) {
        console.error("Error loading series:", error);
      } finally {
        setLoadingFilters(false);
      }
    }
  };

  // Handle serie change
  const handleSerieChange = async (serieId: number) => {
    setSelectedSerie(serieId);
    setSelectedTeam("");
    setPlantillas([]);

    if (serieId) {
      try {
        setLoadingFilters(true);
        const teamsData = await teamService.getTeamsBySerie(serieId);
        setTeams({
          data: teamsData.data || [],
          success: true,
          message:
            teamsData.data?.length === 0
              ? "No hay equipos registrados en esta serie"
              : "",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error loading teams by serie:", error);
        setTeams({
          data: [],
          success: false,
          message: "Error al cargar los equipos",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoadingFilters(false);
      }
    } else {
      // Clear teams when no serie is selected
      setTeams({
        data: [],
        success: false,
        message: "Seleccione una serie para ver los equipos disponibles",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Handle team change
  const handleTeamChange = async (teamId: number) => {
    setSelectedTeam(teamId);

    if (teamId) {
      try {
        setLoading(true);
        const plantillasData = await plantillaService.getPlantillasByEquipo(
          teamId
        );
        setPlantillas(plantillasData.data || []);
      } catch (error) {
        console.error("Error loading plantillas:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setPlantillas([]);
    }
  };

  // Fetch all plantillas
  const fetchAllPlantillas = async () => {
    try {
      setLoading(true);
      const response = await plantillaService.getAllPlantillas();
      setPlantillas(response.data || []);
      setSelectedCategoria("");
      setSelectedSubcategoria("");
      setSelectedSerie("");
      setSelectedTeam("");
    } catch (error) {
      console.error("Error fetching all plantillas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    try {
      // Initialize jsPDF
      const doc = new jsPDF();
      const title = "Reporte de Plantillas";
      const date = new Date().toLocaleDateString();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add title
      doc.setFontSize(18);
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 20);

      // Add date
      doc.setFontSize(11);
      doc.text(`Generado el: ${date}`, 14, 30);

      // Add team info if a specific team is selected
      if (selectedTeam) {
        const team = teams.data.find((t) => t.equipoId === selectedTeam);
        if (team) {
          doc.text(`Equipo: ${team.nombre}`, 14, 40);
          const serieName =
            series.find((s) => s.serieId === selectedSerie)?.nombre || "";
          doc.text(`Serie: ${serieName}`, 14, 48);
        }
      }

      // Prepare data for the table
      const tableData = plantillas.map((plantilla) => ({
        jugador: plantilla?.jugadorNombreCompleto || "Sin nombre",
        equipo: plantilla?.equipoNombre || "Sin equipo",
        rol: plantilla?.rolNombre || "Sin rol",
        camiseta: plantilla?.numeroCamiseta?.toString() || "N/A",
      }));

      // Add table
      if (tableData.length > 0) {
        // Use the imported autoTable function directly
        autoTable(doc, {
          head: [["Jugador", "Equipo", "Rol", "Camiseta"]],
          body: tableData.map((item) => [
            item.jugador,
            item.equipo,
            item.rol,
            item.camiseta,
          ]),
          startY: 60,
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
          },
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          margin: { top: 10 },
        });
      } else {
        doc.text("No hay datos para mostrar en la tabla", 14, 60);
      }

      // Save the PDF
      const fileName = `reporte_plantillas_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      // Aquí podrías agregar una notificación al usuario
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Reportes de Plantillas
          </Typography>
          <Box>
            <Tooltip title="Generar PDF">
              <IconButton
                onClick={generatePDF}
                disabled={plantillas.length === 0 || loading}
                color="primary"
                sx={{ mr: 1 }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar">
              <IconButton
                onClick={fetchAllPlantillas}
                disabled={loading}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <FormControl
                sx={{ minWidth: 200 }}
                size="small"
                disabled={loadingFilters}
              >
                <InputLabel id="subcategoria-label">Subcategoría</InputLabel>
                <Select
                  labelId="subcategoria-label"
                  id="subcategoria"
                  value={selectedSubcategoria}
                  label="Subcategoría"
                  onChange={(e) =>
                    handleSubcategoriaChange(Number(e.target.value))
                  }
                >
                  {subcategorias.map((subcat) => (
                    <MenuItem
                      key={subcat.subcategoriaId}
                      value={subcat.subcategoriaId}
                    >
                      {subcat.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                sx={{ minWidth: 200 }}
                size="small"
                disabled={loadingFilters || !selectedSubcategoria}
              >
                <InputLabel id="serie-label">Serie</InputLabel>
                <Select
                  labelId="serie-label"
                  id="serie"
                  value={selectedSerie}
                  label="Serie"
                  onChange={(e) => handleSerieChange(Number(e.target.value))}
                >
                  {series.map((serie) => (
                    <MenuItem key={serie.serieId} value={serie.serieId}>
                      {serie.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                variant="outlined"
                sx={{ minWidth: 200 }}
                size="small"
                disabled={
                  loadingFilters || !selectedSubcategoria || !selectedSerie
                }
              >
                <InputLabel
                  id="team-label"
                  shrink={true}
                  sx={{
                    backgroundColor: "white",
                    px: 1,
                    ml: -1,
                    "&.MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)",
                    },
                  }}
                >
                  Equipo
                </InputLabel>
                <Select
                  labelId="team-label"
                  id="team"
                  value={selectedTeam}
                  label="Equipo"
                  onChange={(e) => handleTeamChange(Number(e.target.value))}
                  displayEmpty
                  disabled={
                    loadingFilters || !selectedSubcategoria || !selectedSerie
                  }
                  sx={{
                    "& .MuiSelect-select": {
                      color: selectedTeam ? "inherit" : "rgba(0, 0, 0, 0.6)",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <em style={{ color: "rgba(0, 0, 0, 0.6)" }}>
                      Seleccione un equipo
                    </em>
                  </MenuItem>
                  {teams.data && teams.data.length > 0 ? (
                    teams.data.map((team) => (
                      <MenuItem key={team.equipoId} value={team.equipoId}>
                        {team.nombre}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hay equipos disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={!selectedTeam || loading}
                startIcon={<DescriptionIcon />}
              >
                {loading ? "Generando..." : "Generar Reporte"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jugador</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Camiseta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plantillas.length > 0 ? (
                  plantillas.map((plantilla) => (
                    <TableRow
                      key={`${plantilla.equipoId}-${plantilla.jugadorId}`}
                    >
                      <TableCell>
                        {plantilla.jugadorNombreCompleto || ""}
                      </TableCell>
                      <TableCell>{plantilla.equipoNombre || ""}</TableCell>
                      <TableCell>{plantilla.rolNombre || ""}</TableCell>
                      <TableCell>{plantilla.numeroCamiseta || ""}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay datos para mostrar. Seleccione un equipo o haga
                      clic en "Mostrar Todos".
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default Reports;
