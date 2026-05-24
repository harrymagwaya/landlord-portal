// {/* <Grid container spacing={3}>
//   {/* HEADER */}
//   <Grid size={12}>
//     <Paper sx={{ p: 3, borderRadius: 4 }}>
//       <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
//         <Stack direction="row" spacing={2}>
//           <Avatar
//             sx={{
//               width: 72,
//               height: 72,
//               bgcolor: 'primary.main'
//             }}
//           >
//             T
//           </Avatar>

//           <Box>
//             <Typography variant="h4" fontWeight={800}>
//               Tenant 0df2d562
//             </Typography>

//             <Typography color="text.secondary">Unified Behavioral Intelligence Profile</Typography>

//             <Stack direction="row" spacing={1} mt={1}>
//               <Tag color="green">LOW RISK</Tag>

//               <Tag color="gold">GOLD</Tag>
//             </Stack>
//           </Box>
//         </Stack>

//         <Box textAlign="center">
//           <Typography color="text.secondary">Credit Score</Typography>

//           <Typography variant="h1" fontWeight={900} color="success.main">
//             720
//           </Typography>
//         </Box>
//       </Stack>
//     </Paper>
//   </Grid>

//   {/* SIGNALS */}
//   <Grid size={{ xs: 12, md: 8 }}>
//     <MainCard title="Behavioral Signals">
//       <Grid container spacing={2}>
//         {[
//           ['Rent Consistency', 78],
//           ['Mobile Money', 82],
//           ['Transaction Diversity', 66],
//           ['Savings Stability', 71],
//           ['Loan Repayment', 91],
//           ['Residence Stability', 84]
//         ].map(([label, value]) => (
//           <Grid size={{ xs: 12, md: 6 }} key={label}>
//             <Paper sx={{ p: 2.5 }}>
//               <Stack direction="row" justifyContent="space-between">
//                 <Typography>{label}</Typography>

//                 <Typography fontWeight={700}>{value}%</Typography>
//               </Stack>

//               <LinearProgress
//                 variant="determinate"
//                 value={value}
//                 sx={{
//                   mt: 1.5,
//                   height: 8,
//                   borderRadius: 99
//                 }}
//               />
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>
//     </MainCard>
//   </Grid>

//   {/* RISK ENGINE */}
//   <Grid size={{ xs: 12, md: 4 }}>
//     <MainCard title="Risk Intelligence">
//       <Stack spacing={2}>
//         <Paper sx={{ p: 2.5 }}>
//           <Typography color="text.secondary">Probability of Default</Typography>

//           <Typography variant="h3" fontWeight={800}>
//             12%
//           </Typography>
//         </Paper>

//         <Paper sx={{ p: 2.5 }}>
//           <Typography color="text.secondary">Risk Category</Typography>

//           <Typography variant="h4" fontWeight={700}>
//             LOW_RISK
//           </Typography>
//         </Paper>

//         <Paper sx={{ p: 2.5 }}>
//           <Typography color="text.secondary">Borrowing Range</Typography>

//           <Typography variant="h4" fontWeight={700}>
//             UGX 80 → 250
//           </Typography>
//         </Paper>
//       </Stack>
//     </MainCard>
//   </Grid>

//   {/* TIMELINE */}
//   <Grid size={12}>
//     <MainCard title="Behavior Timeline">
//       <Timeline
//         items={[
//           {
//             color: 'green',

//             children: (
//               <Paper sx={{ p: 2.5 }}>
//                 <Typography fontWeight={700}>Rent consistency improved</Typography>

//                 <Typography variant="caption">May 23, 2026</Typography>
//               </Paper>
//             )
//           },

//           {
//             color: 'orange',

//             children: (
//               <Paper sx={{ p: 2.5 }}>
//                 <Typography fontWeight={700}>Savings behavior declined</Typography>

//                 <Typography variant="caption">May 11, 2026</Typography>
//               </Paper>
//             )
//           }
//         ]}
//       />
//     </MainCard>
//   </Grid>
// </Grid>; */}

import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// antd
import { Tag, Timeline } from 'antd';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';

// hooks
import { useBehavioralFeatures } from 'hooks/useBehavioralFeatures';
import { useAllTenantFeatureHistory } from 'hooks/useFeatureLinks';
import { useUser } from 'hooks/useUsers';

// icons
import UserOutlined from '@ant-design/icons/UserOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function toPercent(value) {
  return Math.round(Number(value || 0) * 100);
}

