import React, { createContext, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../api/authApi";

export const AuthContext = createContext();

function readStoredUser() {
  try {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.warn("Ignoring invalid stored user payload", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

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

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      // ignore network errors — still clear client state
    }

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const updateUser = (newUser) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
