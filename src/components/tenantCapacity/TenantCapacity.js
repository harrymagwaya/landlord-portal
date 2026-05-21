import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// antd
import { Tag, Progress } from 'antd';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useTenantCapacities, useTenantCapacityActions } from 'hooks/useTenantCapacities';

// icons
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function calculateFinancialStrength(record) {
  const income = Number(record.monthlyIncome || 0);
  const savings = Number(record.avgSavingsDeposit || 0);
  const momo = Number(record.avgMomoVolume || 0);

  const score = Math.min(100, Math.round((income * 0.00002 + savings * 0.00004 + momo * 0.00001) * 100));

  return score;
}

function getRiskColor(score) {
  if (score >= 80) return 'green';
  if (score >= 50) return 'orange';
  return 'red';
}

// ==============================|| PAGE ||============================== //

export default function TenantCapacity() {
  const { data, error, isLoading, mutate } = useTenantCapacities();

  const { upsertCapacity, deleteCapacity } = useTenantCapacityActions();

  const capacities = useMemo(() => extractList(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenantId: '',
    monthlyIncome: '',
    avgMomoVolume: '',
    avgUtilitySpend: '',
    avgSavingsDeposit: ''
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const openCreate = () => {
    setEditing(null);

    setForm({
      tenantId: '',
      monthlyIncome: '',
      avgMomoVolume: '',
      avgUtilitySpend: '',
      avgSavingsDeposit: ''
    });

    setDrawerOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);

    setForm({
      tenantId: record.tenantId || '',
      monthlyIncome: record.monthlyIncome || '',
      avgMomoVolume: record.avgMomoVolume || '',
      avgUtilitySpend: record.avgUtilitySpend || '',
      avgSavingsDeposit: record.avgSavingsDeposit || ''
    });

    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await upsertCapacity({
        ...form,
        monthlyIncome: Number(form.monthlyIncome),
        avgMomoVolume: Number(form.avgMomoVolume),
        avgUtilitySpend: Number(form.avgUtilitySpend),
        avgSavingsDeposit: Number(form.avgSavingsDeposit)
      });

      await mutate();

      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCapacity(id);
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const totalIncome = capacities.reduce((sum, item) => sum + Number(item.monthlyIncome || 0), 0);

  const averageIncome = capacities.length ? Math.round(totalIncome / capacities.length) : 0;

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      width: 280,
      render: (_, record) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 38, height: 38 }}>{record.tenantName?.[0] || 'T'}</Avatar>

          <Box>
            <Typography fontWeight={700}>{record.tenantName || 'Tenant'}</Typography>

            <Typography variant="caption" color="text.secondary">
              {record.tenantId}
            </Typography>
          </Box>
        </Stack>
      )
    },

    {
      title: 'Monthly Income',
      dataIndex: 'monthlyIncome',
      key: 'monthlyIncome',
      width: 170,
      render: (value) => <Typography fontWeight={700}>UGX {Number(value || 0).toLocaleString()}</Typography>
    },

    {
      title: 'MoMo Volume',
      dataIndex: 'avgMomoVolume',
      key: 'avgMomoVolume',
      width: 170,
      render: (value) => <Typography>UGX {Number(value || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Utilities',
      dataIndex: 'avgUtilitySpend',
      key: 'avgUtilitySpend',
      width: 160,
      render: (value) => <Typography color="text.secondary">UGX {Number(value || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Savings',
      dataIndex: 'avgSavingsDeposit',
      key: 'avgSavingsDeposit',
      width: 170,
      render: (value) => (
        <Typography color="success.main" fontWeight={600}>
          UGX {Number(value || 0).toLocaleString()}
        </Typography>
      )
    },

    {
      title: 'Financial Strength',
      key: 'strength',
      width: 220,
      render: (_, record) => {
        const score = calculateFinancialStrength(record);

        return (
          <Stack spacing={1}>
            <Progress percent={score} size="small" strokeColor={getRiskColor(score)} />

            <Tag color={getRiskColor(score)}>{score >= 80 ? 'STRONG' : score >= 50 ? 'MODERATE' : 'LOW'}</Tag>
          </Stack>
        );
      }
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>

          <Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <>
      <Grid container rowSpacing={3}>
        {/* HEADER */}
        <Grid size={12}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
            <PageHeader
              title="Tenant Capacity"
              description="Financial capability analysis for tenants and credit evaluation."
              icon={WalletOutlined}
            />

            <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
              Add Capacity Record
            </Button>
          </Stack>
        </Grid>

        {/* ANALYTICS */}
        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity Records
                  </Typography>

                  <Typography variant="h3">{capacities.length}</Typography>
                </Stack>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Average Income
                  </Typography>

                  <Typography variant="h3">UGX {averageIncome.toLocaleString()}</Typography>
                </Stack>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Declared Income
                  </Typography>

                  <Typography variant="h3">UGX {totalIncome.toLocaleString()}</Typography>
                </Stack>
              </MainCard>
            </Grid>
          </Grid>
        </Grid>

        {/* TABLE */}
        <Grid size={12}>
          <MainCard content={false}>
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">{error.message}</Alert>
              </Box>
            )}

            <AdvancedTable
              columns={columns}
              dataSource={capacities}
              loading={isLoading}
              rowKey={(r) => r.id}
              emptyText="No tenant capacities found."
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 460,
            p: 3
          }}
        >
          <Stack spacing={3}>
            {/* HEADER */}
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {editing ? 'Update Capacity' : 'Add Tenant Capacity'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Capture financial indicators used for eligibility and credit scoring.
              </Typography>
            </Box>

            <Divider />

            {/* TENANT */}
            <TextField label="Tenant ID" value={form.tenantId} onChange={(e) => handleChange('tenantId', e.target.value)} fullWidth />

            {/* MONTHLY INCOME */}
            <TextField
              type="number"
              label="Monthly Income"
              value={form.monthlyIncome}
              onChange={(e) => handleChange('monthlyIncome', e.target.value)}
              fullWidth
            />

            {/* MOMO */}
            <TextField
              type="number"
              label="Average Mobile Money Volume"
              value={form.avgMomoVolume}
              onChange={(e) => handleChange('avgMomoVolume', e.target.value)}
              fullWidth
            />

            {/* UTILITIES */}
            <TextField
              type="number"
              label="Average Utility Spend"
              value={form.avgUtilitySpend}
              onChange={(e) => handleChange('avgUtilitySpend', e.target.value)}
              fullWidth
            />

            {/* SAVINGS */}
            <TextField
              type="number"
              label="Average Savings Deposit"
              value={form.avgSavingsDeposit}
              onChange={(e) => handleChange('avgSavingsDeposit', e.target.value)}
              fullWidth
            />

            {/* LIVE INSIGHT */}
            <MainCard border>
              <Stack spacing={2}>
                <Typography variant="subtitle2">Capacity Insight</Typography>

                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Financial Strength</Typography>

                    <Typography variant="body2" fontWeight={700}>
                      {calculateFinancialStrength(form)}%
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={calculateFinancialStrength(form)}
                    sx={{
                      mt: 1,
                      height: 10,
                      borderRadius: 999
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip icon={<DollarOutlined />} label={`Income UGX ${Number(form.monthlyIncome || 0).toLocaleString()}`} />

                  <Chip label={`Savings UGX ${Number(form.avgSavingsDeposit || 0).toLocaleString()}`} />
                </Stack>
              </Stack>
            </MainCard>

            {/* ACTIONS */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>

              <Button variant="contained" disabled={submitting} onClick={handleSubmit}>
                {editing ? 'Update Capacity' : 'Save Capacity'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
