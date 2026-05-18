import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, USERS_ENDPOINT } from 'config';
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

async function requestUsers(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete user request.');
  }

  return data;
}

async function fetchUsers([, token, params]) {
  const query = buildQuery(params);

  return requestUsers(`${USERS_ENDPOINT}${query ? `?${query}` : ''}`, { token });
}

async function fetchUserById([, token, id]) {
  return requestUsers(`${USERS_ENDPOINT}/${id}`, { token });
}

export function useUsers(params = {}) {
  const { token } = useAuth();

  return useSWR(token ? ['users', token, params] : null, fetchUsers);
}

export function useUser(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['user', token, id] : null, fetchUserById);
}

export function useUserActions() {
  const { token, userId } = useAuth();

  const registerUser = (payload, actorId = userId) =>
    requestUsers(`${USERS_ENDPOINT}/register`, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateUser = (id, payload) =>
    requestUsers(`${USERS_ENDPOINT}/${id}`, {
      token,
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

  const deleteUser = (id) =>
    requestUsers(`${USERS_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  return { registerUser, updateUser, deleteUser };
}

export { requestUsers };
