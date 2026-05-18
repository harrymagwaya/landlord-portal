import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, LANDLORDS_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestLandlords(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete landlord request.');
  }

  return data;
}

async function fetchLandlords([, token]) {
  return requestLandlords(LANDLORDS_ENDPOINT, {
    token
  });
}

async function fetchLandlordByUserId([, token, userId]) {
  return requestLandlords(`${LANDLORDS_ENDPOINT}/${userId}`, {
    token
  });
}

export function useLandlords() {
  const { token } = useAuth();

  return useSWR(token ? ['landlords', token] : null, fetchLandlords);
}

export function useLandlord(userId) {
  const { token } = useAuth();

  return useSWR(token && userId ? ['landlord', token, userId] : null, fetchLandlordByUserId);
}

export function useLandlordActions() {
  const { token, userId } = useAuth();

  const updateLandlord = (landlordUserId, payload, actorId = userId) =>
    requestLandlords(`${LANDLORDS_ENDPOINT}/${landlordUserId}`, {
      token,
      actorId,
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

  const deleteLandlord = (landlordUserId) =>
    requestLandlords(`${LANDLORDS_ENDPOINT}/${landlordUserId}`, {
      token,
      method: 'DELETE'
    });

  return {
    updateLandlord,
    deleteLandlord
  };
}

export { requestLandlords };
