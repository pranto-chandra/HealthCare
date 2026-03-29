import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { getAllDoctors } from "../../api/adminApi";
import "./Clinics.css";

export default function Clinics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    location: "",
    phone: "",
    email: "",
    address: "",
    speciality: "",
    status: "Active",
  });

  // Load clinics on mount
  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setLoading(true);
    try {
      // Fetch real doctor data from backend
      const response = await getAllDoctors();
      const doctorData = response.data?.data || [];

      // Display doctors as healthcare providers
      setDoctors(doctorData);
      setError("");
    } catch (err) {
      setError("Failed to load doctor data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setFormData({
        id: doctor.id,
        name: doctor.name,
        location: doctor.locationDiv || "",
        phone: doctor.phone || "",
        email: doctor.email || "",
        address: "",
        speciality: doctor.specialties?.[0]?.speciality?.name || "",
        status: "Active",
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        name: "",
        location: "",
        phone: "",
        email: "",
        address: "",
        speciality: "",
        status: "Active",
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id: null,
      name: "",
      location: "",
      phone: "",
      email: "",
      address: "",
      speciality: "",
      status: "Active",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "doctors" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Just close the modal for read-only doctor view
    handleCloseModal();
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to remove this doctor?")) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // await adminApi.deleteDoctor(doctorId);

      setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
      setSuccess("Doctor removed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to remove doctor");
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.locationDiv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="admin-clinics-page">
      {/* Sidebar Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`admin-clinics-layout ${isSidebarOpen ? "" : "collapsed"}`}
      >
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-clinics-content">
          <h1 className="page-title">Healthcare Providers & Doctors</h1>

          {/* Error and Success Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Top Bar with Button and Search */}
          <div className="clinics-top-bar">
            <button
              className="add-clinic-btn"
              onClick={() => handleOpenModal()}
              disabled={loading || true}
              title="Add doctor from backend"
            >
              + Add New Doctor
            </button>

            <div className="search-filter-container">
              <input
                type="text"
                placeholder="Search by name, location, or email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Doctors Table */}
          <section className="clinics-table-section">
            {loading && !showModal ? (
              <div className="loading">Loading doctors...</div>
            ) : filteredDoctors.length > 0 ? (
              <table className="clinics-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Location</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Specialty</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="clinic-name">{doctor.name}</td>
                      <td>{doctor.locationDiv || "N/A"}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phone || "N/A"}</td>
                      <td>
                        {doctor.specialties && doctor.specialties.length > 0
                          ? doctor.specialties
                              .map((s) => s.speciality?.name)
                              .join(", ")
                          : "N/A"}
                      </td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleOpenModal(doctor)}
                          disabled={loading}
                        >
                          View
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(doctor.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                No doctors found. {searchTerm && "Try clearing your search."}
              </div>
            )}
          </section>

          {/* Total count */}
          <div className="clinics-footer">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? "Edit Clinic" : "Add New Clinic"}</h2>
              <button
                className="modal-close"
                onClick={handleCloseModal}
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="clinic-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Doctor Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter doctor name"
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Dhaka, Chittagong"
                    disabled={true}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    disabled={true}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="speciality">Specialty</label>
                  <input
                    type="text"
                    id="speciality"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    placeholder="Specialty"
                    disabled={true}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
