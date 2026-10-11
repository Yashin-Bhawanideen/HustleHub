import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api.js';

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

  const register = useCallback((payload) => api.register(payload), []);

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
