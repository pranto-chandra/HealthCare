import apiClient from "./apiClient";

const appointmentApi = {
  // Get all appointments for a patient
  getAppointments: (patientId) => {
    return apiClient.get(`/patients/${patientId}/appointments`);
  },

  // Create an appointment
  createAppointment: (patientId, appointmentData) => {
    return apiClient.post(
      `/patients/${patientId}/appointments`,
      appointmentData,
    );
  },

  // Get all doctors with their details
  getAllDoctors: () => {
    return apiClient.get(`/doctors`);
  },

  // Get doctor details by ID
  getDoctorById: (doctorId) => {
    return apiClient.get(`/doctors/${doctorId}`);
  },

  // Search doctors by name
  searchDoctors: (searchTerm) => {
    return apiClient.get(`/doctors/search?q=${encodeURIComponent(searchTerm)}`);
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: (specialization) => {
    return apiClient.get(
      `/doctors/specialization/${encodeURIComponent(specialization)}`,
    );
  },

  // Get doctors by qualification
  getDoctorsByQualification: (qualification) => {
    return apiClient.get(
      `/doctors/qualification/${encodeURIComponent(qualification)}`,
    );
  },

  // Filter doctors by multiple criteria
  filterDoctors: (filters) => {
    const params = new URLSearchParams();
    if (filters.specialization)
      params.append("specialization", filters.specialization);
    if (filters.qualification)
      params.append("qualification", filters.qualification);
    if (filters.name) params.append("name", filters.name);
    return apiClient.get(`/doctors/filter?${params.toString()}`);
  },
};

export default appointmentApi;
