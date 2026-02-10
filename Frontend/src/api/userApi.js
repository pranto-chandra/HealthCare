import apiClient from './apiClient';

export const userApi = {
  // Get user profile
  getProfile: (userId) => {
    return apiClient.get(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: (userId, profileData) => {
    return apiClient.put(`/users/${userId}`, profileData);
  },

  // Get current user (from token)
  getCurrentUser: () => {
    return apiClient.get('/users/me');
  },

  // Change password
  changePassword: (userId, passwordData) => {
    return apiClient.put(`/users/${userId}/password`, passwordData);
  },

  // Upload profile picture
  uploadProfilePicture: (userId, formData) => {
    return apiClient.post(`/users/${userId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default userApi;
