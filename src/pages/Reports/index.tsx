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
  Paper,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  AlertColor,
} from "@mui/material";
// Import jsPDF with autoTable plugin
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import DataTable from "@/components/common/DataTable/DataTable";

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
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as AlertColor,
  });

  const showSnackbar = (message: string, severity: AlertColor = "info") => {
    setSnackbar({ open: true, message, severity });
  };

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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

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
  const [teamReportData, setTeamReportData] = useState<any[]>([]);
  const [teamReportLoading, setTeamReportLoading] = useState<boolean>(false);

  // Table columns
  const columns = [
    {
      id: "jugadorNombreCompleto",
      label: "Jugador",
      minWidth: 200,
    },
    {
      id: "equipoNombre",
      label: "Equipo",
      minWidth: 150,
    },
    {
      id: "rolNombre",
      label: "Rol",
      minWidth: 120,
    },
    {
      id: "numeroCamiseta",
      label: "Camiseta",
      align: "center" as const,
      minWidth: 100,
    },
  ];

  // Handle page change
  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Handle report generation for a specific team
  const handleGenerateTeamReport = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      const plantillasData = await plantillaService.getPlantillasByEquipo(
        selectedTeam
      );
      const plantillasList = plantillasData.data || [];
      setPlantillas(plantillasList);
      setTotalRows(plantillasList.length);
      generatePDF("team", plantillasList);
    } catch (error) {
      showSnackbar("Error al generar el reporte del equipo", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle report generation for all plantillas in subcategoría
  const handleGenerateAllReport = async () => {
    if (!selectedSubcategoria) return;

    try {
      setLoading(true);
      const plantillasData = await plantillaService.getPlantillasBySubcategoria(
        selectedSubcategoria
      );
      const plantillasList = plantillasData.data || [];
      setPlantillas(plantillasList);
      setTotalRows(plantillasList.length);
      generatePDF("all", plantillasList);
    } catch (error) {
      showSnackbar("Error al generar el reporte", "error");
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
    setPage(0); // Reset to first page when team changes

    if (teamId) {
      try {
        setLoading(true);
        const plantillasData = await plantillaService.getPlantillasByEquipo(
          teamId
        );
        setPlantillas(plantillasData.data || []);
        setTotalRows(plantillasData.data?.length || 0);
      } catch (error) {
        console.error("Error loading plantillas:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setPlantillas([]);
      setTotalRows(0);
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

  // Generate Team Report
  const generateTeamReport = async () => {
    if (!selectedSubcategoria) {
      showSnackbar("Por favor seleccione una subcategoría", "warning");
      return;
    }

    try {
      setTeamReportLoading(true);
      showSnackbar("Generando reporte de equipos, por favor espere...", "info");

      const response = await teamService.getTeamsBySubcategoria(
        Number(selectedSubcategoria)
      );
      const teamsData = response.data || [];
      setTeamReportData(teamsData);

      if (teamsData.length === 0) {
        showSnackbar(
          "No hay equipos registrados para esta subcategoría",
          "warning"
        );
        return;
      }

      // Generate PDF
      const doc = new jsPDF();
      const title = "Reporte de Equipos por Subcategoría";
      const subcategoria =
        teamsData[0]?.subcategoriaNombre ||
        subcategorias.find((s) => s.subcategoriaId === selectedSubcategoria)
          ?.nombre ||
        "";
      const date = new Date().toLocaleDateString();

      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 20);

      // Add subcategory and date
      doc.setFontSize(11);
      doc.text(`Subcategoría: ${subcategoria}`, 14, 30);
      doc.text(`Generado el: ${date}`, 14, 35);

      // Prepare data for the table
      const tableData = teamsData.map((team: any, index: number) => [
        index + 1,
        team.nombre || "Sin nombre",
        team.serieNombre || "No especificado",
        team.fundacion
          ? new Date(team.fundacion).toLocaleDateString()
          : "No especificada",
        team.jugadoresCount || 0,
      ]);

      // Add table
      autoTable(doc, {
        head: [
          ["#", "Nombre del Equipo", "Serie", "Fundación", "N° Jugadores"],
        ],
        body: tableData,
        startY: 45,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: "auto" }, // #
          1: { cellWidth: "auto" }, // Nombre del Equipo
          2: { cellWidth: "auto" }, // Serie
          3: { cellWidth: "auto" }, // Fundación
          4: { cellWidth: "auto" }, // N° Jugadores
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
          cellWidth: "wrap",
          valign: "middle",
        },
        margin: { top: 10 },
        didDrawPage: function (data) {
          // Footer
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(
            `Página ${data.pageNumber}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        },
      });

      // Save the PDF with a more descriptive name
      const subcategoriaSlug = subcategoria.toLowerCase().replace(/\s+/g, "_");
      doc.save(
        `reporte_equipos_${subcategoriaSlug}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
      showSnackbar("Reporte de equipos generado exitosamente", "success");
    } catch (error) {
      console.error("Error generating team report:", error);
      showSnackbar("Error al generar el reporte de equipos", "error");
    } finally {
      setTeamReportLoading(false);
    }
  };

  // Generate PDF report
  const generatePDF = async (
    reportType: "team" | "all" = "team",
    plantillasData?: any[]
  ) => {
    try {
      showSnackbar("Generando reporte, por favor espere...", "info");

      // Use the passed data or fall back to the state
      const dataToUse = plantillasData || plantillas;

      // Check if there's any data
      if (!dataToUse || dataToUse.length === 0) {
        showSnackbar(
          "No hay datos disponibles para generar el reporte",
          "warning"
        );
        return;
      }

      // Initialize jsPDF
      // Initialize jsPDF
      const doc = new jsPDF();
      const title = "Reporte de Plantillas";
      const date = new Date().toLocaleDateString();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yOffset = 20;

      // Add title
      doc.setFontSize(18);
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, yOffset);
      yOffset += 10;

      // Add date
      doc.setFontSize(11);
      doc.text(`Generado el: ${date}`, 14, yOffset);
      yOffset += 10;

      // Add subcategory info if available
      const selectedSubcat = subcategorias.find(
        (s) => s.subcategoriaId === selectedSubcategoria
      );
      if (selectedSubcat) {
        doc.text(`Subcategoría: ${selectedSubcat.nombre}`, 14, yOffset);
        yOffset += 8;
      }

      // Add report type specific information
      if (reportType === "team" && selectedTeam) {
        const team = teams.data.find((t) => t.equipoId === selectedTeam);
        if (team) {
          doc.text(`Tipo de Reporte: Por Equipo`, 14, yOffset);
          yOffset += 8;
          doc.text(`Equipo: ${team.nombre}`, 14, yOffset);
          yOffset += 8;
          const serieName =
            series.find((s) => s.serieId === selectedSerie)?.nombre || "";
          doc.text(`Serie: ${serieName}`, 14, yOffset);
          yOffset += 15; // Extra space before the table
        }
      } else if (reportType === "all" && selectedSubcategoria) {
        const subcategoria = subcategorias.find(
          (s) => s.subcategoriaId === selectedSubcategoria
        );
        doc.text(`Tipo de Reporte: Todas las Plantillas`, 14, yOffset);
        yOffset += 8;
        doc.text(`Subcategoría: ${subcategoria?.nombre || ""}`, 14, yOffset);
        yOffset += 15; // Extra space before the table
      }

      // Prepare data for the table
      const tableData = dataToUse.map((plantilla) => ({
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
                onClick={() => generatePDF("all")}
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

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateTeamReport}
                disabled={!selectedTeam || loading}
                startIcon={<DescriptionIcon />}
                sx={{ minWidth: 200 }}
              >
                {loading ? "Generando..." : "Reporte por Equipo"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGenerateAllReport}
                disabled={!selectedSubcategoria || loading}
                startIcon={<DescriptionIcon />}
                sx={{ minWidth: 200 }}
              >
                {loading ? "Generando..." : "Todas las Plantillas"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Team Report Section */}
        <Paper sx={{ p: 3, mb: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Reporte de Equipos por Subcategoría
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel id="subcategoria-select-label">
                Subcategoría
              </InputLabel>
              <Select
                labelId="subcategoria-select-label"
                value={selectedSubcategoria}
                label="Subcategoría"
                onChange={(e) =>
                  setSelectedSubcategoria(Number(e.target.value))
                }
                disabled={loading || teamReportLoading}
              >
                {subcategorias.map((subcategoria) => (
                  <MenuItem
                    key={subcategoria.subcategoriaId}
                    value={subcategoria.subcategoriaId}
                  >
                    {subcategoria.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={generateTeamReport}
              disabled={!selectedSubcategoria || teamReportLoading}
              startIcon={<PrintIcon />}
            >
              {teamReportLoading
                ? "Generando..."
                : "Generar Reporte de Equipos"}
            </Button>
          </Box>

          {teamReportData.length > 0 && (
            <Box mt={2}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                {teamReportData.length} equipos encontrados
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {teamReportData.map((team, index) => (
                  <Box
                    key={team.equipoId}
                    sx={{ py: 1, borderBottom: "1px solid #eee" }}
                  >
                    <Typography variant="body2">
                      {index + 1}. {team.nombre} -{" "}
                      {team.representante || "Sin representante"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            {selectedTeam
              ? `Viendo plantillas del equipo: ${
                  teams.data.find((t) => t.equipoId === selectedTeam)?.nombre ||
                  ""
                }`
              : selectedSubcategoria
              ? `Viendo todas las plantillas de: ${
                  subcategorias.find(
                    (s) => s.subcategoriaId === selectedSubcategoria
                  )?.nombre || "la subcategoría seleccionada"
                }`
              : "Seleccione una subcategoría para ver las plantillas"}
          </Typography>
          <DataTable
            columns={columns}
            data={plantillas}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRows={totalRows}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            emptyMessage={
              selectedTeam || selectedSubcategoria
                ? "No se encontraron plantillas para los filtros seleccionados."
                : "Seleccione una subcategoría para ver las plantillas disponibles."
            }
          />
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Reports;
