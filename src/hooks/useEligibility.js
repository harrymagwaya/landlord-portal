import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, ELIGIBILITY_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestEligibility(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete eligibility request.');
  }

  return data;
}

async function fetchEligibilityByTenant([, token, tenantId]) {
  return requestEligibility(`${ELIGIBILITY_ENDPOINT}/${tenantId}`, {
    token
  });
}

export function useEligibility(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['eligibility', token, tenantId] : null, fetchEligibilityByTenant);
}

export function useEligibilityActions() {
  const { token } = useAuth();

  // Uncomment if refresh endpoint is enabled later
  const refreshEligibility = (tenantId) =>
    requestEligibility(`${ELIGIBILITY_ENDPOINT}/${tenantId}/refresh`, {
      token,
      method: 'POST'
    });

  return {
    refreshEligibility
  };
}

export { requestEligibility };
