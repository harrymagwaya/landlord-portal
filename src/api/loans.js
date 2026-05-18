import useSWR from 'swr';

import { API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, LOANS_ENDPOINT } from 'config';
import useAuth from 'hooks/useAuth';

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

function normalizeLoans(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

async function requestLoanAdmin(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to complete loan request.');
  }

  return data;
}

async function fetchLoans([, token, status]) {
  const params = new URLSearchParams();

  if (status && status !== 'ALL') {
    params.set('status', status);
  }

  const query = params.toString();
  const data = await requestLoanAdmin(`${LOANS_ENDPOINT}${query ? `?${query}` : ''}`, token);

  return normalizeLoans(data);
}

export function useLoanApplications(status = 'PENDING') {
  const { token } = useAuth();

  return useSWR(token ? ['loan-applications', token, status] : null, fetchLoans);
}

export function useLoanActions() {
  const { token } = useAuth();

  const approveLoan = (loanId) =>
    requestLoanAdmin(`${LOANS_ENDPOINT}/${loanId}/approve`, token, {
      method: 'PATCH'
    });

  const rejectLoan = (loanId, reason) =>
    requestLoanAdmin(`${LOANS_ENDPOINT}/${loanId}/reject`, token, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });

  return { approveLoan, rejectLoan };
}
