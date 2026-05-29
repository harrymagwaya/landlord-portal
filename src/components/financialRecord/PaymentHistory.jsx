// =========================================
// FILE: pages/financial-records/PaymentOperations.jsx
// =========================================

import { useMemo } from 'react';

import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Tag } from 'antd';

import MainCard from 'components/MainCard';
import AdvancedTable from 'components/AdvancedTable';
import PageHeader from 'components/PageHeader';

import { useAllFinancialRecords, useFinancialRecordActions } from 'hooks/useFinancial';

import AuditOutlined from '@ant-design/icons/AuditOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function PaymentOperations() {
  const { data, isLoading, error, mutate } = useAllFinancialRecords({ size: 100 });

  const { updateFinancialRecordStatus } = useFinancialRecordActions();

  const records = useMemo(() => extractList(data), [data]);

  const handleStatus = async (recordId, status) => {
    await updateFinancialRecordStatus(recordId, status);

    await mutate();
  };

  const columns = [
    {
      title: 'Tenant',
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
      render: (status) => {
        let color = 'default';

        if (status === 'ON_TIME') color = 'green';
        if (status === 'LATE') color = 'orange';
        if (status === 'MISSED') color = 'red';

        return <Tag color={color}>{status}</Tag>;
      }
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" color="success" onClick={() => handleStatus(record.recordId, 'ON_TIME')}>
            Approve
          </Button>

          <Button size="small" variant="contained" color="warning" onClick={() => handleStatus(record.recordId, 'LATE')}>
            Late
          </Button>

          <Button size="small" variant="contained" color="error" onClick={() => handleStatus(record.recordId, 'MISSED')}>
            Reject
          </Button>
        </Stack>
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
    </Grid>
  );
}
