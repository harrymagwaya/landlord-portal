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
import Autocomplete from '@mui/material/Autocomplete';

// antd
import { Tag } from 'antd';

// project
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import AdvancedTable from 'components/AdvancedTable';
import ShortId from 'components/ShortId';

// hooks
import * as EligibilityHooks from 'hooks/useEligibility';
import { useAllScores, useScoringActions } from 'hooks/useScoring';
import { useUsers } from 'hooks/useUsers';

// icons
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';

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

function isTenantUser(user) {
  return (user?.userRole || user?.role || user?.userType) === 'TENANT';
}

function formatPercent(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return `${Math.round(Number(value) * 100)}%`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

function getRiskColor(value) {
  if (value === 'PLATINUM' || value === 'LOW_RISK') return 'green';
  if (value === 'GOLD' || value === 'MEDIUM_RISK') return 'gold';
  if (value === 'SILVER') return 'blue';
  if (value === 'BRONZE') return 'orange';
  return 'red';
}

// Detect if a tenant has no real behavioral history yet
// Backend returns score=0, PD=1, successRate=0 as defaults for empty profiles
function isFreshProfile(item) {
  const score = Number(item?.creditScore);
  const pd = Number(item?.probabilityOfDefault);
  const sr = Number(item?.successRate);
  // If score is 0 AND PD is 1 (or very close) AND successRate is 0, it's a default/empty state
  return score === 0 && pd >= 0.99 && sr === 0;
}

// ==============================|| PAGE ||============================== //

export default function Eligibility() {
  const [tenantId, setTenantId] = useState('');
  const [checking, setChecking] = useState(false);
  const [actionError, setActionError] = useState('');
  const useEligibilityListHook = EligibilityHooks.useEligibilityList;
  const { data, error, isLoading, mutate } = useEligibilityListHook
    ? useEligibilityListHook()
    : { data: [], error: null, isLoading: false };
  const {
    data: singleTenantEligibility,
    isLoading: isTenantEligibilityLoading,
    mutate: mutateSingleTenant
  } = EligibilityHooks.useEligibility(tenantId.trim() || null);
  const { assessEligibility } = EligibilityHooks.useEligibilityActions();
  const { data: scoresData, mutate: mutateScores } = useAllScores();
  const { data: usersData } = useUsers({ size: 200 });
  const { generateScore } = useScoringActions();

  const list = useMemo(() => extractList(data), [data]);
  const users = useMemo(() => extractList(usersData).filter(isTenantUser), [usersData]);
  const tenantOptions = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email || u.id
      })),
    [users]
  );
  const scoreRows = useMemo(() => extractList(scoresData), [scoresData]);
  const selectedTenantRows = useMemo(() => {
    if (!tenantId.trim()) return list;
    if (!singleTenantEligibility) return [];
    return [singleTenantEligibility];
  }, [tenantId, list, singleTenantEligibility]);
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
      await Promise.all([mutate(), mutateSingleTenant()]);
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
      render: (id) => <ShortId value={id} />
    },
    {
      title: 'Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      width: 120,
      render: (value, row) => {
        if (isFreshProfile(row)) {
          return <Chip size="small" label="Building..." sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />;
        }
        return <Typography fontWeight={700}>{value}</Typography>;
      }
    },
    {
      title: 'Risk Band',
      dataIndex: 'riskBand',
      key: 'riskBand',
      width: 120,
      render: (band, row) => {
        if (isFreshProfile(row)) {
          return <Chip size="small" label="Pending" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />;
        }
        return <Tag color={getRiskColor(band)}>{band || 'UNKNOWN'}</Tag>;
      }
    },
    {
      title: 'Risk Category',
      dataIndex: 'riskCategory',
      key: 'riskCategory',
      width: 120,
      render: (category, row) => {
        if (isFreshProfile(row)) {
          return <Chip size="small" label="Pending" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />;
        }
        return <Tag color={getRiskColor(category)}>{category || 'UNKNOWN'}</Tag>;
      }
    },
    {
      title: 'Probability of Default',
      dataIndex: 'probabilityOfDefault',
      key: 'probabilityOfDefault',
      width: 180,
      render: (value, row) => {
        if (isFreshProfile(row)) {
          return (
            <Typography fontSize="0.875rem" color="text.secondary">
              Insufficient data
            </Typography>
          );
        }
        return (
          <Typography fontWeight={700} color={value > 0.5 ? '#ef4444' : '#16a34a'}>
            {formatPercent(value)}
          </Typography>
        );
      }
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 130,
      render: (value, row) => {
        if (isFreshProfile(row)) {
          return (
            <Typography fontSize="0.875rem" color="text.secondary">
              Insufficient data
            </Typography>
          );
        }
        return (
          <Typography fontWeight={700} color={value > 0.5 ? '#16a34a' : '#ef4444'}>
            {formatPercent(value)}
          </Typography>
        );
      }
    },
    {
      title: 'Model Version',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      width: 140,
      render: (value) => value || '-'
    },
    {
      title: 'Calculated At',
      dataIndex: 'calculatedAt',
      key: 'calculatedAt',
      width: 190,
      render: (value) => formatDate(value)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, row) => {
        const tid = getTenantId(row);
        const isFresh = isFreshProfile(row);
        return (
          <Button
            size="small"
            variant={isFresh ? 'contained' : 'outlined'}
            disabled={!tid || checking}
            onClick={async () => {
              try {
                setChecking(true);
                setActionError('');
                await generateScore(tid);
                await assessEligibility(tid);
                await Promise.all([mutateScores(), mutate(), mutateSingleTenant()]);
              } catch (e) {
                setActionError(e?.message || 'Failed to refresh tenant eligibility.');
              } finally {
                setChecking(false);
              }
            }}
          >
            {isFresh ? 'Generate First Score' : 'Refresh'}
          </Button>
        );
      }
    }
  ];

  const selectedIsFresh = selectedTenantRows.length === 1 && isFreshProfile(selectedTenantRows[0]);

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
            <Autocomplete
              options={tenantOptions}
              value={tenantOptions.find((o) => o.id === tenantId) || null}
              onChange={(_, option) => setTenantId(option?.id || '')}
              renderInput={(params) => <TextField {...params} label="Find Tenant" />}
              sx={{ width: { xs: '100%', md: 360 } }}
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

      {/* INFO BANNER for new tenants */}
      {selectedIsFresh && (
        <Grid size={12}>
          <Alert severity="info" icon={<InfoCircleOutlined />} sx={{ borderRadius: 2, alignItems: 'center' }}>
            <Typography fontWeight={700} gutterBottom>
              New Behavioral Profile
            </Typography>
            <Typography fontSize="0.875rem">
              This tenant has no recorded payment history yet. The scoring engine requires at least{' '}
              <strong>30 days of rent and transaction data</strong> to produce a meaningful score. Values shown are system defaults, not
              predictions.
            </Typography>
          </Alert>
        </Grid>
      )}

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
            dataSource={selectedTenantRows}
            loading={tenantId.trim() ? isTenantEligibilityLoading : isLoading}
            rowKey={(r) => r.tenantId}
            emptyText="No eligibility records found."
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
