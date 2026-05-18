import useSWR from 'swr';

import { USERS_ENDPOINT } from 'config';
import useAuth from './useAuth';
import { requestUsers } from './useUsers';

async function fetchUserProfile([, userId, token]) {
  return requestUsers(`${USERS_ENDPOINT}/${userId}`, { token });
}

export default function useUserProfile() {
  const { token, userId } = useAuth();

  return useSWR(userId && token ? ['user-profile', userId, token] : null, fetchUserProfile);
}
