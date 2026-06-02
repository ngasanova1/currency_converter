import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import api from "./api";
import auth from "./auth";

type AuthContextType = {
  token: string | null;
  user: any | null;
  loading: boolean;
  login?: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name?: string) => Promise<void>;
  logout?: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { token: t, user: u } = await auth.init();
      if (t) {
        setTokenState(t);
        if (u) setUser(u);
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await api.login(email, password);
      auth.setToken(res.token);
      auth.setUser(res.user);
      setTokenState(res.token);
      setUser(res.user);
    } catch (err: any) {
      Alert.alert("Ошибка входа", err.message || String(err));
      throw err;
    }
  }

  async function register(email: string, password: string, name?: string) {
    try {
      const res = await api.register(email, password, name);
      auth.setToken(res.token);
      auth.setUser(res.user);
      setTokenState(res.token);
      setUser(res.user);
    } catch (err: any) {
      Alert.alert("Ошибка регистрации", err.message || String(err));
      throw err;
    }
  }

  function logout() {
    auth.setToken(null);
    auth.setUser(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
