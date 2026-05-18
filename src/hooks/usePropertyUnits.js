import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, UNITS_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestUnits(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete unit request.');
  }

  return data;
}

async function fetchUnitById([, token, id]) {
  return requestUnits(`${UNITS_ENDPOINT}/${id}`, {
    token
  });
}

async function fetchUnitsByProperty([, token, propertyId]) {
  return requestUnits(`${UNITS_ENDPOINT}/${propertyId}/units`, {
    token
  });
}

async function fetchUnitByTenant([, token, tenantId]) {
  return requestUnits(`${UNITS_ENDPOINT}/tenant/${tenantId}`, {
    token
  });
}

export function useUnit(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['unit', token, id] : null, fetchUnitById);
}

export function useUnitsByProperty(propertyId) {
  const { token } = useAuth();

  return useSWR(token && propertyId ? ['units-property', token, propertyId] : null, fetchUnitsByProperty);
}

export function useUnitByTenant(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['unit-tenant', token, tenantId] : null, fetchUnitByTenant);
}

export function useUnitActions() {
  const { token, userId } = useAuth();

  const addUnit = (propertyId, payload, actorId = userId) =>
    requestUnits(`${UNITS_ENDPOINT}/property/${propertyId}`, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateUnit = (id, payload) =>
    requestUnits(`${UNITS_ENDPOINT}/${id}`, {
      token,
      method: 'PUT',
      body: JSON.stringify(payload)
    });

  const deleteUnit = (id) =>
    requestUnits(`${UNITS_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  return {
    addUnit,
    updateUnit,
    deleteUnit
  };
}

export { requestUnits };
