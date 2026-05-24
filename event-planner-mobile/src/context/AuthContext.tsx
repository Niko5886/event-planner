import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { AuthUser, loginRequest, registerRequest } from '@/lib/api';
import { deleteToken, getToken, setToken } from '@/lib/secureStorage';

type AuthState = {
  isReady: boolean;
  token: string | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        setTokenState(stored);
      }
      setIsReady(true);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    await setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const result = await registerRequest(name, email, password);
    await setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
  };

  const signOut = async () => {
    await deleteToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isReady, token, user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
