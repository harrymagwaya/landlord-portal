import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, TENANT_CAPACITIES_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestTenantCapacities(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete tenant capacity request.');
  }

  return data;
}

async function fetchAllTenantCapacities([, token]) {
  return requestTenantCapacities(TENANT_CAPACITIES_ENDPOINT, {
    token
  });
}

async function fetchTenantCapacityByTenant([, token, tenantId]) {
  return requestTenantCapacities(`${TENANT_CAPACITIES_ENDPOINT}/${tenantId}`, {
    token
  });
}

async function fetchTenantCapacityById([, token, id]) {
  return requestTenantCapacities(`${TENANT_CAPACITIES_ENDPOINT}/record/${id}`, {
    token
  });
}

export function useTenantCapacities() {
  const { token } = useAuth();

  return useSWR(token ? ['tenant-capacities', token] : null, fetchAllTenantCapacities);
}

export function useTenantCapacity(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['tenant-capacity', token, tenantId] : null, fetchTenantCapacityByTenant);
}

export function useTenantCapacityById(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['tenant-capacity-id', token, id] : null, fetchTenantCapacityById);
}

export function useTenantCapacityActions() {
  const { token, userId } = useAuth();

  const upsertCapacity = (payload, actorId = userId) =>
    requestTenantCapacities(`${TENANT_CAPACITIES_ENDPOINT}/upsert`, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const deleteCapacity = (id) =>
    requestTenantCapacities(`${TENANT_CAPACITIES_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  return {
    upsertCapacity,
    deleteCapacity
  };
}

export { requestTenantCapacities };
