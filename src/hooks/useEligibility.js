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
  return requestEligibility(`${ELIGIBILITY_ENDPOINT}/tenant/${tenantId}/latest`, {
    token
  });
}

async function fetchEligibilityById([, token, id]) {
  return requestEligibility(`${ELIGIBILITY_ENDPOINT}/${id}`, {
    token
  });
}

async function fetchEligibilityList([, token, page, size]) {
  return requestEligibility(`${ELIGIBILITY_ENDPOINT}/paged?page=${page}&size=${size}`, {
    token
  });
}

export function useEligibility(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['eligibility', token, tenantId] : null, fetchEligibilityByTenant);
}

export function useEligibilityById(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['eligibility-by-id', token, id] : null, fetchEligibilityById);
}

export function useEligibilityList(page = 0, size = 20) {
  const { token } = useAuth();

  return useSWR(token ? ['eligibility-list', token, page, size] : null, fetchEligibilityList);
}

export function useEligibilityActions() {
  const { token } = useAuth();

  const assessEligibility = (tenantId) =>
    requestEligibility(`${ELIGIBILITY_ENDPOINT}/tenant/${tenantId}/assess`, {
      token,
      method: 'POST'
    });

  return {
    assessEligibility
  };
}

export { requestEligibility };
