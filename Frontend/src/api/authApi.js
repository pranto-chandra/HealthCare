import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function register(payload) {
  return API.post('/auth/register', payload);
}

export async function login(payload) {
  return API.post('/auth/login', payload);
}

export async function logout() {
  return API.post('/auth/logout');
}

export default { register, login, logout };
