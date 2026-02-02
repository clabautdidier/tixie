import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const getToken = useCallback(() => localStorage.getItem('jwt_token'), []);
  const getUser = useCallback(() => {
    const token = getToken();
    if (!token) return null;
    try {
      return JSON.parse(
        window.atob(
          token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        )
      );
    } catch (e) {
      return null;
    }
  }, [getToken]);

  const isTokenExpired = useCallback(() => {
    const user = getUser();
    if (!user || !user.exp) return true;
    return user.exp < Math.floor(Date.now() / 1000);
  }, [getUser]);

  const hasRole = useCallback(
    (role) => {
      const user = getUser();
      return user?.roles?.includes(role) ?? false;
    },
    [getUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem('jwt_token', token);
  }, []);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  const value = useMemo(
    () => ({
      getToken,
      getUser,
      isTokenExpired,
      hasRole,
      logout,
      login,
    }),
    [getToken, getUser, isTokenExpired, hasRole, logout, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
