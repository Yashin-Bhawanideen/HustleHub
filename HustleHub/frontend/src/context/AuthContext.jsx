import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// api holds the functions that call the backend, and tokenStore wraps reading,
// saving and clearing the JWT in the browser.
import { api, tokenStore } from '../api.js';

// Create the authentication context. It starts as null so useAuth() can
// detect when it is used outside the provider 
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is stored, ask the API who it belongs to.
  // An expired or tampered token is rejected by the server and cleared here.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.me();
        if (!cancelled) setUser(data.user);
      } catch (err) {
        tokenStore.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    const data = await api.login({ email, password, role });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);
// Registers a new account. The user is not logged in automatically; they
  // log in afterwards, matching the message from the backend.
  const register = useCallback((payload) => api.register(payload), []);
// Logs the user out by removing the token and clearing the user state.
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook that lets any component read the auth data, e.g.
 * const { user, login } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
// Reference List
// React Built-in React Hooks. Available at: https://react.dev/reference/react/hooks (Accessed: 12 October 2026).
// React useContext. Available at: https://react.dev/reference/react/useContext (Accessed: 12 October 2026).
// React useEffect. Available at: https://react.dev/reference/react/useEffect (Accessed: 12 October 2026).
