import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// antd
import { Tag } from 'antd';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// icons
import RobotOutlined from '@ant-design/icons/RobotOutlined';

// fake API hook placeholder (replace with real one later)
import useSWR from 'swr';

const mockFetch = () =>
  Promise.resolve([
    { key: 'rent_consistency', label: 'Rent Consistency', weight: 0.35 },
    { key: 'late_payments', label: 'Late Payments', weight: -0.25 },
    { key: 'income_stability', label: 'Income Stability', weight: 0.25 }
  ]);

export default function AiRiskWeights() {
  const { data, mutate } = useSWR('ai-weights', mockFetch);

  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    // later replace with backend AI endpoint
    setTimeout(async () => {
      await mutate();
      setLoading(false);
    }, 1200);
  };

  return (
    <Grid container rowSpacing={3}>
      <Grid size={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PageHeader
            title="AI Risk Weight Suggestions"
            description="Automatically generated optimal scoring weights"
            icon={RobotOutlined}
          />

          <Button variant="contained" onClick={generate} disabled={loading}>
            Generate Suggestions
          </Button>
        </Stack>
      </Grid>

      <Grid size={12}>
        <MainCard>
          {!data && <Alert severity="info">Click generate to produce AI-based weights</Alert>}

          {data && (
            <Stack spacing={2}>
              {data.map((w) => (
                <Box
                  key={w.key}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid #eee',
                    borderRadius: 2
                  }}
                >
                  <Typography fontWeight={600}>{w.label}</Typography>

                  <Tag color={w.weight > 0 ? 'green' : 'red'}>{w.weight}</Tag>
                </Box>
              ))}
            </Stack>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
