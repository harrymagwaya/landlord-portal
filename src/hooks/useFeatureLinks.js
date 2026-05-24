import useSWR from 'swr';

import { API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, TENANT_FEATURE_HISTORY_ENDPOINT } from 'config';

import useAuth from './useAuth';

// ==============================|| HELPERS ||============================== //

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString();
}

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestTenantFeatureHistory(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to complete tenant feature history request.');
  }

  return data;
}

// ==============================|| FETCHERS ||============================== //

async function fetchTenantHistory([, token, tenantId]) {
  return requestTenantFeatureHistory(`${TENANT_FEATURE_HISTORY_ENDPOINT}/tenant/${tenantId}`, {
    token
  });
}

async function fetchHistoryById([, token, linkId]) {
  return requestTenantFeatureHistory(`${TENANT_FEATURE_HISTORY_ENDPOINT}/${linkId}`, {
    token
  });
}

async function fetchAllHistory([, token, params]) {
  const query = buildQuery(params);

  return requestTenantFeatureHistory(`${TENANT_FEATURE_HISTORY_ENDPOINT}${query ? `?${query}` : ''}`, {
    token
  });
}

// ==============================|| HOOKS ||============================== //

export function useTenantFeatureHistory(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['tenant-feature-history', token, tenantId] : null, fetchTenantHistory);
}

export function useTenantFeatureHistoryById(linkId) {
  const { token } = useAuth();

  return useSWR(token && linkId ? ['tenant-feature-history-id', token, linkId] : null, fetchHistoryById);
}

export function useAllTenantFeatureHistory(page = 0, size = 20) {
  const { token } = useAuth();

  return useSWR(
    token
      ? [
          'tenant-feature-history-all',
          token,
          {
            page,
            size
          }
        ]
      : null,
    fetchAllHistory
  );
}

export { requestTenantFeatureHistory };
