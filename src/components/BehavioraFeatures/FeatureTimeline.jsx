// import { useMemo } from 'react';
// import { Timeline } from 'antd';

// import Grid from '@mui/material/Grid';
// import Paper from '@mui/material/Paper';
// import Typography from '@mui/material/Typography';

// import PageHeader from 'components/PageHeader';
// import MainCard from 'components/MainCard';

// import { useAllTenantFeatureHistory } from 'hooks/useFeatureLinks';

// function extract(data) {
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data?.content)) return data.content;
//   return [];
// }

// export default function FeatureTimeline() {
//   const { data } = useAllTenantFeatureHistory(0, 50);
//   const rows = useMemo(() => extract(data), [data]);

//   return (
//     <Grid container spacing={3}>
//       <Grid size={12}>
//         <PageHeader title="Feature Timeline" description="Behavioral feature evolution across time." icon={HistoryOutlined} />
//       </Grid>

//       {/* KPI CARDS */}
//       <Grid size={{ xs: 12, md: 4 }}>
//         <Paper sx={{ p: 3 }}>
//           <Typography color="text.secondary">Timeline Events</Typography>

//           <Typography variant="h3" fontWeight={800}>
//             4,291
//           </Typography>
//         </Paper>
//       </Grid>

//       <Grid size={{ xs: 12, md: 4 }}>
//         <Paper sx={{ p: 3 }}>
//           <Typography color="text.secondary">Active Signals</Typography>

//           <Typography variant="h3" fontWeight={800}>
//             1,094
//           </Typography>
//         </Paper>
//       </Grid>

//       <Grid size={{ xs: 12, md: 4 }}>
//         <Paper sx={{ p: 3 }}>
//           <Typography color="text.secondary">Linked Tenants</Typography>

//           <Typography variant="h3" fontWeight={800}>
//             812
//           </Typography>
//         </Paper>
//       </Grid>

//       {/* TIMELINE */}
//       <Grid size={12}>
//         <MainCard title="Behavior Event Stream">
//           <Timeline
//             mode="left"
//             items={[
//               {
//                 color: 'green',

//                 children: (
//                   <Paper sx={{ p: 2.5 }}>
//                     <Typography fontWeight={700}>Rent consistency improved</Typography>

//                     <Typography variant="body2" color="text.secondary">
//                       Tenant 0df2d562
//                     </Typography>

//                     <Typography variant="caption">May 23, 2026</Typography>
//                   </Paper>
//                 )
//               },

//               {
//                 color: 'orange',

//                 children: (
//                   <Paper sx={{ p: 2.5 }}>
//                     <Typography fontWeight={700}>Mobile money activity dropped</Typography>

//                     <Typography variant="body2" color="text.secondary">
//                       Tenant 8ad72c11
//                     </Typography>

//                     <Typography variant="caption">May 20, 2026</Typography>
//                   </Paper>
//                 )
//               }
//             ]}
//           />
//         </MainCard>
//       </Grid>
//     </Grid>
//   );
// }
import { useMemo } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// antd
import { Timeline, Tag } from 'antd';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useAllTenantFeatureHistory } from 'hooks/useFeatureLinks';

// icons
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function randomScore() {
  return Math.floor(Math.random() * 100);
}

// ==============================|| PAGE ||============================== //

export default function BehavioralTimeline() {
  const { data, error } = useAllTenantFeatureHistory(0, 100);

  const rows = useMemo(() => extractList(data), [data]);

  return (
    <Grid container spacing={3}>
      {/* HEADER */}
      <Grid size={12}>
        <PageHeader
          title="Feature Timeline"
          description="Behavioral event intelligence & historical feature evolution."
          icon={HistoryOutlined}
        />
      </Grid>

      {/* KPIs */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Timeline Events
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {rows.length}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Active Feature Links
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {rows.filter((r) => r.active).length}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Linked Tenants
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {new Set(rows.map((r) => r.tenantId)).size}
          </Typography>
        </Paper>
      </Grid>

      {/* ERROR */}
      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      {/* TIMELINE */}
      <Grid size={12}>
        <MainCard title="Behavioral Event Stream">
          <Timeline
            mode="left"
            items={rows.map((record) => {
              const behaviorScore = randomScore();

              return {
                color: record.active ? 'green' : 'gray',

                children: (
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Stack spacing={3}>
                      {/* HEADER */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 52,
                              height: 52,
                              bgcolor: 'primary.main'
                            }}
                          >
                            {String(record.tenantId || 'T')
                              .slice(0, 1)
                              .toUpperCase()}
                          </Avatar>

                          <Box>
                            <Typography fontWeight={800}>Tenant {String(record.tenantId).slice(0, 8)}</Typography>

                            <Typography variant="caption" color="text.secondary">
                              Snapshot #{String(record.snapshotId).slice(0, 8)}
                            </Typography>
                          </Box>
                        </Stack>

                        <Tag color={record.active ? 'green' : 'default'}>{record.active ? 'ACTIVE' : 'INACTIVE'}</Tag>
                      </Stack>

                      {/* EVENT */}
                      <Box>
                        <Typography fontWeight={700}>Snapshot Intelligence Updated</Typography>

                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          Behavioral features linked to tenant profile and synchronized into risk intelligence engine.
                        </Typography>
                      </Box>

                      {/* SCORE */}
                      <Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">Behavior Health</Typography>

                          <Typography fontWeight={700}>{behaviorScore}%</Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={behaviorScore}
                          color={behaviorScore >= 75 ? 'success' : behaviorScore >= 45 ? 'warning' : 'error'}
                          sx={{
                            mt: 1,
                            height: 9,
                            borderRadius: 999
                          }}
                        />
                      </Box>

                      {/* SIGNALS */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip label={`Tenant ${String(record.tenantId).slice(0, 6)}`} size="small" color="primary" />

                        <Chip label={`Feature Link`} size="small" color="success" />

                        <Chip label={new Date(record.linkedAt).toLocaleDateString()} size="small" variant="outlined" />
                      </Stack>
                    </Stack>
                  </Paper>
                )
              };
            })}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}