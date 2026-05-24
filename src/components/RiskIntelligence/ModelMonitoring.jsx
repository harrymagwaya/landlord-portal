import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useAllScores } from 'hooks/useScoring';

// icons
import MonitorOutlined from '@ant-design/icons/MonitorOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function ModelMonitoring() {
  const { data } = useAllScores();

  const rows = useMemo(() => extractList(data), [data]);

  const modelVersions = [...new Set(rows.map((r) => r.modelVersion))];

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Model Monitoring"
          description="AI model stability, prediction health & deployment monitoring."
          icon={MonitorOutlined}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Total Predictions
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {rows.length}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Active Models
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {modelVersions.length}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Latest Model
          </Typography>

          <Typography variant="h3" fontWeight={800}>
            {modelVersions[0] || '-'}
          </Typography>
        </Paper>
      </Grid>

      <Grid size={12}>
        <MainCard title="Model Registry">
          <Stack spacing={2}>
            {modelVersions.map((model) => (
              <Paper
                key={model}
                sx={{
                  p: 2.5,
                  borderRadius: 4
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={700}>{model}</Typography>

                    <Typography variant="body2" color="text.secondary">
                      Production Scoring Pipeline
                    </Typography>
                  </Box>

                  <Chip label="ACTIVE" color="success" />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
