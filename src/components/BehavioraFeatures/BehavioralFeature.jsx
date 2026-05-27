import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';

import { Tag } from 'antd';

import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';

import { useAllTenantFeatureHistory } from 'hooks/useFeatureLinks';
import { useUsers } from 'hooks/useUsers';

import RadarChartOutlined from '@ant-design/icons/RadarChartOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';

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

function risk(scoreValue) {
  if (scoreValue >= 75) return { label: 'LOW RISK', color: 'green' };
  if (scoreValue >= 45) return { label: 'MODERATE', color: 'orange' };
  return { label: 'HIGH RISK', color: 'red' };
}

function userName(user, tenantId) {
  if (!user) return `Tenant ${String(tenantId || '-').slice(0, 8)}`;
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || user.username || user.email || `Tenant ${String(tenantId || '-').slice(0, 8)}`;
}

export default function BehavioralSnapshots() {
  const navigate = useNavigate();
  const { data, error, isLoading } = useAllTenantFeatureHistory(0, 200);
  const { data: usersData } = useUsers({ size: 200 });

  const rows = useMemo(() => extractList(data), [data]);
  const users = useMemo(() => extractList(usersData), [usersData]);
  const usersById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const tenantOptions = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        label: userName(u, u.id)
      })),
    [users]
  );

  const [searchTenantId, setSearchTenantId] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const s = score(r);
      const riskMeta = risk(s);
      const matchesSearch = !searchTenantId || String(r.tenantId || '').toLowerCase().includes(searchTenantId.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || riskMeta.label === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [rows, searchTenantId, riskFilter]);

  const avgScore = filteredRows.length ? Math.round(filteredRows.reduce((sum, r) => sum + score(r), 0) / filteredRows.length) : 0;

  const columns = [
    {
      title: 'Tenant Snapshot',
      key: 'tenant',
      width: 320,
      render: (_, row) => {
        const tenant = usersById[row.tenantId];
        const display = userName(tenant, row.tenantId);
        const initial = String(display).slice(0, 1).toUpperCase();
        return (
          <Stack direction="row" spacing={1.5}>
            <Avatar src={tenant?.avatarUrl}>{initial}</Avatar>
            <Box>
              <Typography fontWeight={700}>{display}</Typography>
              <Typography variant="caption" color="text.secondary">
                Tenant ID: {String(row.tenantId || '-').slice(0, 8)} | Snapshot: {String(row.snapshotId || '-').slice(0, 8)}
              </Typography>
            </Box>
          </Stack>
        );
      }
    },
    {
      title: 'Behavior Health',
      key: 'health',
      width: 210,
      render: (_, row) => {
        const health = score(row);
        return (
          <Box sx={{ width: 180 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">{health}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={health} sx={{ mt: 1, height: 8, borderRadius: 99 }} />
          </Box>
        );
      }
    },
    {
      title: 'Signals',
      key: 'signals',
      width: 340,
      render: (_, row) => (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip size="small" label={`Rent ${percent(row.rentConsistency)}%`} />
          <Chip size="small" label={`Mobile ${percent(row.mobileMoneyVolume)}%`} />
          <Chip size="small" label={`Diversity ${percent(row.transactionDiversity)}%`} />
        </Stack>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, row) => <Tag color={row.active ? 'green' : 'default'}>{row.active ? 'ACTIVE' : 'INACTIVE'}</Tag>
    },
    {
      title: 'Risk',
      key: 'risk',
      width: 140,
      render: (_, row) => {
        const riskMeta = risk(score(row));
        return <Tag color={riskMeta.color}>{riskMeta.label}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'actions',
      width: 150,
      render: (_, row) => (
        <Button variant="contained" size="small" startIcon={<EyeOutlined />} onClick={() => navigate(`/behavioral/profile/${row.tenantId}`)}>
          View Profile
        </Button>
      )
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Behavioral Snapshots" description="Tenant behavioral snapshots linked from feature history." icon={RadarChartOutlined} />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Total Snapshots
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {filteredRows.length}
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Active Links
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {filteredRows.filter((r) => r.active).length}
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            High Risk
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {filteredRows.filter((r) => score(r) < 45).length}
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Avg Health
          </Typography>
          <Typography variant="h3" fontWeight={800} mt={1}>
            {avgScore}%
          </Typography>
        </Paper>
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <Autocomplete
              options={tenantOptions}
              value={tenantOptions.find((o) => o.id === searchTenantId) || null}
              onChange={(_, option) => setSearchTenantId(option?.id || '')}
              renderInput={(params) => <TextField {...params} label="Find Tenant" />}
              sx={{ width: { xs: '100%', md: 360 } }}
            />
            <TextField select label="Risk" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} sx={{ width: { xs: '100%', md: 180 } }}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="LOW RISK">Low Risk</MenuItem>
              <MenuItem value="MODERATE">Moderate</MenuItem>
              <MenuItem value="HIGH RISK">High Risk</MenuItem>
            </TextField>
          </Stack>
        </MainCard>
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      <Grid size={12}>
        <MainCard content={false}>
          <AdvancedTable
            columns={columns}
            dataSource={filteredRows}
            loading={isLoading}
            rowKey={(row) => row.linkId || `${row.tenantId}-${row.snapshotId}`}
            emptyText="No behavioral snapshots found."
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
