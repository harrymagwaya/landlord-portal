import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL, APP_HEADER_KEY, APP_HEADER_VALUE, LOGIN_ENDPOINT } from 'config';
import { ALLOWED_ROLES } from 'utils/roles';

export const AUTH_STORAGE_KEY = 'lando-auth-session';
export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_ID_KEY = 'userId';
export const AUTH_ROLE_KEY = 'role';
export const AUTH_EXPIRES_IN_KEY = 'expiresIn';

const initialState = {
  token: null,
  userId: null,
  role: null,
  expiresIn: null
};

const AuthContext = createContext({
  ...initialState,
  allowedRoles: ALLOWED_ROLES,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {}
});

function getStoredSession() {
  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedSession) {
      return initialState;
    }

    const session = JSON.parse(storedSession);

    if (!session?.token || !session?.userId || !session?.role || !session?.expiresIn || Number(session.expiresIn) <= Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return initialState;
    }

    return session;
  } catch (error) {
    console.warn('Unable to read auth session:', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return initialState;
  }
}

function persistSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function normalizeLoginResponse(response) {
  return {
    token: response?.[AUTH_TOKEN_KEY],
    userId: response?.[AUTH_USER_ID_KEY],
    role: response?.[AUTH_ROLE_KEY],
    expiresIn: Number(response?.[AUTH_EXPIRES_IN_KEY])
  };
}

function getLoginUrl() {
  return `${API_BASE_URL}${LOGIN_ENDPOINT}`;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);

  const logout = useCallback(() => {
    clearSession();
    setSession(initialState);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await fetch(getLoginUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [APP_HEADER_KEY]: APP_HEADER_VALUE
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || 'Login failed. Please check your credentials and try again.');
    }

    const nextSession = normalizeLoginResponse(data);

    if (!nextSession.token || !nextSession.userId || !nextSession.role || !nextSession.expiresIn) {
      throw new Error('Login response is missing required session fields.');
    }

    if (!ALLOWED_ROLES.includes(nextSession.role)) {
      throw new Error('Your role is not allowed to access this portal.');
    }

    if (nextSession.expiresIn <= Date.now()) {
      throw new Error('Your login session has already expired. Please sign in again.');
    }

    persistSession(nextSession);
    setSession(nextSession);

    return nextSession;
  }, []);

  useEffect(() => {
    if (!session.expiresIn) {
      return undefined;
    }

    const expiresInMs = Number(session.expiresIn) - Date.now();

    if (expiresInMs <= 0) {
      logout();
      return undefined;
    }

    const logoutTimer = window.setTimeout(logout, expiresInMs);

    return () => window.clearTimeout(logoutTimer);
  }, [logout, session.expiresIn]);

  const value = useMemo(
    () => ({
      ...session,
      allowedRoles: ALLOWED_ROLES,
      isAuthenticated: Boolean(session.token && session.userId && session.role && session.expiresIn),
      login,
      logout
    }),
    [login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };

export default AuthContext;
