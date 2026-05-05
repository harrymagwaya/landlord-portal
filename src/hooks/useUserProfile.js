import useSWR from 'swr';

import { API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, USERS_ENDPOINT } from 'config';
import useAuth from './useAuth';

async function fetchUserProfile([, userId, token]) {
  const response = await fetch(`${API_BASE_URL}${USERS_ENDPOINT}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      [APP_HEADER_KEY]: APP_HEADER_VALUE
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to load user profile.');
  }

  return data;
}

export default function useUserProfile() {
  const { token, userId } = useAuth();

  return useSWR(userId && token ? ['user-profile', userId, token] : null, fetchUserProfile);
}
