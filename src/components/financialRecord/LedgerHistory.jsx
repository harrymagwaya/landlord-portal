import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Tag } from 'antd';

import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import { useAllFinancialRecords } from 'hooks/useFinancial';
import { useUsers } from 'hooks/useUsers';
import { USER_ROLES } from 'utils/roles';

import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function LedgerHistory() {
  const [selectedUserId, setSelectedUserId] = useState('');
  const { data, error, isLoading } = useAllFinancialRecords({ size: 100 });
  const { data: usersData, isLoading: isUsersLoading } = useUsers({ size: 500 });

  const userOptions = useMemo(
    () =>
      extractList(usersData)
        .filter((user) => (user?.userRole || user?.role || user?.userType) === USER_ROLES.TENANT)
        .map((user) => ({
          id: user.id,
          label: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email || user.id
        })),
    [usersData]
  );

  const records = useMemo(() => {
    const rows = extractList(data);
    if (!selectedUserId) return rows;
    return rows.filter((record) => (record.tenantId || record?.tenant?.id || record?.tenant?.userId) === selectedUserId);
  }, [data, selectedUserId]);

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
        <MainCard>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Search by User
            </Typography>
            <Autocomplete
              options={userOptions}
              loading={isUsersLoading}
              value={userOptions.find((option) => option.id === selectedUserId) || null}
              onChange={(_, option) => setSelectedUserId(option?.id || '')}
              renderInput={(params) => <TextField {...params} label="Tenant / User ID" placeholder="Select a user" />}
            />
            <Typography variant="body2" color="text.secondary">
              {selectedUserId
                ? 'Showing ledger history for the selected user.'
                : 'Showing ledger history for all users. Select a user to narrow the table.'}
            </Typography>
          </Stack>
        </MainCard>
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
