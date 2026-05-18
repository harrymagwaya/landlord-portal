import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, FINANCIAL_RECORDS_ENDPOINT } from 'config';

import useAuth from './useAuth';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString();
}

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestFinancialRecords(path, { token, actorId, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(token, actorId),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to complete financial record request.');
  }

  return data;
}

async function fetchFinancialRecordById([, token, recordId]) {
  return requestFinancialRecords(`${FINANCIAL_RECORDS_ENDPOINT}/${recordId}`, {
    token
  });
}

async function fetchTenantFinancialHistory([, token, tenantId, params]) {
  const query = buildQuery(params);

  return requestFinancialRecords(`${FINANCIAL_RECORDS_ENDPOINT}/tenant/${tenantId}${query ? `?${query}` : ''}`, {
    token
  });
}

async function fetchMonthlyArchive([, token, tenantId, params]) {
  const query = buildQuery(params);

  return requestFinancialRecords(`${FINANCIAL_RECORDS_ENDPOINT}/tenant/${tenantId}/archive?${query}`, {
    token
  });
}

export function useFinancialRecord(recordId) {
  const { token } = useAuth();

  return useSWR(token && recordId ? ['financial-record', token, recordId] : null, fetchFinancialRecordById);
}

export function useTenantFinancialHistory(tenantId, params = {}) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['financial-history', token, tenantId, params] : null, fetchTenantFinancialHistory);
}

export function useMonthlyFinancialArchive(tenantId, year, month) {
  const { token } = useAuth();

  return useSWR(token && tenantId && year && month ? ['financial-archive', token, tenantId, { year, month }] : null, fetchMonthlyArchive);
}

export function useFinancialRecordActions() {
  const { token, userId } = useAuth();

  const createFinancialRecord = (payload, actorId = userId) =>
    requestFinancialRecords(FINANCIAL_RECORDS_ENDPOINT, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateFinancialRecord = (recordId, payload) =>
    requestFinancialRecords(`${FINANCIAL_RECORDS_ENDPOINT}/${recordId}`, {
      token,
      method: 'PUT',
      body: JSON.stringify(payload)
    });

  const updateFinancialRecordStatus = (recordId, status) =>
    requestFinancialRecords(`${FINANCIAL_RECORDS_ENDPOINT}/${recordId}/status?status=${status}`, {
      token,
      method: 'PATCH'
    });

  const deleteFinancialRecord = (recordId) =>
    requestFinancialRecords(`${FINANCIAL_RECORDS_ENDPOINT}/${recordId}`, {
      token,
      method: 'DELETE'
    });

  return {
    createFinancialRecord,
    updateFinancialRecord,
    updateFinancialRecordStatus,
    deleteFinancialRecord
  };
}

export { requestFinancialRecords };
