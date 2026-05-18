import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, LOAN_ADMINS_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestLoanAdmins(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete loan admin request.');
  }

  return data;
}

async function fetchLoanAdmins([, token]) {
  return requestLoanAdmins(LOAN_ADMINS_ENDPOINT, {
    token
  });
}

async function fetchLoanAdminById([, token, id]) {
  return requestLoanAdmins(`${LOAN_ADMINS_ENDPOINT}/${id}`, {
    token
  });
}

async function fetchLoanAdminProfile([, token, userId]) {
  return requestLoanAdmins(`${LOAN_ADMINS_ENDPOINT}/profile/${userId}`, {
    token
  });
}

export function useLoanAdmins() {
  const { token } = useAuth();

  return useSWR(token ? ['loan-admins', token] : null, fetchLoanAdmins);
}

export function useLoanAdmin(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['loan-admin', token, id] : null, fetchLoanAdminById);
}

export function useLoanAdminProfile(userId) {
  const { token } = useAuth();

  return useSWR(token && userId ? ['loan-admin-profile', token, userId] : null, fetchLoanAdminProfile);
}

export function useLoanAdminActions() {
  const { token, userId } = useAuth();

  const updateLoanAdmin = (adminUserId, payload, actorId = userId) =>
    requestLoanAdmins(`${LOAN_ADMINS_ENDPOINT}/${adminUserId}`, {
      token,
      actorId,
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

  const deleteLoanAdmin = (adminUserId) =>
    requestLoanAdmins(`${LOAN_ADMINS_ENDPOINT}/${adminUserId}`, {
      token,
      method: 'DELETE'
    });

  return {
    updateLoanAdmin,
    deleteLoanAdmin
  };
}

export { requestLoanAdmins };
