import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, RENTAL_PROFILES_ENDPOINT } from 'config';

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

async function requestRentalProfiles(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete rental profile request.');
  }

  return data;
}

async function fetchRentalProfiles([, token]) {
  return requestRentalProfiles(RENTAL_PROFILES_ENDPOINT, {
    token
  });
}

async function fetchRentalProfileById([, token, id]) {
  return requestRentalProfiles(`${RENTAL_PROFILES_ENDPOINT}/${id}`, {
    token
  });
}

async function fetchRentalProfilesByTenant([, token, tenantId]) {
  return requestRentalProfiles(`${RENTAL_PROFILES_ENDPOINT}/tenant/${tenantId}`, {
    token
  });
}

export function useRentalProfiles() {
  const { token } = useAuth();

  return useSWR(token ? ['rental-profiles', token] : null, fetchRentalProfiles);
}

export function useRentalProfile(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['rental-profile', token, id] : null, fetchRentalProfileById);
}

export function useRentalProfilesByTenant(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['rental-profiles-tenant', token, tenantId] : null, fetchRentalProfilesByTenant);
}

export function useRentalProfileActions() {
  const { token, userId } = useAuth();

  const createRentalProfile = (payload, actorId = userId) =>
    requestRentalProfiles(RENTAL_PROFILES_ENDPOINT, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateRentalProfile = (id, payload) =>
    requestRentalProfiles(`${RENTAL_PROFILES_ENDPOINT}/${id}`, {
      token,
      method: 'PUT',
      body: JSON.stringify(payload)
    });

  const terminateLease = (id) =>
    requestRentalProfiles(`${RENTAL_PROFILES_ENDPOINT}/${id}/terminate`, {
      token,
      method: 'PATCH'
    });

  const deleteRentalProfile = (id) =>
    requestRentalProfiles(`${RENTAL_PROFILES_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  return {
    createRentalProfile,
    updateRentalProfile,
    terminateLease,
    deleteRentalProfile
  };
}

export { requestRentalProfiles };
