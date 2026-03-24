import API from './apiClient';

export async function createUser(userData) {
  return API.post('/admin/users', userData);
}

export async function getAllUsers() {
  return API.get('/admin/users');
}

export async function updateUserRole(userId, role) {
  return API.put(`/admin/users/${userId}/role`, { role });
}

export async function deleteUser(userId) {
  return API.delete(`/admin/users/${userId}`);
}

export async function getAnalytics() {
  return API.get('/admin/analytics');
}
