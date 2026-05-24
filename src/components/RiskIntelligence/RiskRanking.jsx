import { useMemo } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// hooks
import { useAllScores } from 'hooks/useScoring';

// icons
import TrophyOutlined from '@ant-design/icons/TrophyOutlined';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export default function RiskRanking() {
  const { data } = useAllScores();

  const rankings = useMemo(() => {
    return extractList(data)
      .sort((a, b) => b.creditScore - a.creditScore)
      .slice(0, 20);
  }, [data]);

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PageHeader
          title="Risk Ranking"
          description="Top ranked tenants based on AI confidence & repayment potential."
          icon={TrophyOutlined}
        />
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack spacing={2}>
            {rankings.map((row, index) => (
              <Paper
                key={row.id}
                sx={{
                  p: 2.5,
                  borderRadius: 4
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50
                      }}
                    >
                      #{index + 1}
                    </Avatar>

                    <Box>
                      <Typography fontWeight={700}>Tenant {String(row.tenantId).slice(0, 8)}</Typography>

                      <Typography variant="body2" color="text.secondary">
                        {row.riskBand}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack alignItems="flex-end">
                    <Typography variant="h4" fontWeight={800}>
                      {row.creditScore}
                    </Typography>

                    <Typography variant="caption">Credit Score</Typography>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
