import apiClient from './apiClient';

const labApi = {
  // Doctor endpoints
  recommendTest: (doctorId, data) =>
    apiClient.post(`/lab-tests/doctors/${doctorId}/recommend`, data),

  getDoctorRecommendedTests: (doctorId, status = null) => {
    let url = `/lab-tests/doctors/${doctorId}/recommended`;
    if (status) {
      url += `?status=${status}`;
    }
    return apiClient.get(url);
  },

  // Patient endpoints
  getPatientTests: (patientId, status = null) => {
    let url = `/lab-tests/patients/${patientId}`;
    if (status) {
      url += `?status=${status}`;
    }
    return apiClient.get(url);
  },

  getPatientTestResults: (patientId) =>
    apiClient.get(`/lab-tests/patients/${patientId}/results`),

  // Generic test endpoints
  getTestDetail: (testId) => apiClient.get(`/lab-tests/${testId}`),

  updateTestStatus: (testId, status) =>
    apiClient.put(`/lab-tests/${testId}/status`, { status }),

  deleteTestRecommendation: (testId) =>
    apiClient.delete(`/lab-tests/${testId}`),

  // Pathologist endpoints
  getRecommendedTests: (status = null) => {
    let url = `/pathologists/tests/recommended`;
    if (status) {
      url += `?status=${status}`;
    }
    return apiClient.get(url);
  },

  getMyTests: () => apiClient.get('/pathologists/tests/my'),

  getTestDetails: (testId) => apiClient.get(`/pathologists/tests/${testId}`),

  acceptTest: (testId) => apiClient.put(`/pathologists/tests/${testId}/accept`),

  addTestReport: (testId, formData) =>
    apiClient.post(`/pathologists/tests/${testId}/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  getPathologistProfile: () => apiClient.get('/pathologists/profile'),

  updatePathologistProfile: (data) =>
    apiClient.put('/pathologists/profile', data),
};

export default labApi;
