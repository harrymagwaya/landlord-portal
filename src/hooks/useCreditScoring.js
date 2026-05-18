import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, CREDIT_SCORING_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestCreditScoring(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete credit scoring request.');
  }

  return data;
}

export function useCreditScoringActions() {
  const { token, userId } = useAuth();

  const evaluateRisk = (payload, actorId = userId) =>
    requestCreditScoring(`${CREDIT_SCORING_ENDPOINT}/evaluate`, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  return {
    evaluateRisk
  };
}

export { requestCreditScoring };
