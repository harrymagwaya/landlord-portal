import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
 import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// recharts
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// icons
import FundOutlined from '@ant-design/icons/FundOutlined';

// fake data (replace with API later)
const riskData = [
  { name: 'Low Risk', value: 60 },
  { name: 'Medium Risk', value: 25 },
  { name: 'High Risk', value: 15 }
];

const scoreTrend = [
  { month: 'Jan', score: 650 },
  { month: 'Feb', score: 670 },
  { month: 'Mar', score: 690 },
  { month: 'Apr', score: 720 }
];

const COLORS = ['#52c41a', '#faad14', '#ff4d4f'];

export default function RiskAnalyticsDashboard() {
  return (
    <Grid container rowSpacing={3}>
      {/* HEADER */}
      <Grid size={12}>
        <PageHeader
          title="Risk Analytics Dashboard"
          description="Overview of tenant risk distribution & scoring trends"
          icon={FundOutlined}
        />
      </Grid>

      {/* KPI CARDS */}
      <Grid size={4}>
        <MainCard>
          <Typography variant="h6">Avg Score</Typography>
          <Typography variant="h3">685</Typography>
        </MainCard>
      </Grid>

      <Grid size={4}>
        <MainCard>
          <Typography variant="h6">High Risk Tenants</Typography>
          <Typography variant="h3">15%</Typography>
        </MainCard>
      </Grid>

      <Grid size={4}>
        <MainCard>
          <Typography variant="h6">Default Rate</Typography>
          <Typography variant="h3">4.2%</Typography>
        </MainCard>
      </Grid>

      {/* PIE CHART */}
      <Grid size={6}>
        <MainCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={100}>
                {riskData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </MainCard>
      </Grid>

      {/* BAR CHART */}
      <Grid size={6}>
        <MainCard title="Score Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
