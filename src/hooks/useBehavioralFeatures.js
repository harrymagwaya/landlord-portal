import useSWR from 'swr';

import { ACTOR_ID_HEADER, API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, BEHAVIORAL_FEATURES_ENDPOINT } from 'config';

import useAuth from './useAuth';

function getHeaders(token, actorId) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(actorId && { [ACTOR_ID_HEADER]: actorId }),
    [APP_HEADER_KEY]: APP_HEADER_VALUE
  };
}

async function requestBehavioralFeatures(path, { token, actorId, ...options } = {}) {
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
    throw new Error(data?.message || 'Unable to complete behavioral feature request.');
  }

  return data;
}

async function fetchBehavioralFeatures([, token]) {
  return requestBehavioralFeatures(BEHAVIORAL_FEATURES_ENDPOINT, {
    token
  });
}

async function fetchBehavioralFeatureById([, token, id]) {
  return requestBehavioralFeatures(`${BEHAVIORAL_FEATURES_ENDPOINT}/${id}`, {
    token
  });
}

export function useBehavioralFeatures() {
  const { token } = useAuth();

  return useSWR(token ? ['behavioral-features', token] : null, fetchBehavioralFeatures);
}

export function useBehavioralFeature(id) {
  const { token } = useAuth();

  return useSWR(token && id ? ['behavioral-feature', token, id] : null, fetchBehavioralFeatureById);
}

export function useBehavioralFeatureActions() {
  const { token, userId } = useAuth();

  const createBehavioralFeature = (payload, actorId = userId) =>
    requestBehavioralFeatures(BEHAVIORAL_FEATURES_ENDPOINT, {
      token,
      actorId,
      method: 'POST',
      body: JSON.stringify(payload)
    });

  const attachBehavioralFeatureToTenant = (featureId, tenantId) =>
    requestBehavioralFeatures(`${BEHAVIORAL_FEATURES_ENDPOINT}/${featureId}/attach-to/${tenantId}`, {
      token,
      method: 'POST'
    });

  const deleteBehavioralFeature = (id) =>
    requestBehavioralFeatures(`${BEHAVIORAL_FEATURES_ENDPOINT}/${id}`, {
      token,
      method: 'DELETE'
    });

  return {
    createBehavioralFeature,
    attachBehavioralFeatureToTenant,
    deleteBehavioralFeature
  };
}

export { requestBehavioralFeatures };
