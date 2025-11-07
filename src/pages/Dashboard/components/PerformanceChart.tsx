import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PerformanceChartProps {
  data: Array<{
    name: string;
    jugadores: number;
    equipos: number;
    total: number;
  }>;
  loading?: boolean;
}

// Generar datos acumulados simples
const generateSimpleData = (totalPlayers: number, totalTeams: number) => {
  return [{
    name: 'Total',
    jugadores: totalPlayers,
    equipos: totalTeams,
    total: totalPlayers + totalTeams
  }];
};

const PerformanceChart = ({ data, loading = false }: PerformanceChartProps) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.palette.text.secondary
      }}>
        Cargando datos...
      </div>
    );
  }
  
  // Usar datos proporcionados o generar datos simples
  const chartData = data && data.length > 0 
    ? data 
    : generateSimpleData(0, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barCategoryGap={20}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={theme.palette.divider}
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: theme.palette.text.primary,
            fontSize: 14,
            fontWeight: 500,
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          width={40}
          tickFormatter={(value) => value.toLocaleString("es-ES")}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            boxShadow: theme.shadows[2],
            padding: "12px 16px",
          }}
          formatter={(value: number, name: string) => {
            if (name === "jugadores") return [value, "Jugadores"];
            if (name === "equipos") return [value, "Equipos"];
            return [value, "Total"];
          }}
          labelStyle={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            marginBottom: 4,
          }}
        />
        <Bar
          dataKey="jugadores"
          name="Jugadores"
          fill={theme.palette.primary.main}
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={theme.palette.primary.main} />
          ))}
        </Bar>
        <Bar
          dataKey="equipos"
          name="Equipos"
          fill={theme.palette.secondary.main}
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={theme.palette.secondary.main} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