function calculateBehaviorScore(record) {
  const metrics = [
    Number(record.rentConsistency || 0),
    Number(record.mobileMoneyVolume || 0),
    Number(record.transactionDiversity || 0),
    Number(record.utilityPayments || 0),
    Number(record.savingsConsistency || 0),
    Number(record.loanRepaymentRate || 0)
  ];

  const valid = metrics.filter((v) => !Number.isNaN(v));

  if (!valid.length) return 0;

  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100);
}

function getRiskMeta(score) {
  if (score >= 75) {
    return {
      label: 'LOW RISK',
      color: 'success',
      tag: 'green'
    };
  }

  if (score >= 45) {
    return {
      label: 'MODERATE',
      color: 'warning',
      tag: 'orange'
    };
  }

  return {
    label: 'HIGH RISK',
    color: 'error',
    tag: 'red'
  };
}

// ==============================|| PAGE ||============================== //

export default function TenantBehaviorProfile() {
  const { id } = useParams();
  const [tenantLookupId, setTenantLookupId] = useState(id || '');
  const selectedTenantId = id || tenantLookupId;

  const { data: behavioralData, isLoading, error } = useBehavioralFeatures();
  const { data: tenantUser } = useUser(selectedTenantId || null);

  const { data: featureHistoryData } = useAllTenantFeatureHistory(0, 200);

  const records = useMemo(() => extractList(behavioralData), [behavioralData]);

  const history = useMemo(() => extractList(featureHistoryData), [featureHistoryData]);

  const tenantSnapshots = useMemo(() => {
    return records.filter((r) => r.tenantId === selectedTenantId);
  }, [records, selectedTenantId]);

  const tenantHistory = useMemo(() => {
    return history.filter((r) => r.tenantId === selectedTenantId);
  }, [history, selectedTenantId]);

  const latestSnapshot = tenantSnapshots[0];

  const overallScore = latestSnapshot ? calculateBehaviorScore(latestSnapshot) : 0;

  const risk = getRiskMeta(overallScore);

  // ==============================|| TABLE ||============================== //

  const columns = [
    {
      title: 'Snapshot',
      key: 'snapshot',
      width: 280,

      render: (_, record) => {
        const score = calculateBehaviorScore(record);

        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: score >= 75 ? 'success.main' : score >= 45 ? 'warning.main' : 'error.main'
              }}
            >
              {score}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700}>Snapshot #{String(record.id).slice(0, 8)}</Typography>

              <Typography variant="caption" color="text.secondary">
                Behavioral Intelligence Record
              </Typography>
            </Box>
          </Stack>
        );
      }
    },

    {
      title: 'Rent Discipline',
      dataIndex: 'rentConsistency',
      key: 'rentConsistency',
      width: 180,

      render: (value) => (
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Rent</Typography>

            <Typography variant="caption" fontWeight={700}>
              {toPercent(value)}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={toPercent(value)}
            sx={{
              height: 8,
              borderRadius: 999
            }}
          />
        </Stack>
      )
    },

    {
      title: 'Mobile Economy',
      dataIndex: 'mobileMoneyVolume',
      key: 'mobileMoneyVolume',
      width: 180,

      render: (value) => <Chip label={`${toPercent(value)}%`} color={toPercent(value) >= 60 ? 'success' : 'warning'} size="small" />
    },

    {
      title: 'Savings',
      dataIndex: 'savingsConsistency',
      key: 'savingsConsistency',
      width: 150,

      render: (value) => <Chip label={`${toPercent(value)}%`} color={toPercent(value) >= 60 ? 'success' : 'default'} size="small" />
    },

    {
      title: 'Loan Repayment',
      dataIndex: 'loanRepaymentRate',
      key: 'loanRepaymentRate',
      width: 180,

      render: (value) => <Typography fontWeight={700}>{toPercent(value)}%</Typography>
    },

    {
      title: 'Risk',
      key: 'risk',
      width: 160,

      render: (_, record) => {
        const meta = getRiskMeta(calculateBehaviorScore(record));

        return <Tag color={meta.tag}>{meta.label}</Tag>;
      }
    }
  ];

  return (
    <Grid container spacing={3}>
      {/* HEADER */}
      <Grid size={12}>
        <PageHeader
          title="Tenant Behavioral Profile"
          description="Deep behavioral intelligence profile for an individual tenant."
          icon={UserOutlined}
        />
      </Grid>

      {!id && (
        <Grid size={12}>
          <MainCard>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Tenant ID" value={tenantLookupId} onChange={(e) => setTenantLookupId(e.target.value)} />
              <Button variant="contained" disabled={!tenantLookupId}>
                Find by ID
              </Button>
            </Stack>
          </MainCard>
        </Grid>
      )}

      {/* ERROR */}
      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      {/* HERO PROFILE */}
      <Grid size={12}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(25,118,210,0.12) 0%, rgba(25,118,210,0.03) 100%)'
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={4}
            alignItems={{
              md: 'center'
            }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                src={tenantUser?.avatarUrl}
                sx={{
                  width: 90,
                  height: 90,
                  fontSize: 32,
                  bgcolor: 'primary.main'
                }}
              >
                {String((tenantUser?.firstName || tenantUser?.username || selectedTenantId || 'T').slice(0, 1)).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h3" fontWeight={800}>
                  {[tenantUser?.firstName, tenantUser?.lastName].filter(Boolean).join(' ') ||
                    tenantUser?.username ||
                    `Tenant ${String(selectedTenantId || '').slice(0, 8)}`}
                </Typography>

                <Typography variant="body1" color="text.secondary" mt={1}>
                  AI-powered behavioral intelligence profile
                </Typography>

                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  <Tag color={risk.tag}>{risk.label}</Tag>

                  <Chip label={`${tenantSnapshots.length} Snapshots`} size="small" />

                  <Chip label={`${tenantHistory.length} Timeline Events`} size="small" />
                </Stack>
              </Box>
            </Stack>

            <Box sx={{ minWidth: 280 }}>
              <Typography variant="body2" color="text.secondary">
                Behavioral Health
              </Typography>

              <Typography variant="h2" fontWeight={900} mt={1}>
                {overallScore}%
              </Typography>

              <LinearProgress
                variant="determinate"
                value={overallScore}
                color={risk.color}
                sx={{
                  mt: 2,
                  height: 12,
                  borderRadius: 999
                }}
              />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* METRICS */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Rent Consistency
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {toPercent(latestSnapshot?.rentConsistency)}%
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Mobile Money
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {toPercent(latestSnapshot?.mobileMoneyVolume)}%
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Savings Health
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {toPercent(latestSnapshot?.savingsConsistency)}%
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Loan Repayment
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {toPercent(latestSnapshot?.loanRepaymentRate)}%
          </Typography>
        </Paper>
      </Grid>

      {/* SNAPSHOTS */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard title="Behavioral Snapshots">
          <AdvancedTable
            columns={columns}
            dataSource={tenantSnapshots}
            loading={isLoading}
            rowKey={(r) => r.id}
            emptyText="No tenant behavioral snapshots found."
          />
        </MainCard>
      </Grid>

      {/* TIMELINE */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <MainCard title="Feature Timeline">
          <Timeline
            mode="left"
            items={tenantHistory.map((item) => ({
              color: item.active ? 'green' : 'gray',

              children: (
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography fontWeight={700}>Snapshot Linked</Typography>

                    <Typography variant="caption" color="text.secondary">
                      Snapshot #{String(item.snapshotId).slice(0, 8)}
                    </Typography>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">Status</Typography>

                      <Tag color={item.active ? 'green' : 'default'}>{item.active ? 'ACTIVE' : 'INACTIVE'}</Tag>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {item.linkedAt ? new Date(item.linkedAt).toLocaleString() : '-'}
                    </Typography>
                  </Stack>
                </Paper>
              )
            }))}
          />
        </MainCard>
      </Grid>

      {/* AI SUMMARY */}
      <Grid size={12}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 5,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HistoryOutlined />

              <Typography variant="h5" fontWeight={700}>
                AI Behavioral Summary
              </Typography>
            </Stack>

            <Typography color="text.secondary">
              This tenant demonstrates <b>{risk.label.toLowerCase()}</b> behavioral lending characteristics based on rent discipline, mobile
              money activity, savings consistency, and repayment behavior.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Chip
                  fullWidth
                  color={toPercent(latestSnapshot?.rentConsistency) >= 70 ? 'success' : 'warning'}
                  label={`Rent Stability ${toPercent(latestSnapshot?.rentConsistency)}%`}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Chip
                  fullWidth
                  color={toPercent(latestSnapshot?.mobileMoneyVolume) >= 60 ? 'success' : 'warning'}
                  label={`Digital Economy ${toPercent(latestSnapshot?.mobileMoneyVolume)}%`}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Chip
                  fullWidth
                  color={toPercent(latestSnapshot?.loanRepaymentRate) >= 60 ? 'success' : 'error'}
                  label={`Repayment Strength ${toPercent(latestSnapshot?.loanRepaymentRate)}%`}
                />
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

TenantBehaviorProfile.propTypes = {
  tenantId: PropTypes.string
};
