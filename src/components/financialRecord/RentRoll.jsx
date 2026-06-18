import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import { useAllFinancialRecords } from 'hooks/useFinancial';
import { useProperties } from 'hooks/useProperty';
import { useRentalProfiles } from 'hooks/useRentalProfle';
import { useUsers } from 'hooks/useUsers';
import { USER_ROLES } from 'utils/roles';

import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function RentRoll() {
  const [selectedLandlordId, setSelectedLandlordId] = useState('');
  const { data, error, isLoading } = useAllFinancialRecords({ size: 100 });
  const { data: propertiesData, isLoading: isPropertiesLoading } = useProperties({ size: 500 });
  const { data: rentalProfilesData, isLoading: isProfilesLoading } = useRentalProfiles();
  const { data: usersData, isLoading: isUsersLoading } = useUsers({ size: 500 });

  const landlordOptions = useMemo(
    () =>
      extractList(usersData)
        .filter((user) => (user?.userRole || user?.role || user?.userType) === USER_ROLES.LANDLORD)
        .map((user) => ({
          id: user.id,
          label: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email || user.id
        })),
    [usersData]
  );

  const filteredRecords = useMemo(() => {
    const records = extractList(data);
    if (!selectedLandlordId) return records;

    const propertyIds = new Set(
      extractList(propertiesData)
        .filter((property) => {
          const landlordId = property.landlordId || property?.landlord?.id || property?.landlord?.userId;
          return landlordId === selectedLandlordId;
        })
        .map((property) => property.id || property.propertyId)
        .filter(Boolean)
    );

    const tenantIds = new Set(
      extractList(rentalProfilesData)
        .filter((profile) => {
          const landlordId = profile.landlordId || profile?.landlord?.id || profile?.landlord?.userId;
          const propertyId = profile.propertyId || profile?.property?.id || profile?.property?.propertyId;
          return landlordId === selectedLandlordId || (propertyId && propertyIds.has(propertyId));
        })
        .map((profile) => profile.tenantId || profile?.tenant?.id || profile?.tenant?.userId)
        .filter(Boolean)
    );

    return records.filter((record) => {
      const propertyId = record.propertyId || record?.property?.id || record?.property?.propertyId;
      const tenantId = record.tenantId || record?.tenant?.id || record?.tenant?.userId;
      return (propertyId && propertyIds.has(propertyId)) || (tenantId && tenantIds.has(tenantId));
    });
  }, [data, propertiesData, rentalProfilesData, selectedLandlordId]);

  const rows = useMemo(() => {
    return Object.values(
      filteredRecords.reduce((acc, record) => {
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
  }, [filteredRecords]);

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
        <MainCard>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              View by Landlord
            </Typography>
            <Autocomplete
              options={landlordOptions}
              loading={isUsersLoading || isPropertiesLoading || isProfilesLoading}
              value={landlordOptions.find((option) => option.id === selectedLandlordId) || null}
              onChange={(_, option) => setSelectedLandlordId(option?.id || '')}
              renderInput={(params) => <TextField {...params} label="Landlord / User ID" placeholder="Select a landlord" />}
            />
            <Typography variant="body2" color="text.secondary">
              {selectedLandlordId
                ? 'Showing rent roll for the selected landlord.'
                : 'Showing rent roll for all landlords. Select one landlord to narrow the table.'}
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
          {!error && selectedLandlordId && rows.length === 0 ? (
            <Box p={2}>
              <Alert severity="info">No financial records matched the selected landlord.</Alert>
            </Box>
          ) : null}
          <AdvancedTable columns={columns} dataSource={rows} loading={isLoading} rowKey={(record) => record.tenantId} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
