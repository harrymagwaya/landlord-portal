import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, ADDRESSES_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestAddresses(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete address request.');
  }

  return data;
}

async function fetchAddresses([, token]) {
  return requestAddresses(ADDRESSES_ENDPOINT, {
    token
  });
}

async function fetchAddressById([, token, id]) {
  return requestAddresses(`${ADDRESSES_ENDPOINT}/${id}`, {
    token
  });
}

export function useAddresses() {
  const { token } = useAuth();

  return useSWR(token ? ['addresses', token] : null, fetchAddresses);
}

export function useAddress(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['address', token, id] : null, fetchAddressById);
}

export function useAddressActions() {
  const { token, userId } = useAuth();

  const createAddress = (payload, actorId = userId) =>
    requestAddresses(ADDRESSES_ENDPOINT, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateAddress = (id, payload) =>
    requestAddresses(`${ADDRESSES_ENDPOINT}/${id}`, {
      token,
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

  const deleteAddress = (id) =>
    requestAddresses(`${ADDRESSES_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  return {
    createAddress,
    updateAddress,
    deleteAddress
  };
}

export { requestAddresses };
