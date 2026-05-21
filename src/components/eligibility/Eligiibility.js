import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

// antd
import { Tag } from 'antd';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';

// hooks (you should already create this)
import { useEligibilityList } from 'hooks/useEligibility';

// icons
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// ==============================|| PAGE ||============================== //

export default function Eligibility() {
  const { data, error, isLoading } = useEligibilityList();

  const list = useMemo(() => extractList(data), [data]);

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'tenantId',
      key: 'tenantId',
      width: 220,
      render: (id) => <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>{id?.slice(0, 8)}...</Box>
    },
    {
      title: 'Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      width: 100
    },
    {
      title: 'Risk Band',
      dataIndex: 'riskBand',
      key: 'riskBand',
      width: 120,
      render: (band) => {
        const color =
          band === 'PLATINUM' ? 'green' : band === 'GOLD' ? 'gold' : band === 'SILVER' ? 'blue' : band === 'BRONZE' ? 'orange' : 'red';

        return <Tag color={color}>{band}</Tag>;
      }
    },
    {
      title: 'Max Limit',
      dataIndex: 'currentMaxLimit',
      key: 'currentMaxLimit',
      width: 120,
      render: (v) => <b>{v}</b>
    },
    {
      title: 'Allowed',
      dataIndex: 'calculationAllowed',
      key: 'calculationAllowed',
      width: 100,
      render: (v) => (v ? <Chip label="Allowed" color="success" size="small" /> : <Chip label="Blocked" color="error" size="small" />)
    }
  ];

  return (
    <Grid container rowSpacing={3}>
      {/* HEADER */}
      <Grid size={12}>
        <PageHeader
          title="Eligibility Engine"
          description="Tenant borrowing capacity & risk-based eligibility"
          icon={CheckCircleOutlined}
        />
      </Grid>

      {/* ERROR */}
      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      {/* TABLE */}
      <Grid size={12}>
        <MainCard content={false}>
          <AdvancedTable
            columns={columns}
            dataSource={list}
            loading={isLoading}
            rowKey={(r) => r.tenantId}
            emptyText="No eligibility records found."
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
