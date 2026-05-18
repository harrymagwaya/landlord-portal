import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, RISK_WEIGHTS_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestRiskWeights(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete risk weight request.');
  }

  return data;
}

async function fetchRiskWeights([, token]) {
  return requestRiskWeights(RISK_WEIGHTS_ENDPOINT, {
    token
  });
}

async function fetchRiskWeightById([, token, id]) {
  return requestRiskWeights(`${RISK_WEIGHTS_ENDPOINT}/${id}`, {
    token
  });
}

export function useRiskWeights() {
  const { token } = useAuth();

  return useSWR(token ? ['risk-weights', token] : null, fetchRiskWeights);
}

export function useRiskWeight(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['risk-weight', token, id] : null, fetchRiskWeightById);
}

export function useRiskWeightActions() {
  const { token, userId } = useAuth();

  const createRiskWeight = (payload, actorId = userId) =>
    requestRiskWeights(RISK_WEIGHTS_ENDPOINT, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const updateRiskWeight = (weightId, payload, actorId = userId) =>
    requestRiskWeights(`${RISK_WEIGHTS_ENDPOINT}/${weightId}`, {
      token,
      actorId,
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

  const bulkUpdateRiskWeights = (updates, actorId = userId) =>
    requestRiskWeights(`${RISK_WEIGHTS_ENDPOINT}/bulk`, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(updates)
    });

  const toggleRiskWeightStatus = (id, active, actorId = userId) =>
    requestRiskWeights(`${RISK_WEIGHTS_ENDPOINT}/${id}/status?active=${active}`, {
      token,
      actorId,
      method: 'PATCH'
    });

  const deleteRiskWeight = (id, actorId = userId) =>
    requestRiskWeights(`${RISK_WEIGHTS_ENDPOINT}/${id}`, {
      token,
      actorId,
      method: 'DELETE'
    });

  const refreshRiskWeightCache = () =>
    requestRiskWeights(`${RISK_WEIGHTS_ENDPOINT}/refresh-cache`, {
      token,
      method: 'POST'
    });

  return {
    createRiskWeight,
    updateRiskWeight,
    bulkUpdateRiskWeights,
    toggleRiskWeightStatus,
    deleteRiskWeight,
    refreshRiskWeightCache
  };
}

export { requestRiskWeights };
