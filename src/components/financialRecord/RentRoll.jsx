import { useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import { useAllFinancialRecords } from 'hooks/useFinancial';

import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function RentRoll() {
  const { data, error, isLoading } = useAllFinancialRecords({ size: 100 });

  const rows = useMemo(() => {
    const records = extractList(data);

    return Object.values(
      records.reduce((acc, record) => {
        const tenantId = record.tenantId || 'Unknown tenant';

        if (!acc[tenantId]) {
          acc[tenantId] = {
            tenantId,
            recordCount: 0,
            totalRent: 0,
            latestPayment: null
          };
        }

        acc[tenantId].recordCount += 1;

        if (record.category === 'RENT') {
          acc[tenantId].totalRent += Number(record.amount || 0);
        }

        const currentTime = new Date(record.transactionDate || 0).getTime();
        const previousTime = new Date(acc[tenantId].latestPayment || 0).getTime();

        if (currentTime >= previousTime) {
          acc[tenantId].latestPayment = record.transactionDate;
        }

        return acc;
      }, {})
    );
  }, [data]);

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'tenantId',
      key: 'tenantId'
    },
    {
      title: 'Records',
      dataIndex: 'recordCount',
      key: 'recordCount'
    },
    {
      title: 'Total Rent',
      dataIndex: 'totalRent',
      key: 'totalRent',
      render: (value) => <Typography fontWeight={700}>UGX {Number(value || 0).toLocaleString()}</Typography>
    },
    {
      title: 'Latest Payment',
      dataIndex: 'latestPayment',
      key: 'latestPayment',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-')
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Property Rent Roll" description="Rent totals grouped by tenant financial records." icon={ApartmentOutlined} />
      </Grid>

      <Grid size={12}>
        <MainCard content={false}>
          {error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error.message}
            </Alert>
          ) : null}
          <AdvancedTable columns={columns} dataSource={rows} loading={isLoading} rowKey={(record) => record.tenantId} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
