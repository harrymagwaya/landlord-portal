import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { Tag } from 'antd';

import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import { useAllFinancialRecords } from 'hooks/useFinancial';

import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function LedgerHistory() {
  const { data, error, isLoading } = useAllFinancialRecords({ size: 100 });

  const records = useMemo(() => extractList(data), [data]);

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'tenantId',
      key: 'tenantId'
    },
    {
      title: 'Transaction',
      dataIndex: 'txnId',
      key: 'txnId'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => <Typography fontWeight={700}>UGX {Number(value || 0).toLocaleString()}</Typography>
    },
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (value) => (value ? new Date(value).toLocaleString() : '-')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'ON_TIME' ? 'green' : status === 'LATE' ? 'orange' : status === 'MISSED' ? 'red' : 'default'}>{status || '-'}</Tag>
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Ledger History" description="Historical financial records and payment status." icon={HistoryOutlined} />
      </Grid>

      <Grid size={12}>
        <MainCard content={false}>
          {error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error.message}
            </Alert>
          ) : null}
          <AdvancedTable columns={columns} dataSource={records} loading={isLoading} rowKey={(record) => record.recordId || record.id} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
