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
      dataIndex: 'lastCalculatedBand',
      key: 'band',

      render: (band) => {
        const color =
          band === 'PLATINUM' ? 'green' : band === 'GOLD' ? 'gold' : band === 'SILVER' ? 'blue' : band === 'BRONZE' ? 'orange' : 'red';

        return <Tag color={color}>{band}</Tag>;
      }
    },

    {
      title: 'Borrowing Strength',
      key: 'strength',

      render: (_, row) => {
        const max = Number(row.currentMaxLimit || 0);

        const value = max >= 500 ? 90 : max >= 300 ? 70 : max >= 100 ? 45 : 20;

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
      title: 'Limit Range',
      key: 'limits',

      render: (_, row) => (
        <Stack spacing={0.5}>
          <Typography fontWeight={700}>Max: {row.currentMaxLimit}</Typography>

          <Typography variant="caption" color="text.secondary">
            Min: {row.currentMinLimit}
          </Typography>
        </Stack>
      )
    },

    {
      title: 'Status',
      key: 'status',

      render: (_, row) => (row.calculationAllowed ? <Chip label="APPROVED" color="success" /> : <Chip label="BLOCKED" color="error" />)
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

                <Typography fontWeight={700}>{selected.lastCalculatedBand}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">Borrowing Limits</Typography>

                <Typography fontWeight={700}>
                  {selected.currentMinLimit} - {selected.currentMaxLimit}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption">Last Reviewed</Typography>

                <Typography fontWeight={700}>{new Date(selected.lastReviewedAt).toLocaleString()}</Typography>
              </Box>

              <Box>
                <Typography variant="caption">AI Recommendation</Typography>

                <Typography>
                  {selected.lastCalculatedBand === 'PLATINUM'
                    ? 'Pre-approve premium loan offers.'
                    : selected.lastCalculatedBand === 'GOLD'
                      ? 'Eligible for standard borrowing.'
                      : selected.lastCalculatedBand === 'BRONZE'
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
