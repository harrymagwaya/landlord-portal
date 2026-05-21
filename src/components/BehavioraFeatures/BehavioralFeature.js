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
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// antd
import { Tag } from 'antd';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useBehavioralFeatures, useBehavioralFeatureActions } from 'hooks/useBehavioralFeatures';

// icons
import RadarChartOutlined from '@ant-design/icons/RadarChartOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getRiskColor(score) {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';

  return 'error';
}

function calculateHealth(record) {
  let score = 100;

  if (record.avgDaysLate > 7) score -= 25;
  if (record.failedPayments > 2) score -= 20;
  if (record.paymentConsistency < 60) score -= 20;

  return Math.max(score, 0);
}

// ==============================|| PAGE ||============================== //

export default function BehavioralFeatures() {
  const { data, error, isLoading, mutate } = useBehavioralFeatures();

  const { createBehavioralFeature, attachBehavioralFeatureToTenant, deleteBehavioralFeature } = useBehavioralFeatureActions();

  const records = useMemo(() => extractList(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    paymentConsistency: '',
    avgDaysLate: '',
    successfulPayments: '',
    failedPayments: '',
    utilityPaymentScore: '',
    savingsScore: '',
    mobileMoneyScore: ''
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const openDrawer = () => {
    setForm({
      paymentConsistency: '',
      avgDaysLate: '',
      successfulPayments: '',
      failedPayments: '',
      utilityPaymentScore: '',
      savingsScore: '',
      mobileMoneyScore: ''
    });

    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await createBehavioralFeature(form);

      await mutate();

      setDrawerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================|| COLUMNS ||============================== //

  const columns = [
    {
      title: 'Behavior Profile',
      key: 'profile',
      width: 280,

      render: (_, record) => {
        const health = calculateHealth(record);

        return (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 42,
                height: 42
              }}
            >
              B
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>
                Snapshot #{String(record.id).slice(0, 8)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Behavioral Health
              </Typography>

              <LinearProgress
                variant="determinate"
                value={health}
                color={getRiskColor(health)}
                sx={{
                  mt: 1,
                  height: 7,
                  borderRadius: 999
                }}
              />
            </Box>
          </Stack>
        );
      }
    },

    {
      title: 'Consistency',
      dataIndex: 'paymentConsistency',
      key: 'paymentConsistency',
      width: 180,

      render: (v) => (
        <Stack spacing={0.5}>
          <Typography fontWeight={700}>{v || 0}%</Typography>

          <LinearProgress
            variant="determinate"
            value={v || 0}
            color={getRiskColor(v || 0)}
            sx={{
              height: 6,
              borderRadius: 999
            }}
          />
        </Stack>
      )
    },

    {
      title: 'Late Days',
      dataIndex: 'avgDaysLate',
      key: 'avgDaysLate',
      width: 120,

      render: (v) => <Chip label={`${v || 0} Days`} color={v <= 3 ? 'success' : 'warning'} size="small" />
    },

    {
      title: 'Payments',
      key: 'payments',
      width: 220,

      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <Tag color="green">Success: {record.successfulPayments || 0}</Tag>

          <Tag color="red">Failed: {record.failedPayments || 0}</Tag>
        </Stack>
      )
    },

    {
      title: 'Digital Score',
      key: 'digital',
      width: 220,

      render: (_, record) => (
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption">Utility</Typography>

            <LinearProgress
              variant="determinate"
              value={record.utilityPaymentScore || 0}
              sx={{
                height: 6,
                borderRadius: 999
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption">Mobile Money</Typography>

            <LinearProgress
              variant="determinate"
              value={record.mobileMoneyScore || 0}
              color="success"
              sx={{
                height: 6,
                borderRadius: 999
              }}
            />
          </Box>
        </Stack>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 220,

      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<LinkOutlined />}
            onClick={() => attachBehavioralFeatureToTenant(record.id, 'TENANT_ID_HERE')}
          >
            Attach
          </Button>

          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlined />}
            onClick={async () => {
              await deleteBehavioralFeature(record.id);

              mutate();
            }}
          >
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  // ==============================|| UI ||============================== //

  return (
    <>
      <Grid container rowSpacing={3}>
        {/* HEADER */}
        <Grid size={12}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{
              md: 'center'
            }}
          >
            <PageHeader
              title="Behavioral Intelligence"
              description="AI-driven tenant behavioral analytics and financial trust monitoring"
              icon={RadarChartOutlined}
            />

            <Button variant="contained" size="large" startIcon={<PlusOutlined />} onClick={openDrawer}>
              Create Snapshot
            </Button>
          </Stack>
        </Grid>

        {/* ANALYTICS */}
        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Snapshots
                </Typography>

                <Typography variant="h3" fontWeight={800} mt={1}>
                  {records.length}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Avg Consistency
                </Typography>

                <Typography variant="h3" fontWeight={800} mt={1}>
                  {records.length ? Math.round(records.reduce((sum, r) => sum + (r.paymentConsistency || 0), 0) / records.length) : 0}%
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Trusted Tenants
                </Typography>

                <Typography variant="h3" fontWeight={800} mt={1}>
                  {records.filter((r) => (r.paymentConsistency || 0) >= 80).length}
                </Typography>
              </Paper>
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
              dataSource={records}
              loading={isLoading}
              rowKey={(r) => r.id}
              emptyText="No behavioral snapshots found."
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 450,
            p: 3
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                New Behavioral Snapshot
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={1}>
                Capture tenant payment behavior and digital financial activity.
              </Typography>
            </Box>

            <Divider />

            <TextField
              label="Payment Consistency %"
              type="number"
              value={form.paymentConsistency}
              onChange={(e) => handleChange('paymentConsistency', e.target.value)}
              fullWidth
            />

            <TextField
              label="Average Days Late"
              type="number"
              value={form.avgDaysLate}
              onChange={(e) => handleChange('avgDaysLate', e.target.value)}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Successful Payments"
                  type="number"
                  value={form.successfulPayments}
                  onChange={(e) => handleChange('successfulPayments', e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Failed Payments"
                  type="number"
                  value={form.failedPayments}
                  onChange={(e) => handleChange('failedPayments', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Utility Payment Score"
              type="number"
              value={form.utilityPaymentScore}
              onChange={(e) => handleChange('utilityPaymentScore', e.target.value)}
              fullWidth
            />

            <TextField
              label="Savings Score"
              type="number"
              value={form.savingsScore}
              onChange={(e) => handleChange('savingsScore', e.target.value)}
              fullWidth
            />

            <TextField
              label="Mobile Money Score"
              type="number"
              value={form.mobileMoneyScore}
              onChange={(e) => handleChange('mobileMoneyScore', e.target.value)}
              fullWidth
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>

              <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                Save Snapshot
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
