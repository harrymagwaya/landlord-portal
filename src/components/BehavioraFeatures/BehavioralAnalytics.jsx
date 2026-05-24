import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import { useBehavioralFeatures } from 'hooks/useBehavioralFeatures';

import FundOutlined from '@ant-design/icons/FundOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function percent(v) {
  return Math.round(Number(v || 0) * 100);
}

function score(record) {
  const metrics = [
    record.rentConsistency,
    record.mobileMoneyVolume,
    record.transactionDiversity,
    record.utilityPayments,
    record.savingsConsistency,
    record.loanRepaymentRate
  ];
  const valid = metrics.filter((m) => m != null);
  if (!valid.length) return 0;
  return Math.round((valid.reduce((a, b) => a + Number(b), 0) / valid.length) * 100);
}

export default function BehavioralAnalytics() {
  const { data, error } = useBehavioralFeatures();
  const rows = useMemo(() => extractList(data), [data]);

  const avgScore = rows.length ? Math.round(rows.reduce((sum, r) => sum + score(r), 0) / rows.length) : 0;
  const lowRisk = rows.filter((r) => score(r) >= 75).length;
  const moderate = rows.filter((r) => score(r) >= 45 && score(r) < 75).length;
  const highRisk = rows.filter((r) => score(r) < 45).length;

  const riskDistribution = [
    { id: 0, label: 'Low Risk', value: lowRisk, color: '#4caf50' },
    { id: 1, label: 'Moderate', value: moderate, color: '#ff9800' },
    { id: 2, label: 'High Risk', value: highRisk, color: '#f44336' }
  ];

  const metrics = ['Rent', 'Mobile', 'Savings', 'Repayment', 'Transactions'];
  const metricValues = [
    Math.round(rows.reduce((s, r) => s + percent(r.rentConsistency), 0) / (rows.length || 1)),
    Math.round(rows.reduce((s, r) => s + percent(r.mobileMoneyVolume), 0) / (rows.length || 1)),
    Math.round(rows.reduce((s, r) => s + percent(r.savingsConsistency), 0) / (rows.length || 1)),
    Math.round(rows.reduce((s, r) => s + percent(r.loanRepaymentRate), 0) / (rows.length || 1)),
    Math.round(rows.reduce((s, r) => s + percent(r.transactionDiversity), 0) / (rows.length || 1))
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Behavior Analytics" description="Behavioral intelligence trends and risk composition." icon={FundOutlined} />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Avg Behavior Score
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {avgScore}%
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Low Risk
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {lowRisk}
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Moderate
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {moderate}
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            High Risk
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {highRisk}
          </Typography>
        </Paper>
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Risk Composition">
          <PieChart height={320} series={[{ data: riskDistribution, innerRadius: 40, outerRadius: 110 }]} />
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <MainCard title="Signal Averages">
          <BarChart
            height={320}
            xAxis={[{ scaleType: 'band', data: metrics }]}
            series={[{ data: metricValues, label: 'Average %', color: '#1976d2' }]}
          />
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="Metric Highlights">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {metrics.map((m, i) => (
              <Chip key={m} label={`${m}: ${metricValues[i]}%`} />
            ))}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
