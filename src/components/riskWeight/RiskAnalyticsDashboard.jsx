import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// charts
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import { useAllScores } from 'hooks/useScoring';

// icons
import FundOutlined from '@ant-design/icons/FundOutlined';

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getScore(record) {
  const key = ['score', 'creditScore', 'finalScore', 'riskScore', 'totalScore'].find((k) => Number.isFinite(Number(record?.[k])));
  return key ? Number(record[key]) : null;
}

function getMonthLabel(record) {
  const raw = record?.createdAt || record?.updatedAt || record?.scoredAt || record?.timestamp;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('en-US', { month: 'short' }) : null;
}

function getTenantId(record) {
  return record?.tenantId || record?.tenant?.id || record?.tenant?.tenantId || record?.userId || null;
}

function getTimeKey(record) {
  const raw = record?.createdAt || record?.updatedAt || record?.scoredAt || record?.timestamp;
  const d = raw ? new Date(raw) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const COLORS = ['#52c41a', '#faad14', '#ff4d4f'];

export default function RiskAnalyticsDashboard() {
  const { data, error, isLoading } = useAllScores();
  const rows = useMemo(() => extractList(data), [data]);

  const scores = useMemo(() => rows.map(getScore).filter((v) => v !== null), [rows]);
  const uniqueTenantCount = useMemo(() => new Set(rows.map(getTenantId).filter(Boolean)).size, [rows]);
  const averageScore = useMemo(() => (scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0), [scores]);
  const highRiskCount = useMemo(() => scores.filter((s) => s < 550).length, [scores]);
  const highRiskPct = useMemo(() => (scores.length ? Math.round((highRiskCount / scores.length) * 100) : 0), [scores, highRiskCount]);

  const riskData = useMemo(() => {
    const low = scores.filter((s) => s >= 700).length;
    const medium = scores.filter((s) => s >= 550 && s < 700).length;
    const high = scores.filter((s) => s < 550).length;
    return [
      { name: 'Low Risk', value: low },
      { name: 'Medium Risk', value: medium },
      { name: 'High Risk', value: high }
    ];
  }, [scores]);

  const scoreTrend = useMemo(() => {
    const bucket = rows.reduce((acc, row) => {
      const month = getMonthLabel(row);
      const score = getScore(row);
      if (!month || score === null) return acc;
      acc[month] = acc[month] || [];
      acc[month].push(score);
      return acc;
    }, {});

    const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return order
      .filter((m) => bucket[m]?.length)
      .map((m) => ({ month: m, score: Math.round(bucket[m].reduce((s, v) => s + v, 0) / bucket[m].length) }));
  }, [rows]);

  const growthTrend = useMemo(() => {
    const bucket = rows.reduce((acc, row) => {
      const key = getTimeKey(row);
      if (!key) return acc;
      if (!acc[key]) acc[key] = { tenants: new Set(), records: 0 };
      acc[key].records += 1;
      const tenantId = getTenantId(row);
      if (tenantId) acc[key].tenants.add(tenantId);
      return acc;
    }, {});

    return Object.keys(bucket)
      .sort()
      .map((key) => ({
        month: key,
        records: bucket[key].records,
        tenants: bucket[key].tenants.size
      }));
  }, [rows]);

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

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      {/* KPI CARDS */}
      <Grid size={3}>
        <MainCard>
          <Typography variant="h6">Avg Score</Typography>
          <Typography variant="h3">{isLoading ? '-' : averageScore}</Typography>
        </MainCard>
      </Grid>

      <Grid size={3}>
        <MainCard>
          <Typography variant="h6">High Risk Records</Typography>
          <Typography variant="h3">{isLoading ? '-' : `${highRiskPct}%`}</Typography>
        </MainCard>
      </Grid>

      <Grid size={3}>
        <MainCard>
          <Typography variant="h6">Unique Tenants</Typography>
          <Typography variant="h3">{isLoading ? '-' : uniqueTenantCount}</Typography>
        </MainCard>
      </Grid>

      <Grid size={3}>
        <MainCard>
          <Typography variant="h6">Total Records</Typography>
          <Typography variant="h3">{isLoading ? '-' : rows.length}</Typography>
        </MainCard>
      </Grid>

      {/* PIE CHART */}
      <Grid size={6}>
        <MainCard title="Risk Distribution">
          <PieChart
            height={300}
            series={[
              {
                data: riskData.map((item, index) => ({ id: index, value: item.value, label: item.name, color: COLORS[index] })),
                innerRadius: 35,
                outerRadius: 100
              }
            ]}
          />
        </MainCard>
      </Grid>

      {/* BAR CHART */}
      <Grid size={6}>
        <MainCard title="Score Trend">
          <BarChart
            height={300}
            xAxis={[{ scaleType: 'band', data: scoreTrend.map((item) => item.month) }]}
            series={[{ data: scoreTrend.map((item) => item.score), color: '#1890ff', label: 'Avg Score' }]}
          />
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard title="Records & Tenant Growth">
          <BarChart
            height={320}
            xAxis={[{ scaleType: 'band', data: growthTrend.map((item) => item.month) }]}
            series={[
              { data: growthTrend.map((item) => item.records), label: 'Records', color: '#1677ff' },
              { data: growthTrend.map((item) => item.tenants), label: 'Unique Tenants', color: '#52c41a' }
            ]}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
