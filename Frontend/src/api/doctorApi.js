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

  // Get current doctor's appointments (using JWT)
  getMyAppointments: () => {
    return apiClient.get(`/doctors/me/appointments`);
  },

  // Get doctor appointments by ID
  getDoctorAppointments: (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}/appointments`);
  },

  // Get current doctor's patients (using JWT)
  getMyPatients: () => {
    return apiClient.get(`/doctors/me/patients`);
  },

  // Get doctor patients by ID
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

  // Confirm or reject an appointment (using JWT)
  confirmAppointment: (appointmentId, status, time) => {
    const payload = { status };
    if (time) {
      payload.time = time;
    }
    return apiClient.post(
      `/doctors/me/appointments/${appointmentId}/confirm`,
      payload,
    );
  },

  // Get doctors by specialization (public route)
  getDoctorsBySpecialization: (specialization) => {
    return apiClient.get(
      `/doctors/specialization/${encodeURIComponent(specialization)}`,
    );
  },
  // Get all doctors (public)
  getAllDoctors: () => {
    return apiClient.get(`/doctors`);
  },
};

export default doctorApi;
