import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, LEDGER_ENDPOINT } from 'config';

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

async function requestLedger(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete ledger request.');
  }

  return data;
}

async function fetchTenantLedger([, token, tenantId]) {
  return requestLedger(`${LEDGER_ENDPOINT}/tenant/${tenantId}`, {
    token
  });
}

async function fetchPropertyLedger([, token, propertyId]) {
  return requestLedger(`${LEDGER_ENDPOINT}/property/${propertyId}`, {
    token
  });
}

export function useTenantLedger(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['tenant-ledger', token, tenantId] : null, fetchTenantLedger);
}

export function usePropertyLedger(propertyId) {
  const { token } = useAuth();

  return useSWR(token && propertyId ? ['property-ledger', token, propertyId] : null, fetchPropertyLedger);
}

export function useLedgerActions() {
  const { token, userId } = useAuth();

  const manualAdjustment = (eventId, actualPaid, daysLate, actorId = userId) => {
    const query = buildQuery({
      actualPaid,
      daysLate
    });

    return requestLedger(`${LEDGER_ENDPOINT}/event/${eventId}/adjust?${query}`, {
      token,
      actorId,
      method: 'PATCH'
    });
  };

  return {
    manualAdjustment
  };
}

export { requestLedger };
