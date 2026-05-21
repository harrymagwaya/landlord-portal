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

import { useProperties, usePropertyActions } from 'hooks/useProperties';
import { useLandlords } from 'hooks/useLandlords';

// icons
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

function getProperties(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

export default function PropertyDirectory() {
  const { data, error, isLoading, mutate } = useProperties({ size: 100 });

  const { data: landlordsData } = useLandlords();

  const { createProperty } = usePropertyActions();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    propertyName: '',
    propertyType: '',
    landlordId: '',
    totalUnits: '',
    description: ''
  });

  const properties = useMemo(() => getProperties(data), [data]);

  const landlords = useMemo(() => getProperties(landlordsData), [landlordsData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProperty = async () => {
    try {
      setSubmitting(true);

      await createProperty({
        propertyName: form.propertyName,
        propertyType: form.propertyType,
        landlordId: form.landlordId,
        totalUnits: Number(form.totalUnits),
        description: form.description
      });

      await mutate();

      setOpenDrawer(false);

      setForm({
        propertyName: '',
        propertyType: '',
        landlordId: '',
        totalUnits: '',
        description: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Property',
      key: 'property',
      render: (_, property) => (
        <Box>
          <Typography fontWeight={600}>{property.propertyName || '-'}</Typography>

          <Typography variant="caption" color="text.secondary">
            {property.description || 'No description'}
          </Typography>
        </Box>
      )
    },

    {
      title: 'Type',
      key: 'type',
      width: 140,
      render: (_, property) => <Tag color="blue">{property.propertyType || 'N/A'}</Tag>
    },

    {
      title: 'Units',
      dataIndex: 'totalUnits',
      key: 'units',
      width: 120,
      render: (value) => <Typography fontWeight={600}>{value || 0}</Typography>
    },

    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (_, property) => <Tag color={property.status === 'ACTIVE' ? 'success' : 'default'}>{property.status || 'UNKNOWN'}</Tag>
    }
  ];

  return (
    <>
      <Grid container rowSpacing={3}>
        {/* ================= HEADER ================= */}
        <Grid size={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <PageHeader title="Properties" description="Manage rental properties and landlords." icon={HomeOutlined} />

            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenDrawer(true)}>
              Add Property
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
              {properties.length} properties
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
              dataSource={properties}
              loading={isLoading}
              rowKey={(property) => property.id}
              emptyText="No properties found."
              detailTitle={(property) => property.propertyName}
              detailItems={(property) => [
                {
                  key: 'id',
                  label: 'Property ID',
                  children: property.id || '-'
                },
                {
                  key: 'name',
                  label: 'Property Name',
                  children: property.propertyName || '-'
                },
                {
                  key: 'type',
                  label: 'Property Type',
                  children: property.propertyType || '-'
                },
                {
                  key: 'units',
                  label: 'Total Units',
                  children: property.totalUnits || 0
                },
                {
                  key: 'status',
                  label: 'Status',
                  children: <Tag color={property.status === 'ACTIVE' ? 'green' : 'default'}>{property.status || 'UNKNOWN'}</Tag>
                },
                {
                  key: 'description',
                  label: 'Description',
                  children: property.description || '-'
                }
              ]}
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* ================= ADD PROPERTY DRAWER ================= */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box
          sx={{
            width: 420,
            p: 3
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Add Property
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Create and register a new rental property.
              </Typography>
            </Box>

            <TextField
              label="Property Name"
              fullWidth
              value={form.propertyName}
              onChange={(e) => handleChange('propertyName', e.target.value)}
            />

            <TextField
              select
              label="Property Type"
              fullWidth
              value={form.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value)}
            >
              <MenuItem value="APARTMENT">Apartment</MenuItem>

              <MenuItem value="HOSTEL">Hostel</MenuItem>

              <MenuItem value="COMMERCIAL">Commercial</MenuItem>

              <MenuItem value="BUNGALOW">Bungalow</MenuItem>
            </TextField>

            <TextField
              select
              label="Landlord"
              fullWidth
              value={form.landlordId}
              onChange={(e) => handleChange('landlordId', e.target.value)}
            >
              {landlords.map((landlord) => (
                <MenuItem key={landlord.id} value={landlord.id}>
                  {landlord.firstName} {landlord.lastName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label="Total Units"
              fullWidth
              value={form.totalUnits}
              onChange={(e) => handleChange('totalUnits', e.target.value)}
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button color="secondary" onClick={() => setOpenDrawer(false)}>
                Cancel
              </Button>

              <Button variant="contained" loading={submitting} onClick={handleCreateProperty}>
                Save Property
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
