import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, SCORING_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestScoring(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete scoring request.');
  }

  return data;
}

async function fetchPreviewScore([, token, tenantId]) {
  return requestScoring(`${SCORING_ENDPOINT}/preview/${tenantId}`, { token });
}

async function fetchLatestScore([, token, tenantId]) {
  return requestScoring(`${SCORING_ENDPOINT}/latest/${tenantId}`, { token });
}

async function fetchRankedList([, token, params]) {
  const query = new URLSearchParams(params || {}).toString();

  return requestScoring(`${SCORING_ENDPOINT}/ranked-list${query ? `?${query}` : ''}`, { token });
}

async function fetchAllScores([, token]) {
  return requestScoring(SCORING_ENDPOINT, { token });
}

export function usePreviewScore(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['preview-score', token, tenantId] : null, fetchPreviewScore);
}

export function useLatestScore(tenantId) {
  const { token } = useAuth();

  return useSWR(token && tenantId ? ['latest-score', token, tenantId] : null, fetchLatestScore);
}

export function useRankedScores(page = 0, size = 10) {
  const { token } = useAuth();

  return useSWR(token ? ['ranked-scores', token, page, size] : null, fetchRankedList);
}

export function useAllScores() {
  const { token } = useAuth();

  return useSWR(token ? ['all-scores', token] : null, fetchAllScores);
}

export function useScoringActions() {
  const { token, userId } = useAuth();

  const generateScore = (tenantId, actorId = userId) =>
    requestScoring(`${SCORING_ENDPOINT}/generate/${tenantId}`, {
      token,
      actorId,
      method: 'POST'
    });

  return {
    generateScore
  };
}

export { requestScoring };
