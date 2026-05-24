import { useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// antd
import { Tag } from 'antd';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// icons
import RobotOutlined from '@ant-design/icons/RobotOutlined';

// hooks
import { useAllScores } from 'hooks/useScoring';

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function prettifyLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildWeights(rows) {
  if (!rows.length) return [];

  const targetKey =
    ['score', 'creditScore', 'finalScore', 'riskScore', 'totalScore'].find((k) => rows.some((r) => getNumeric(r?.[k]) !== null)) || null;
  const ignore = new Set(['id', 'tenantId', 'userId', 'createdAt', 'updatedAt', 'month', 'year', targetKey].filter(Boolean));

  const numericKeys = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row || {}).forEach((key) => {
        if (!ignore.has(key) && getNumeric(row[key]) !== null) keys.add(key);
      });
      return keys;
    }, new Set())
  );

  if (!numericKeys.length) return [];

  const raw = numericKeys.map((key) => {
    const values = rows.map((r) => getNumeric(r[key])).filter((v) => v !== null);
    const mean = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    let sign = 1;

    if (targetKey) {
      const pairs = rows
        .map((r) => {
          const x = getNumeric(r[key]);
          const y = getNumeric(r[targetKey]);
          return x !== null && y !== null ? { x, y } : null;
        })
        .filter(Boolean);

      if (pairs.length > 1) {
        const meanX = pairs.reduce((s, p) => s + p.x, 0) / pairs.length;
        const meanY = pairs.reduce((s, p) => s + p.y, 0) / pairs.length;
        const cov = pairs.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0) / pairs.length;
        sign = cov >= 0 ? 1 : -1;
      }
    }

    return {
      key,
      label: prettifyLabel(key),
      magnitude: Math.abs(mean),
      sign
    };
  });

  const total = raw.reduce((s, item) => s + item.magnitude, 0) || 1;
  return raw
    .map((item) => ({
      key: item.key,
      label: item.label,
      weight: Number(((item.sign * item.magnitude) / total).toFixed(3))
    }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 8);
}

export default function AiRiskWeights() {
  const { data, error, isLoading, mutate } = useAllScores();

  const [loading, setLoading] = useState(false);
  const rows = useMemo(() => extractList(data), [data]);
  const weights = useMemo(() => buildWeights(rows), [rows]);

  const generate = async () => {
    setLoading(true);
    await mutate();
    setLoading(false);
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
          {error && <Alert severity="error">{error.message}</Alert>}
          {!error && !isLoading && !rows.length && <Alert severity="info">No scoring data available yet.</Alert>}
          {(isLoading || loading) && <CircularProgress size={24} />}

          {!isLoading && !loading && weights.length > 0 && (
            <Stack spacing={2}>
              {weights.map((w) => (
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

                  <Tag color={w.weight > 0 ? 'green' : 'red'}>{w.weight > 0 ? `+${w.weight}` : w.weight}</Tag>
                </Box>
              ))}
            </Stack>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
