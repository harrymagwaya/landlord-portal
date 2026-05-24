import { useMemo } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// antd
import { Tag } from 'antd';

// project
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useAllScores } from 'hooks/useScoring';

// icons
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function RiskScores() {
  const { data, error, isLoading } = useAllScores();

  const rows = useMemo(() => extractList(data), [data]);

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      width: 260,

      render: (_, row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>R</Avatar>

          <Box>
            <Typography fontWeight={700}>Tenant {String(row.tenantId).slice(0, 8)}</Typography>

            <Typography variant="caption" color="text.secondary">
              {row.modelVersion}
            </Typography>
          </Box>
        </Stack>
      )
    },

    {
      title: 'Credit Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      width: 180,

      render: (v) => (
        <Stack spacing={0.5}>
          <Typography fontWeight={700}>{v}</Typography>

          <LinearProgress
            variant="determinate"
            value={v}
            sx={{
              height: 8,
              borderRadius: 999
            }}
          />
        </Stack>
      )
    },

    {
      title: 'Default Probability',
      dataIndex: 'probabilityOfDefault',
      key: 'probabilityOfDefault',
      width: 180,

      render: (v) => <Chip label={`${Math.round(Number(v) * 100)}%`} color={v >= 0.7 ? 'error' : v >= 0.4 ? 'warning' : 'success'} />
    },

    {
      title: 'Risk Category',
      dataIndex: 'riskCategory',
      key: 'riskCategory',
      width: 150,

      render: (v) => <Tag color={v === 'LOW_RISK' ? 'green' : v === 'MEDIUM_RISK' ? 'orange' : 'red'}>{v}</Tag>
    },

    {
      title: 'Risk Band',
      dataIndex: 'riskBand',
      key: 'riskBand',
      width: 120,

      render: (v) => <Tag color="gold">{v}</Tag>
    },

    {
      title: 'Calculated',
      dataIndex: 'calculatedAt',
      key: 'calculatedAt',
      width: 180,

      render: (v) => new Date(v).toLocaleString()
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader title="Risk Scores" description="AI-powered tenant risk scoring engine." icon={SafetyCertificateOutlined} />
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      <Grid size={12}>
        <MainCard content={false}>
          <AdvancedTable columns={columns} dataSource={rows} loading={isLoading} rowKey={(r) => r.id} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
