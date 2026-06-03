// =========================================
// FILE: pages/financial-records/PaymentOperations.jsx
// =========================================

import { useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditOutlined from '@ant-design/icons/EditOutlined';
import Tooltip from '@mui/material/Tooltip';
// import IconButton from '@mui/material/IconButton';
import { Tag } from 'antd';

import MainCard from 'components/MainCard';
import AdvancedTable from 'components/AdvancedTable';
import PageHeader from 'components/PageHeader';

import { useAllFinancialRecords, useFinancialRecordActions } from 'hooks/useFinancial';

import AuditOutlined from '@ant-design/icons/AuditOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const STATUS_COLORS = {
  ON_TIME: 'green',
  LATE: 'orange',
  MISSED: 'red'
};

export default function PaymentOperations() {
  const { data, isLoading, error, mutate } = useAllFinancialRecords({ size: 100 });
  const { updateFinancialRecordStatus } = useFinancialRecordActions();

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const records = useMemo(() => extractList(data), [data]);

  const handleStatusChange = async (recordId, newStatus) => {
    setIsUpdating(true);
    try {
      await updateFinancialRecordStatus(recordId, newStatus);
      await mutate();

      // Keep the drawer's state in sync after database mutation
      if (selectedRecord && selectedRecord.recordId === recordId) {
        setSelectedRecord((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openDetailsDrawer = (record) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const closeDetailsDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRecord(null);
  };

  const columns = [
    {
      title: 'Tenant ID',
      dataIndex: 'tenantId',
      key: 'tenantId'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Manage Record Status">
          <IconButton color="primary" onClick={() => openDetailsDrawer(record)}>
            <EditOutlined />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Payment Operations" description="Approve and manage tenant payments" icon={AuditOutlined} />
      </Grid>

      <Grid size={12}>
        <MainCard content={false}>
          {error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error.message}
            </Alert>
          ) : null}
          <AdvancedTable columns={columns} dataSource={records} loading={isLoading} rowKey={(r) => r.recordId || r.id} />
        </MainCard>
      </Grid>

      {/* Dynamic, Actionable Management Drawer */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={closeDetailsDrawer}>
        <Box sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Financial Record Details</Typography>
            <IconButton onClick={closeDetailsDrawer} disabled={isUpdating}>
              <CloseOutlined />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {selectedRecord && (
            <Stack spacing={3} sx={{ flexGrow: 1 }}>
              {/* Item Details */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tenant Identifier
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedRecord.tenantId}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment Category
                </Typography>
                <Typography variant="body1">{selectedRecord.category}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Amount Matched
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {selectedRecord.amount}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Current Status
                </Typography>
                <Tag color={STATUS_COLORS[selectedRecord.status] || 'default'}>{selectedRecord.status}</Tag>
              </Box>

              <Divider />

              {/* Status Operational Control */}
              <Box>
                <FormControl fullWidth size="small" disabled={isUpdating}>
                  <InputLabel id="drawer-status-select-label">Modify Verification Status</InputLabel>
                  <Select
                    labelId="drawer-status-select-label"
                    value={selectedRecord.status || ''}
                    label="Modify Verification Status"
                    onChange={(e) => handleStatusChange(selectedRecord.recordId, e.target.value)}
                  >
                    <MenuItem value="ON_TIME">Approve (On-Time)</MenuItem>
                    <MenuItem value="LATE">Mark Late</MenuItem>
                    <MenuItem value="MISSED">Reject (Missed)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          )}

          {/* Footer Close Button */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button fullWidth variant="contained" color="secondary" onClick={closeDetailsDrawer} disabled={isUpdating}>
              Close Window
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Grid>
  );
}
