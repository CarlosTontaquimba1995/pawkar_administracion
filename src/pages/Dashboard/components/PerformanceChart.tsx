import { useTheme } from '@mui/material/styles';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Ene', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Abr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
  { name: 'Ago', value: 4000 },
  { name: 'Sep', value: 5000 },
  { name: 'Oct', value: 3890 },
  { name: 'Nov', value: 4300 },
  { name: 'Dic', value: 5100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ margin: 0, color: '#666' }}>{`${label}`}</p>
        <p style={{ margin: '4px 0 0', color: '#3f51b5', fontWeight: 500 }}>
          {`${payload[0].value} participantes`}
        </p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = () => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          width={35}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={theme.palette.primary.main}
          fillOpacity={1}
          fill="url(#colorValue)"
          strokeWidth={2}
          activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: 'white' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
