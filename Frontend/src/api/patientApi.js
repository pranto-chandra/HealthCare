import apiClient from "./apiClient";

const patientApi = {
  // Create patient profile
  createPatient: (patientData) => {
    return apiClient.post(`/patients`, patientData);
  },

  // Get patient profile
  getPatient: (patientId) => {
    return apiClient.get(`/patients/${patientId}`);
  },

  // Get patient by user ID
  getPatientByUserId: (userId) => {
    return apiClient.get(`/patients/user/${userId}`);
  },

  // Update patient profile
  updatePatient: (patientId, patientData) => {
    return apiClient.put(`/patients/${patientId}`, patientData);
  },

  // Get patient history
  getPatientHistory: (patientId) => {
    return apiClient.get(`/patients/${patientId}/history`);
  },

  // Get patient appointments
  getAppointments: (patientId) => {
    return apiClient.get(`/patients/${patientId}/appointments`);
  },

  // Create appointment
  createAppointment: (patientId, appointmentData) => {
    return apiClient.post(
      `/patients/${patientId}/appointments`,
      appointmentData,
    );
  },
};

export default patientApi;
