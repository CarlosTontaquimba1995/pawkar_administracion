import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CategoriaRegisterForm from "./components/Categorias/CategoriaRegisterForm";
import RegisterSubcategoriaForm from "./components/Subcategorias/RegisterSubcategoriaForm";
import SerieRegisterForm from "./components/Series/SerieRegisterForm";
import SerieEditForm from "./components/Series/SerieEditForm";
import CategoriesTable from "./components/Categorias/CategoriesTable";
import SubcategoriesTable from "./components/Subcategorias/SubcategoriesTable";
import SeriesTable from "./components/Series/SeriesTable";
import categoriaService from "@/api/categoriaService";
import subcategoriaService from "@/api/subcategoriaService";
import serieService from "@/api/serieService";
import { Categoria } from "@/types/categoria.types";
import { Subcategoria } from "@/types/subcategoria.types";
import { Serie } from "@/types/serie.types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSubcategoriaForm, setShowAddSubcategoriaForm] = useState(false);
  const [showAddSerieForm, setShowAddSerieForm] = useState(false);
  const [editingSerieId, setEditingSerieId] = useState<number | null>(null);
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [catRes, subRes, serRes] = await Promise.all([
        categoriaService.getCategorias(),
        subcategoriaService.getSubcategorias(),
        serieService.getSeriesBySubcategoria(1),
      ]);

      setCategories(catRes.data);
      const deportesSubcategories = subRes.data.filter((sub: Subcategoria) =>
        catRes.data.some(
          (cat: Categoria) => cat.categoriaId === sub.categoriaId
        )
      );
      setSubcategories(deportesSubcategories);
      setSeries(serRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddNew = () => {
    if (tabValue === 0) {
      setShowAddForm(true);
    } else if (tabValue === 1) {
      setShowAddSubcategoriaForm(true);
    } else {
      setShowAddSerieForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleSuccess = () => {
    fetchData();
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
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Card
        elevation={isMobile ? 0 : 1}
        sx={{
          borderRadius: isMobile ? 0 : 2,
          width: isMobile ? "100%" : "600px",
          maxWidth: "100%",
          margin: "0 auto",
          overflow: "hidden",
          transition: "all 0.3s ease-in-out",
          minHeight: "500px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: isMobile ? 2 : 3,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            "&:last-child": {
              pb: isMobile ? 2 : 3,
            },
          }}
        >
          {/* Button moved here, inside CardContent but before Tabs */}
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            justifyContent="flex-end"
            alignItems={isMobile ? "stretch" : "center"}
            gap={2}
            mb={3}
          >
            <Button
              fullWidth={isMobile}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              size={isMobile ? "medium" : "large"}
              sx={{
                whiteSpace: "nowrap",
                minWidth: isMobile ? "100%" : "220px",
                width: isMobile ? "100%" : "220px",
                textTransform: "none",
                fontWeight: 500,
                borderRadius: 2,
                boxShadow: "none",
                px: 3,
                justifyContent: "center",
                "&:hover": {
                  boxShadow: theme.shadows[3],
                  backgroundColor: "primary.dark",
                },
                "& .MuiButton-startIcon": {
                  marginRight: 1,
                },
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

          {/* Tab Content */}
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: "300px",
              transition: "opacity 0.3s ease-in-out",
              opacity: 1,
              "&.MuiBox-root": {
                transition: "opacity 0.3s ease-in-out",
              },
            }}
          >
            <TabPanel value={tabValue} index={0}>
              <Box
                sx={{
                  transition: "opacity 0.3s ease-in-out",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CategoriesTable
                  categories={categories}
                  onRefresh={fetchData}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{
                  transition: "opacity 0.3s ease-in-out",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <SubcategoriesTable
                  subcategories={subcategories}
                  categories={categories}
                  onRefresh={fetchData}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box
                sx={{
                  transition: "opacity 0.3s ease-in-out",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <SeriesTable
                  series={series}
                  subcategorias={subcategories}
                  onRefresh={fetchData}
                  onEdit={(id) => setEditingSerieId(id)}
                />
              </Box>
            </TabPanel>
          </Box>
        </CardContent>
      </Card>

      {/* Modals */}
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
