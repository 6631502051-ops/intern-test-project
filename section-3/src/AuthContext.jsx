import { createContext, useContext, useMemo, useState } from 'react';
import { mockApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const login = async (username, password) => {
    const nextSession = await mockApi.login(username, password);
    setSession(nextSession);
    return nextSession;
  };
  const logout = () => setSession(null);
  const value = useMemo(() => ({ ...session, login, logout }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
