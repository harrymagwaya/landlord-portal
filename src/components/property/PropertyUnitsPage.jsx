import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third-party
import { Tag } from 'antd';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useUnitsByProperty, useUnitActions } from 'hooks/usePropertyUnits';
import { useProperties } from 'hooks/useProperty';

// icons
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

// ==============================|| PAGE ||============================== //

export default function PropertyUnitsPage() {
  const { data: propertiesData } = useProperties({
    size: 100
  });

  const defaultPropertyId = useMemo(() => extractList(propertiesData)?.[0]?.id || '', [propertiesData]);

  const { data, error, isLoading, mutate } = useUnitsByProperty(defaultPropertyId);

  const { addUnit } = useUnitActions();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    propertyId: '',
    unitNumber: '',
    rentAmount: '',
    status: 'VACANT'
  });

  const units = useMemo(() => extractList(data), [data]);

  const properties = useMemo(() => extractList(propertiesData), [propertiesData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm({
      propertyId: '',
      unitNumber: '',
      rentAmount: '',
      status: 'VACANT'
    });
  };

  const handleAddUnit = async () => {
    try {
      setSubmitting(true);

      await addUnit(form.propertyId, {
        unitNumber: form.unitNumber,
        rentAmount: Number(form.rentAmount),
        status: form.status
      });

      await mutate();

      resetForm();

      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================|| TABLE COLUMNS ||============================== //

  const columns = [
    {
      title: 'Unit',
      key: 'unit',
      render: (_, unit) => (
        <Box>
          <Typography fontWeight={600}>Unit {unit.unitNumber || '-'}</Typography>

          <Typography variant="caption" color="text.secondary">
            {unit.propertyName || 'Unknown property'}
          </Typography>
        </Box>
      )
    },

    {
      title: 'Rent',
      dataIndex: 'rentAmount',
      key: 'rentAmount',
      width: 150,
      render: (value) => <Typography fontWeight={600}>UGX {Number(value || 0).toLocaleString()}</Typography>
    },

    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, unit) => {
        const status = unit.status || 'UNKNOWN';

        return (
          <Tag
            color={status === 'OCCUPIED' ? 'success' : status === 'VACANT' ? 'blue' : 'default'}
            style={{
              borderRadius: 999,
              paddingInline: 12,
              fontWeight: 500
            }}
          >
            {status}
          </Tag>
        );
      }
    }
  ];

  return (
    <>
      <Grid container rowSpacing={3}>
        {/* ================= HEADER ================= */}
        <Grid size={12}>
          <Stack
            direction={{
              xs: 'column',
              sm: 'row'
            }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <PageHeader title="Property Units" description="Manage rental units across all properties." icon={ApartmentOutlined} />

            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
              Add Unit
            </Button>
          </Stack>
        </Grid>

        {/* ================= COUNT ================= */}
        <Grid size={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {units.length} units
            </Typography>
          </Box>
        </Grid>

        {/* ================= TABLE ================= */}
        <Grid size={12}>
          <MainCard content={false}>
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">{error.message}</Alert>
              </Box>
            )}

            <AdvancedTable
              columns={columns}
              dataSource={units}
              rowKey={(u) => u.id}
              loading={isLoading}
              emptyText="No property units found."
              detailTitle={(u) => `Unit ${u.unitNumber}`}
              detailItems={(unit) => [
                {
                  key: 'id',
                  label: 'Unit ID',
                  children: unit.id || '-'
                },
                {
                  key: 'property',
                  label: 'Property',
                  children: unit.propertyName || '-'
                },
                {
                  key: 'unitNumber',
                  label: 'Unit Number',
                  children: unit.unitNumber || '-'
                },
                {
                  key: 'rent',
                  label: 'Rent Amount',
                  children: `UGX ${Number(unit.rentAmount || 0).toLocaleString()}`
                },
                {
                  key: 'status',
                  label: 'Status',
                  children: (
                    <Tag color={unit.status === 'OCCUPIED' ? 'green' : unit.status === 'VACANT' ? 'blue' : 'default'}>
                      {unit.status || 'UNKNOWN'}
                    </Tag>
                  )
                }
              ]}
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* ================= ADD UNIT DRAWER ================= */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 420,
            p: 3
          }}
        >
          <Stack spacing={3}>
            {/* HEADER */}
            <Box>
              <Typography variant="h4" gutterBottom>
                Add Property Unit
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Create a new rental unit under a property.
              </Typography>
            </Box>

            {/* PROPERTY */}
            <TextField
              select
              label="Property"
              fullWidth
              value={form.propertyId}
              onChange={(e) => handleChange('propertyId', e.target.value)}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.propertyName}
                </MenuItem>
              ))}
            </TextField>

            {/* UNIT NUMBER */}
            <TextField label="Unit Number" fullWidth value={form.unitNumber} onChange={(e) => handleChange('unitNumber', e.target.value)} />

            {/* RENT */}
            <TextField
              label="Rent Amount"
              type="number"
              fullWidth
              value={form.rentAmount}
              onChange={(e) => handleChange('rentAmount', e.target.value)}
            />

            {/* STATUS */}
            <TextField select label="Status" fullWidth value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              <MenuItem value="VACANT">VACANT</MenuItem>

              <MenuItem value="OCCUPIED">OCCUPIED</MenuItem>

              <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
            </TextField>

            {/* ACTIONS */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button color="secondary" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>

              <Button variant="contained" disabled={submitting} onClick={handleAddUnit}>
                Save Unit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
