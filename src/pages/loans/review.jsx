import { useMemo, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Tag } from 'antd';

// project imports
import { useLoanActions, useLoanApplications } from 'api/loans';
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import FileSearchOutlined from '@ant-design/icons/FileSearchOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';

const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

const statusColor = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red'
};

function getLoanId(loan) {
  return loan?.id || loan?.loanId || loan?.applicationId;
}

function getApplicantName(loan) {
  const names = [loan?.tenant?.firstName, loan?.tenant?.lastName].filter(Boolean).join(' ');

  return loan?.applicantName || loan?.tenantName || names || loan?.tenant?.email || 'Unknown applicant';
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(value) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

export default function LoanReviewPage() {
  const [status, setStatus] = useState('PENDING');
  const [actionState, setActionState] = useState({ type: null, loan: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [busyLoanId, setBusyLoanId] = useState(null);
  const [notice, setNotice] = useState({ type: 'success', message: '' });

  const { data: loans = [], error, isLoading, mutate } = useLoanApplications(status);
  const { approveLoan, rejectLoan } = useLoanActions();

  const pendingCount = useMemo(() => loans.filter((loan) => (loan.status || 'PENDING') === 'PENDING').length, [loans]);
  const columns = [
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_, loan) => (
        <Stack sx={{ gap: 0.25 }}>
          <Typography variant="subtitle1">{getApplicantName(loan)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {getLoanId(loan) || 'No application id'}
          </Typography>
        </Stack>
      )
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, loan) => formatCurrency(loan.amount || loan.principal || loan.requestedAmount)
    },
    {
      title: 'Score',
      key: 'score',
      render: (_, loan) => loan.score ?? loan.creditScore ?? '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (loanStatus = 'PENDING') => <Tag color={statusColor[loanStatus] || 'default'}>{loanStatus}</Tag>
    },
    {
      title: 'Submitted',
      key: 'submitted',
      render: (_, loan) => formatDate(loan.createdAt || loan.submittedAt || loan.applicationDate)
    }
  ];

  const closeDialog = () => {
    setActionState({ type: null, loan: null });
    setRejectionReason('');
  };

  const handleApprove = async (loan) => {
    const loanId = getLoanId(loan);
    setBusyLoanId(loanId);

    try {
      await approveLoan(loanId);
      setNotice({ type: 'success', message: 'Loan approved.' });
      mutate();
    } catch (approvalError) {
      setNotice({ type: 'error', message: approvalError.message });
    } finally {
      setBusyLoanId(null);
    }
  };

  const handleReject = async () => {
    const loanId = getLoanId(actionState.loan);
    setBusyLoanId(loanId);

    try {
      await rejectLoan(loanId, rejectionReason);
      setNotice({ type: 'success', message: 'Loan rejected.' });
      closeDialog();
      mutate();
    } catch (rejectionError) {
      setNotice({ type: 'error', message: rejectionError.message });
    } finally {
      setBusyLoanId(null);
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <PageHeader title="Loan Applications" description="Review pending loan requests and make approval decisions." icon={FileSearchOutlined} />
          </Box>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Select size="small" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 150 }}>
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <Button variant="outlined" color="secondary" startIcon={<ReloadOutlined />} onClick={() => mutate()}>
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MainCard>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h6" color="text.secondary">
              Loaded Applications
            </Typography>
            <Typography variant="h3">{loans.length}</Typography>
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MainCard>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h6" color="text.secondary">
              Pending Review
            </Typography>
            <Typography variant="h3">{pendingCount}</Typography>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard content={false}>
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error.message}</Alert>
            </Box>
          )}
          <AdvancedTable
            columns={columns}
            dataSource={loans}
            rowKey={(loan) => getLoanId(loan) || getApplicantName(loan)}
            loading={isLoading}
            emptyText="No loan applications found."
            detailTitle={(loan) => getApplicantName(loan)}
            detailItems={(loan) => {
              const loanStatus = loan.status || 'PENDING';

              return [
                {
                  key: 'id',
                  label: 'Application ID',
                  children: getLoanId(loan) || '-'
                },
                {
                  key: 'applicant',
                  label: 'Applicant',
                  children: getApplicantName(loan)
                },
                {
                  key: 'amount',
                  label: 'Amount',
                  children: formatCurrency(loan.amount || loan.principal || loan.requestedAmount)
                },
                {
                  key: 'score',
                  label: 'Score',
                  children: loan.score ?? loan.creditScore ?? '-'
                },
                {
                  key: 'status',
                  label: 'Status',
                  children: <Tag color={statusColor[loanStatus] || 'default'}>{loanStatus}</Tag>
                },
                {
                  key: 'submitted',
                  label: 'Submitted',
                  children: formatDate(loan.createdAt || loan.submittedAt || loan.applicationDate)
                }
              ];
            }}
            detailActions={(loan, closeDrawer) => {
              const loanId = getLoanId(loan);
              const loanStatus = loan.status || 'PENDING';
              const isBusy = busyLoanId === loanId;

              return (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleOutlined />}
                    disabled={isBusy || loanStatus !== 'PENDING'}
                    onClick={() => {
                      handleApprove(loan);
                      closeDrawer();
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CloseCircleOutlined />}
                    disabled={isBusy || loanStatus !== 'PENDING'}
                    onClick={() => {
                      setActionState({ type: 'reject', loan });
                      closeDrawer();
                    }}
                  >
                    Reject
                  </Button>
                </>
              );
            }}
          />
        </MainCard>
      </Grid>

      <Dialog open={actionState.type === 'reject'} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Reject Loan Application</DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 1, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {getApplicantName(actionState.loan)}
            </Typography>
            <OutlinedInput
              multiline
              minRows={4}
              fullWidth
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Add a reason for the decision"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button color="error" variant="contained" disabled={!rejectionReason.trim() || Boolean(busyLoanId)} onClick={handleReject}>
            Reject Loan
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice.message)} autoHideDuration={3500} onClose={() => setNotice({ ...notice, message: '' })}>
        <Alert severity={notice.type} variant="filled" onClose={() => setNotice({ ...notice, message: '' })}>
          {notice.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
