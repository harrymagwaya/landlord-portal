import { useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// project
import PageHeader from 'components/PageHeader';

// hooks
import { useAllScores } from 'hooks/useScoring';

// icons
import BulbOutlined from '@ant-design/icons/BulbOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function PredictionInsights() {
  const { data } = useAllScores();

  const rows = useMemo(() => extractList(data), [data]);

  const avgDefault =
    rows.length > 0 ? Math.round((rows.reduce((sum, r) => sum + Number(r.probabilityOfDefault || 0), 0) / rows.length) * 100) : 0;

  const avgScore = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + Number(r.creditScore || 0), 0) / rows.length) : 0;

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Prediction Insights"
          description="Machine learning insights from repayment prediction models."
          icon={BulbOutlined}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5">Average Default Risk</Typography>

            <Typography variant="h2" fontWeight={800}>
              {avgDefault}%
            </Typography>

            <LinearProgress
              variant="determinate"
              value={avgDefault}
              color={avgDefault >= 70 ? 'error' : 'warning'}
              sx={{
                height: 10,
                borderRadius: 999
              }}
            />
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5">Average Credit Score</Typography>

            <Typography variant="h2" fontWeight={800}>
              {avgScore}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={avgScore}
              sx={{
                height: 10,
                borderRadius: 999
              }}
            />
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
