import React, { createContext, useState } from "react";
import { login as apiLogin } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const res = await apiLogin({ email, password });
      const data = res?.data;
      if (data?.success && data.data) {
        const userObj = data.data.user;
        const tokens = data.data.tokens;
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        if (tokens) {
          localStorage.setItem("accessToken", tokens.accessToken);
          localStorage.setItem("refreshToken", tokens.refreshToken);
        }
        return true;
      }
      return false;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
