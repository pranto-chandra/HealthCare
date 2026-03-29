import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export async function register(payload) {
  return API.post("/auth/register", payload);
}

export async function verifyOtp(payload) {
  return API.post("/auth/verify-otp", payload);
}

export async function login(payload) {
  return API.post("/auth/login", payload);
}

export async function logout() {
  return API.post("/auth/logout");
}

export async function forgotPassword(email) {
  return API.post("/auth/forgot-password", { email });
}

export async function confirmPasswordReset(token, newPassword) {
  return API.post("/auth/confirm-password-reset", { token, newPassword });
}

export async function resetPassword(email) {
  return API.post("/auth/password-reset", { email });
}

export default {
  register,
  login,
  logout,
  forgotPassword,
  confirmPasswordReset,
  resetPassword,
};
