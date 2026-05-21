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
import MenuItem from '@mui/material/MenuItem';
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
import { useRentalProfiles, useRentalProfileActions } from 'hooks/useRentalProfiles';

// icons
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';

// ==============================|| HELPERS ||============================== //

function extractProfiles(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getLeaseStatus(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'TERMINATED':
      return 'error';
    case 'PENDING':
      return 'warning';
    default:
      return 'default';
  }
}

// ==============================|| PAGE ||============================== //

export default function RentalProfiles() {
  const { data, error, isLoading, mutate } = useRentalProfiles();

  const { createRentalProfile, updateRentalProfile, terminateLease } = useRentalProfileActions();

  const profiles = useMemo(() => extractProfiles(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tenantId: '',
    propertyUnitId: '',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: '',
    securityDeposit: '',
    status: 'ACTIVE'
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
      propertyUnitId: '',
      leaseStartDate: '',
      leaseEndDate: '',
      monthlyRent: '',
      securityDeposit: '',
      status: 'ACTIVE'
    });

    setDrawerOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);

    setForm({
      tenantId: record.tenantId || '',
      propertyUnitId: record.propertyUnitId || '',
      leaseStartDate: record.leaseStartDate || '',
      leaseEndDate: record.leaseEndDate || '',
      monthlyRent: record.monthlyRent || '',
      securityDeposit: record.securityDeposit || '',
      status: record.status || 'ACTIVE'
    });

    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = {
        ...form,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit)
      };

      if (editing) {
        await updateRentalProfile(editing.id, payload);
      } else {
        await createRentalProfile(payload);
      }

      await mutate();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminate = async (id) => {
    try {
      await terminateLease(id);
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      width: 260,
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
      title: 'Unit',
      key: 'unit',
      width: 200,
      render: (_, record) => (
        <Stack spacing={0.5}>
          <Typography fontWeight={600}>{record.unitNumber || 'Unit'}</Typography>

          <Typography variant="caption" color="text.secondary">
            {record.propertyName || 'Property'}
          </Typography>
        </Stack>
      )
    },

    {
      title: 'Monthly Rent',
      dataIndex: 'monthlyRent',
      key: 'monthlyRent',
      width: 160,
      render: (value) => <Typography fontWeight={700}>UGX {Number(value || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Deposit',
      dataIndex: 'securityDeposit',
      key: 'securityDeposit',
      width: 160,
      render: (value) => <Typography color="text.secondary">UGX {Number(value || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Lease Period',
      key: 'lease',
      width: 220,
      render: (_, record) => (
        <Stack spacing={0.5}>
          <Typography variant="body2">{record.leaseStartDate || '-'}</Typography>

          <Typography variant="caption" color="text.secondary">
            Ends: {record.leaseEndDate || '-'}
          </Typography>
        </Stack>
      )
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => (
        <Tag
          color={getLeaseStatus(status)}
          style={{
            borderRadius: 999,
            paddingInline: 12,
            fontWeight: 600
          }}
        >
          {status || 'UNKNOWN'}
        </Tag>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>

          {record.status !== 'TERMINATED' && (
            <Button size="small" color="error" variant="outlined" startIcon={<StopOutlined />} onClick={() => handleTerminate(record.id)}>
              Terminate
            </Button>
          )}
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
              title="Rental Profiles"
              description="Manage active leases, tenant occupancy, and rental agreements."
              icon={ApartmentOutlined}
            />

            <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
              Create Rental Profile
            </Button>
          </Stack>
        </Grid>

        {/* STATS */}
        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Total Profiles
                  </Typography>

                  <Typography variant="h3">{profiles.length}</Typography>
                </Stack>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Active Leases
                  </Typography>

                  <Typography variant="h3">{profiles.filter((p) => p.status === 'ACTIVE').length}</Typography>
                </Stack>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Terminated
                  </Typography>

                  <Typography variant="h3">{profiles.filter((p) => p.status === 'TERMINATED').length}</Typography>
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
              dataSource={profiles}
              loading={isLoading}
              rowKey={(r) => r.id}
              emptyText="No rental profiles found."
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
                {editing ? 'Edit Rental Profile' : 'Create Rental Profile'}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Assign tenants to property units and manage lease agreements.
              </Typography>
            </Box>

            <Divider />

            {/* TENANT */}
            <TextField label="Tenant ID" value={form.tenantId} onChange={(e) => handleChange('tenantId', e.target.value)} fullWidth />

            {/* UNIT */}
            <TextField
              label="Property Unit ID"
              value={form.propertyUnitId}
              onChange={(e) => handleChange('propertyUnitId', e.target.value)}
              fullWidth
            />

            {/* DATES */}
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  type="date"
                  label="Lease Start"
                  InputLabelProps={{ shrink: true }}
                  value={form.leaseStartDate}
                  onChange={(e) => handleChange('leaseStartDate', e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  type="date"
                  label="Lease End"
                  InputLabelProps={{ shrink: true }}
                  value={form.leaseEndDate}
                  onChange={(e) => handleChange('leaseEndDate', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* MONEY */}
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  type="number"
                  label="Monthly Rent"
                  value={form.monthlyRent}
                  onChange={(e) => handleChange('monthlyRent', e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  type="number"
                  label="Security Deposit"
                  value={form.securityDeposit}
                  onChange={(e) => handleChange('securityDeposit', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* STATUS */}
            <TextField select label="Lease Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} fullWidth>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="TERMINATED">TERMINATED</MenuItem>
            </TextField>

            {/* SUMMARY */}
            <MainCard border>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Lease Summary</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Rent: UGX ${Number(form.monthlyRent || 0).toLocaleString()}`} />

                  <Chip label={`Deposit: UGX ${Number(form.securityDeposit || 0).toLocaleString()}`} />
                </Stack>
              </Stack>
            </MainCard>

            {/* ACTIONS */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>

              <Button variant="contained" disabled={submitting} onClick={handleSubmit}>
                {editing ? 'Update Profile' : 'Create Profile'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
