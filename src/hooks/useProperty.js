import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, PROPERTIES_ENDPOINT } from 'config';

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

async function requestProperties(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete property request.');
  }

  return data;
}

async function fetchProperties([, token, params]) {
  const query = buildQuery(params);

  return requestProperties(`${PROPERTIES_ENDPOINT}${query ? `?${query}` : ''}`, {
    token
  });
}

async function fetchPropertyById([, token, id]) {
  return requestProperties(`${PROPERTIES_ENDPOINT}/${id}`, {
    token
  });
}

async function fetchPropertiesByLandlord([, token, landlordId]) {
  return requestProperties(`${PROPERTIES_ENDPOINT}/landlord/${landlordId}`, {
    token
  });
}

export function useProperties(params = {}) {
  const { token } = useAuth();

  return useSWR(token ? ['properties', token, params] : null, fetchProperties);
}

export function useProperty(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['property', token, id] : null, fetchPropertyById);
}

export function usePropertiesByLandlord(landlordId) {
  const { token } = useAuth();

  return useSWR(token && landlordId ? ['properties-landlord', token, landlordId] : null, fetchPropertiesByLandlord);
}

export function usePropertyActions() {
  const { token, userId } = useAuth();

  const createProperty = (payload, actorId = userId) =>
    requestProperties(PROPERTIES_ENDPOINT, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateProperty = (id, payload) =>
    requestProperties(`${PROPERTIES_ENDPOINT}/${id}`, {
      token,
      method: 'PUT',
      body: JSON.stringify(payload)
    });

  const deleteProperty = (id) =>
    requestProperties(`${PROPERTIES_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  const attachLandlord = (propertyId, landlordId) =>
    requestProperties(`${PROPERTIES_ENDPOINT}/${propertyId}/attach-landlord/${landlordId}`, {
      token,
      method: 'PATCH'
    });

  return {
    createProperty,
    updateProperty,
    deleteProperty,
    attachLandlord
  };
}

export { requestProperties };
