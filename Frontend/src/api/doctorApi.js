import apiClient from "./apiClient";

export const doctorApi = {
  // Get doctor profile
  getDoctorProfile: (userId) => {
    return apiClient.get(`/doctors/${userId}/profile`);
  },

  // Update doctor profile
  updateDoctorProfile: (userId, profileData) => {
    return apiClient.put(`/doctors/${userId}/profile`, profileData);
  },

  // Get doctor appointments
  getDoctorAppointments: (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/appointments`);
  },

  // Get doctor patients
  getDoctorPatients: (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/patients`);
  },

  // Get doctor prescriptions
  getDoctorPrescriptions: (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/prescriptions`);
  },

  // Create prescription
  createPrescription: (doctorId, prescriptionData) => {
    return apiClient.post(
      `/doctors/${doctorId}/prescriptions`,
      prescriptionData,
    );
  },

  // Get patient record
  getPatientRecord: (doctorId, patientId) => {
    return apiClient.get(`/doctors/${doctorId}/records/${patientId}`);
  },

  // Get doctors by specialization (public route)
  getDoctorsBySpecialization: (specialization) => {
    return apiClient.get(
      `/doctors/specialization/${encodeURIComponent(specialization)}`,
    );
  },
};

export default doctorApi;
