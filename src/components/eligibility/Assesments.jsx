// pages/eligibility/assessments.jsx

import { useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';

// antd
import { Tag } from 'antd';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';
import ShortId from 'components/ShortId';

// hooks
import { useEligibilityList } from 'hooks/useEligibility';

// icons
import AuditOutlined from '@ant-design/icons/AuditOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function getRiskColor(value) {
  if (value === 'PLATINUM' || value === 'LOW_RISK') return 'green';
  if (value === 'GOLD' || value === 'MEDIUM_RISK') return 'gold';
  if (value === 'SILVER') return 'blue';
  if (value === 'BRONZE') return 'orange';
  return 'red';
}

function formatPercent(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return `${Math.round(Number(value) * 100)}%`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

// ==============================|| PAGE ||============================== //

export default function EligibilityAssessments() {
  const { data, isLoading } = useEligibilityList(0, 100);

  const rows = useMemo(() => extractList(data), [data]);

  const [selected, setSelected] = useState(null);

  const columns = [
    {
      title: 'Tenant Profile',
      key: 'tenant',

      render: (_, row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>T</Avatar>

          <Box>
            <Typography fontWeight={700}>Tenant Profile</Typography>

            <Typography variant="caption" color="text.secondary">
              <ShortId value={row.tenantId} />
            </Typography>
          </Box>
        </Stack>
      )
    },

    {
      title: 'Risk Band',
      dataIndex: 'riskBand',
      key: 'band',
      render: (band) => <Tag color={getRiskColor(band)}>{band || 'UNKNOWN'}</Tag>
    },

    {
      title: 'Risk Category',
      dataIndex: 'riskCategory',
      key: 'riskCategory',
      render: (category) => <Tag color={getRiskColor(category)}>{category || 'UNKNOWN'}</Tag>
    },

    {
      title: 'Probability of Default',
      key: 'probabilityOfDefault',
      render: (_, row) => {
        const value = Math.round(Number(row.probabilityOfDefault || 0) * 100);
        return (
          <Stack spacing={1}>
            <Typography variant="caption">{value}%</Typography>

            <LinearProgress
              variant="determinate"
              value={value}
              color={value >= 70 ? 'success' : value >= 40 ? 'warning' : 'error'}
              sx={{
                height: 8,
                borderRadius: 999
              }}
            />
          </Stack>
        );
      }
    },

    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (value) => formatPercent(value)
    },

    {
      title: 'Calculated At',
      dataIndex: 'calculatedAt',
      key: 'calculatedAt',
      render: (value) => formatDate(value)
    },

    {
      title: 'Model Version',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      render: (value) => <Chip label={value || '-'} size="small" />
    },

    {
      title: 'Actions',
      key: 'actions',

      render: (_, row) => (
        <Button size="small" variant="outlined" onClick={() => setSelected(row)}>
          View
        </Button>
      )
    }
  ];

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={12}>
          <PageHeader title="Eligibility Assessments" description="Tenant lending decisions & borrowing power" icon={AuditOutlined} />
        </Grid>

        <Grid size={12}>
          <MainCard content={false}>
            <AdvancedTable columns={columns} dataSource={rows} loading={isLoading} rowKey={(r) => r.id} />
          </MainCard>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}>
        <Box sx={{ width: 420, p: 3 }}>
          {selected && (
            <Stack spacing={3}>
              <Typography variant="h4">Eligibility Profile</Typography>

              <Divider />

              <Box>
                <Typography variant="caption">Tenant ID</Typography>

                <Typography fontWeight={700}>{selected.tenantId}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Risk Band</Typography>

                <Typography fontWeight={700}>{selected.riskBand || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Risk Category</Typography>

                <Typography fontWeight={700}>{selected.riskCategory || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Credit Score</Typography>

                <Typography fontWeight={700}>{selected.creditScore ?? '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Probability of Default</Typography>

                <Typography fontWeight={700}>{formatPercent(selected.probabilityOfDefault)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Success Rate</Typography>

                <Typography fontWeight={700}>{formatPercent(selected.successRate)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Calculated At</Typography>

                <Typography fontWeight={700}>{formatDate(selected.calculatedAt)}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Model Version</Typography>

                <Typography fontWeight={700}>{selected.modelVersion || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">AI Recommendation</Typography>

                <Typography>
                  {selected.riskBand === 'PLATINUM'
                    ? 'Pre-approve premium loan offers.'
                    : selected.riskBand === 'GOLD'
                      ? 'Eligible for standard borrowing.'
                      : selected.riskBand === 'BRONZE'
                        ? 'Recommend monitored lending.'
                        : 'Application risk is high.'}
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Drawer>
    </>
  );
}
