import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/auth/me');
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async ({ correo, password }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { correo: correo.trim().toLowerCase(), password },
    });
    if (data?.user) {
      setUser(data.user);
      return { user: data.user, mode: 'laravel-mysql' };
    }
    throw new Error('No fue posible iniciar sesión.');
  }, []);

  const register = useCallback(async (formData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        ...formData,
        correo: formData.correo.trim().toLowerCase(),
      },
    });
    if (data?.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error('No fue posible completar el registro.');
  }, []);

  const loginDemo = useCallback(async (roleKey) => {
    const data = await apiRequest('/auth/demo', {
      method: 'POST',
      body: { role: roleKey },
    });
    if (data?.user) {
      setUser(data.user);
      return data.user;
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    loginDemo,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return ctx;
}
