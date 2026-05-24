import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// antd
import { Tag } from 'antd';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useRiskWeights, useRiskWeightActions } from 'hooks/useRiskWeights';

// icons
import SlidersOutlined from '@ant-design/icons/SlidersOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// ==============================|| PAGE ||============================== //

export default function RiskWeight() {
  const { data, error, isLoading, mutate } = useRiskWeights();

  const { createRiskWeight, updateRiskWeight, toggleRiskWeightStatus } = useRiskWeightActions();

  const weights = useMemo(() => extractList(data), [data]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    key: '',
    label: '',
    weightValue: 0,
    active: true
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({
      key: record.key || '',
      label: record.label || '',
      weightValue: Number(record.weightValue || 0),
      active: record.active ?? true
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (editing) {
        await updateRiskWeight(editing.id, form);
      } else {
        await createRiskWeight(form);
      }

      await mutate();
      setDrawerOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================|| TABLE ||============================== //

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: 200
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label'
    },
    {
      title: 'Weight',
      dataIndex: 'weightValue',
      key: 'weightValue',
      width: 120,
      render: (v) => <b>{v}</b>
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => openEdit(record)}>
          Edit
        </Button>
      )
    },
    {
      title: 'Toggle',
      key: 'toggle',
      width: 120,
      render: (_, record) => (
        <Switch
          checked={record.active}
          onChange={async (checked) => {
            await toggleRiskWeightStatus(record.id, checked);
            mutate();
          }}
        />
      )
    }
  ];

  // ==============================|| UI ||============================== //

  return (
    <>
      <Grid container rowSpacing={3}>
        {/* HEADER */}
        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <PageHeader title="Risk Weights" description="Configure scoring parameters for credit risk engine" icon={SlidersOutlined} />

            <Button startIcon={<PlusOutlined />} variant="contained" onClick={openCreate}>
              Add Weight
            </Button>
          </Stack>
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
              dataSource={weights}
              loading={isLoading}
              rowKey={(r) => r.id}
              emptyText="No risk weights configured."
            />
          </MainCard>
        </Grid>
      </Grid>

      {/* DRAWER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 420, p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4">{editing ? 'Edit Weight' : 'Add Weight'}</Typography>

            <TextField label="Key" value={form.key} onChange={(e) => handleChange('key', e.target.value)} fullWidth />

            <TextField label="Label" value={form.label} onChange={(e) => handleChange('label', e.target.value)} fullWidth />

            <TextField
              label="Weight Value"
              type="number"
              value={form.weightValue}
              onChange={(e) => handleChange('weightValue', Number(e.target.value))}
              fullWidth
            />

            <FormControlLabel
              control={<Switch checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} />}
              label="Active"
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>

              <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
