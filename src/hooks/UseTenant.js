import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, TENANTS_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestTenants(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete tenant request.');
  }

  return data;
}

async function fetchTenants([, token]) {
  return requestTenants(TENANTS_ENDPOINT, { token });
}

async function fetchTenantByUserId([, token, userId]) {
  return requestTenants(`${TENANTS_ENDPOINT}/${userId}`, { token });
}

export function useTenants() {
  const { token } = useAuth();

  return useSWR(token ? ['tenants', token] : null, fetchTenants);
}

export function useTenant(userId) {
  const { token } = useAuth();

  return useSWR(token && userId ? ['tenant', token, userId] : null, fetchTenantByUserId);
}

export function useTenantActions() {
  const { token, userId } = useAuth();

  const updateTenant = (tenantUserId, payload, actorId = userId) =>
    requestTenants(`${TENANTS_ENDPOINT}/${tenantUserId}`, {
      token,
      actorId,
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

  const deleteTenant = (tenantUserId) =>
    requestTenants(`${TENANTS_ENDPOINT}/${tenantUserId}`, {
      token,
      method: 'DELETE'
    });

  return {
    updateTenant,
    deleteTenant
  };
}

export { requestTenants };
