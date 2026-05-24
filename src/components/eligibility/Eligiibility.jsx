import { useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// antd
import { Tag } from 'antd';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';

// hooks
import * as EligibilityHooks from 'hooks/useEligibility';
import { useAllScores, useScoringActions } from 'hooks/useScoring';

// icons
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// ==============================|| HELPERS ||============================== //

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getTenantId(item) {
  return item?.tenantId || item?.tenant?.id || item?.userId || null;
}

function getScoreValue(item) {
  const key = ['score', 'creditScore', 'finalScore', 'riskScore', 'totalScore'].find((k) => Number.isFinite(Number(item?.[k])));
  return key ? Number(item[key]) : null;
}

// ==============================|| PAGE ||============================== //

export default function Eligibility() {
  const useEligibilityListHook = EligibilityHooks.useEligibilityList;
  const { data, error, isLoading, mutate } = useEligibilityListHook ? useEligibilityListHook() : { data: [], error: null, isLoading: false };
  const { assessEligibility } = EligibilityHooks.useEligibilityActions();
  const { data: scoresData, mutate: mutateScores } = useAllScores();
  const { generateScore } = useScoringActions();
  const [tenantId, setTenantId] = useState('');
  const [checking, setChecking] = useState(false);
  const [actionError, setActionError] = useState('');

  const list = useMemo(() => extractList(data), [data]);
  const scoreRows = useMemo(() => extractList(scoresData), [scoresData]);
  const scoreByTenant = useMemo(() => {
    return scoreRows.reduce((acc, row) => {
      const tid = getTenantId(row);
      if (!tid) return acc;
      const ts = new Date(row?.updatedAt || row?.createdAt || row?.scoredAt || row?.timestamp || 0).getTime();
      const prev = acc[tid];
      if (!prev || ts >= prev.ts) {
        acc[tid] = { ts, score: getScoreValue(row), at: row?.updatedAt || row?.createdAt || row?.scoredAt || row?.timestamp || null };
      }
      return acc;
    }, {});
  }, [scoreRows]);

  const runEligibilityCheck = async () => {
    if (!tenantId.trim()) return;
    try {
      setChecking(true);
      setActionError('');
      await assessEligibility(tenantId.trim());
      await mutateScores();
      await mutate();
    } catch (e) {
      setActionError(e?.message || 'Failed to check eligibility.');
    } finally {
      setChecking(false);
    }
  };

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'tenantId',
      key: 'tenantId',
      width: 220,
      render: (id) => <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>{id?.slice(0, 8)}...</Box>
    },
    {
      title: 'Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      width: 100
    },
    {
      title: 'Latest Score',
      key: 'latestScore',
      width: 120,
      render: (_, row) => {
        const entry = scoreByTenant[getTenantId(row)];
        return entry?.score ?? '-';
      }
    },
    {
      title: 'Risk Band',
      dataIndex: 'riskBand',
      key: 'riskBand',
      width: 120,
      render: (band) => {
        const color =
          band === 'PLATINUM' ? 'green' : band === 'GOLD' ? 'gold' : band === 'SILVER' ? 'blue' : band === 'BRONZE' ? 'orange' : 'red';

        return <Tag color={color}>{band}</Tag>;
      }
    },
    {
      title: 'Max Limit',
      dataIndex: 'currentMaxLimit',
      key: 'currentMaxLimit',
      width: 120,
      render: (v) => <b>{v}</b>
    },
    {
      title: 'Allowed',
      dataIndex: 'calculationAllowed',
      key: 'calculationAllowed',
      width: 100,
      render: (v) => (v ? <Chip label="Allowed" color="success" size="small" /> : <Chip label="Blocked" color="error" size="small" />)
    },
    {
      title: 'Scored At',
      key: 'scoredAt',
      width: 170,
      render: (_, row) => {
        const entry = scoreByTenant[getTenantId(row)];
        return entry?.at ? new Date(entry.at).toLocaleDateString() : '-';
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, row) => {
        const tid = getTenantId(row);
        return (
          <Button
            size="small"
            variant="outlined"
            disabled={!tid || checking}
            onClick={async () => {
              try {
                setChecking(true);
                setActionError('');
                await generateScore(tid);
                await assessEligibility(tid);
                await Promise.all([mutateScores(), mutate()]);
              } catch (e) {
                setActionError(e?.message || 'Failed to refresh tenant eligibility.');
              } finally {
                setChecking(false);
              }
            }}
          >
            Refresh
          </Button>
        );
      }
    }
  ];

  return (
    <Grid container rowSpacing={3}>
      {/* HEADER */}
      <Grid size={12}>
        <PageHeader
          title="Eligibility Engine"
          description="Tenant borrowing capacity & risk-based eligibility"
          icon={CheckCircleOutlined}
        />
      </Grid>

      <Grid size={12}>
        <MainCard>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
            <TextField
              label="Tenant ID"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              fullWidth
              placeholder="0df2d562-827a-4e39-852f-0173faeae4b8"
            />
            <Button variant="contained" disabled={!tenantId.trim() || checking} onClick={runEligibilityCheck}>
              {checking ? 'Checking...' : 'Check Eligibility'}
            </Button>
          </Stack>
          {actionError ? (
            <Alert sx={{ mt: 2 }} severity="error">
              {actionError}
            </Alert>
          ) : null}
        </MainCard>
      </Grid>

      {/* ERROR */}
      {error && (
        <Grid size={12}>
          <Alert severity="error">{error.message}</Alert>
        </Grid>
      )}

      {/* TABLE */}
      <Grid size={12}>
        <MainCard content={false}>
          <AdvancedTable
            columns={columns}
            dataSource={list}
            loading={isLoading}
            rowKey={(r) => r.tenantId}
            emptyText="No eligibility records found."
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
