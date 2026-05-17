import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  withCredentials: true,
});

API.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        await API.post("/api/auth/refresh");
        return API(err.config);
      } catch {
        // refresh failed
      }
    }
    return Promise.reject(err);
  }
);

export { API };

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    API.get("/api/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setBootstrapping(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await API.post("/api/auth/login", { email, password });
    setUser(r.data);
    return r.data;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const r = await API.post("/api/auth/register", { email, password, name });
    setUser(r.data);
    return r.data;
  }, []);

  const logout = useCallback(async () => {
    await API.post("/api/auth/logout").catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, bootstrapping, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
