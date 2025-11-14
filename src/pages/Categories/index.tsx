import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import CategoriaRegisterForm from "./components/Categorias/CategoriaRegisterForm";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { Categoria } from "../../types/categoria.types";
import { categoriaService } from "../../api/categoriaService";
import { Subcategoria } from "@/types/subcategoria.types";
import serieService from "@/api/serieService";
import subcategoriaService from "@/api/subcategoriaService";
import { Serie } from "@/types/serie.types";
import SubcategoriesTable from "./components/Subcategorias/SubcategoriesTable";
import RegisterSubcategoriaForm from "./components/Subcategorias/RegisterSubcategoriaForm";
import CategoriesTable from "./components/Categorias/CategoriesTable";
import SeriesTable from "./components/Series/SeriesTable";
import SerieRegisterForm from "./components/Series/SerieRegisterForm";
import SerieEditForm from "./components/Series/SerieEditForm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ width: "100%" }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: isMobile ? 1 : 3,
            width: "100%",
            overflowX: "auto",
          }}
        >
          <div style={{ minWidth: isMobile ? "100%" : "auto" }}>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const CategoriesPage: React.FC = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [catRes, subRes, serRes] = await Promise.all([
        categoriaService.getCategorias(),
        subcategoriaService.getSubcategorias(),
        serieService.getSeriesBySubcategoria(1),
      ]);
      console.log(catRes);
      setCategories(catRes.data);
      const deportesSubcategories = subRes.data.filter((sub: Subcategoria) =>
        catRes.data.some(
          (
            cat: any // Using 'any' here since we know the data structure
          ) =>
            cat.categoriaId === sub.categoriaId && cat.nemonico === "DEPORTES"
        )
      );
      console.log(deportesSubcategories);
      setSubcategories(deportesSubcategories);
      setSeries(serRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSubcategoriaForm, setShowAddSubcategoriaForm] = useState(false);
  const [showAddSerieForm, setShowAddSerieForm] = useState(false);
  const [editingSerieId, setEditingSerieId] = useState<number | null>(null);

  const handleAddNew = () => {
    if (tabValue === 0) {
      setShowAddForm(true);
    } else if (tabValue === 1) {
      setShowAddSubcategoriaForm(true);
    } else if (tabValue === 2) {
      setShowAddSerieForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleSuccess = async () => {
    setShowAddForm(false);
    await fetchData(); // Refresh the data
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box
      sx={{
        width: "100%",
        p: isMobile ? 1 : 3,
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {/* Tabs Section */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? true : false}
          allowScrollButtonsMobile
          sx={{
            minWidth: isMobile ? "max-content" : "auto",
            "& .MuiTab-root": {
              minWidth: isMobile ? "auto" : 160,
              px: isMobile ? 2 : 3,
              fontSize: isMobile ? "0.8rem" : "0.875rem",
              textTransform: "none",
              minHeight: "48px",
            },
          }}
        >
          <Tab label="Categorías" {...a11yProps(0)} />
          <Tab label="Subcategorías" {...a11yProps(1)} />
          <Tab label="Series" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Card
        elevation={isMobile ? 0 : 1}
        sx={{
          borderRadius: isMobile ? 0 : 2,
          width: "100%",
          maxWidth: "100vw",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: isMobile ? 2 : 3,
            "&:last-child": { pb: isMobile ? 2 : 3 },
          }}
        >
          {/* Header Section */}
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            justifyContent="space-between"
            alignItems={isMobile ? "stretch" : "center"}
            gap={2}
            mb={3}
            width="100%"
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component="h2"
              sx={{
                fontWeight: 600,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              {tabValue === 0
                ? "Categorías"
                : tabValue === 1
                ? "Subcategorías"
                : "Series"}
            </Typography>
            <Button
              fullWidth={isMobile}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              size={isMobile ? "medium" : "large"}
              sx={{
                whiteSpace: "nowrap",
                minWidth: isMobile ? "100%" : "auto",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { boxShadow: theme.shadows[3] },
              }}
            >
              Agregar{" "}
              {!isMobile &&
                (tabValue === 0
                  ? "Categoría"
                  : tabValue === 1
                  ? "Subcategoría"
                  : "Serie")}
            </Button>
          </Box>

          {/* Tab Content */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <TabPanel value={tabValue} index={0}>
              <CategoriesTable categories={categories} onRefresh={fetchData} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <SubcategoriesTable
                subcategories={subcategories}
                categories={categories}
                onRefresh={fetchData}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <SeriesTable
                series={series}
                subcategorias={subcategories}
                onRefresh={fetchData}
                onEdit={(id) => setEditingSerieId(id)}
              />
            </TabPanel>
          </Box>
        </CardContent>
      </Card>

      {/* Categoria Register Form Modal */}
      <CategoriaRegisterForm
        open={showAddForm}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />
      <RegisterSubcategoriaForm
        open={showAddSubcategoriaForm}
        onClose={() => setShowAddSubcategoriaForm(false)}
        onSuccess={handleSuccess}
      />
      <SerieRegisterForm
        open={showAddSerieForm}
        onClose={() => setShowAddSerieForm(false)}
        onSuccess={handleSuccess}
        subcategorias={subcategories}
      />
      <SerieEditForm
        open={!!editingSerieId}
        onClose={() => setEditingSerieId(null)}
        onSuccess={handleSuccess}
        serieId={editingSerieId || 0}
      />
    </Box>
  );
};

export default CategoriesPage;
