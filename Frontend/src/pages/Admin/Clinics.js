import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "./Clinics.css";

export default function Clinics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
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
    doctors: 0,
    status: "Active",
  });

  // Initial dummy data
  const dummyClinics = [
    {
      id: 1,
      name: "Central Medical Clinic",
      location: "Dhaka",
      phone: "+880-2-XXXX-XXXX",
      email: "central@clinic.com",
      address: "123 Main Street, Dhaka",
      doctors: 25,
      status: "Active",
    },
    {
      id: 2,
      name: "Green Valley Hospital",
      location: "Chittagong",
      phone: "+880-31-XXXX-XXXX",
      email: "greenvalley@hospital.com",
      address: "456 Valley Road, Chittagong",
      doctors: 18,
      status: "Active",
    },
    {
      id: 3,
      name: "Sunrise Health Center",
      location: "Sylhet",
      phone: "+880-821-XXXX-XXXX",
      email: "sunrise@health.com",
      address: "789 Health Lane, Sylhet",
      doctors: 10,
      status: "Inactive",
    },
  ];

  // Load clinics on mount
  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await adminApi.getClinics();
      // setClinics(response.data?.data || []);
      
      // Using dummy data for now
      setClinics(dummyClinics);
      setError("");
    } catch (err) {
      setError("Failed to load clinics. Using demo data.");
      setClinics(dummyClinics);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (clinic = null) => {
    if (clinic) {
      setFormData(clinic);
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        name: "",
        location: "",
        phone: "",
        email: "",
        address: "",
        doctors: 0,
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
      doctors: 0,
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
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Clinic name is required");
      return;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        // TODO: Replace with actual API call
        // await adminApi.updateClinic(formData.id, formData);
        
        setClinics(
          clinics.map((clinic) =>
            clinic.id === formData.id ? formData : clinic
          )
        );
        setSuccess("Clinic updated successfully!");
      } else {
        // TODO: Replace with actual API call
        // const response = await adminApi.createClinic(formData);
        
        const newClinic = {
          ...formData,
          id: Math.max(...clinics.map((c) => c.id), 0) + 1,
        };
        setClinics([...clinics, newClinic]);
        setSuccess("Clinic added successfully!");
      }

      handleCloseModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save clinic");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clinicId) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // await adminApi.deleteClinic(clinicId);
      
      setClinics(clinics.filter((clinic) => clinic.id !== clinicId));
      setSuccess("Clinic deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete clinic");
    } finally {
      setLoading(false);
    }
  };

  // Filter clinics
  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || clinic.status === statusFilter;

    return matchesSearch && matchesStatus;
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

      <div className={`admin-clinics-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-clinics-content">
          <h1 className="page-title">Clinics & Hospitals Management</h1>

          {/* Error and Success Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Top Bar with Button and Search */}
          <div className="clinics-top-bar">
            <button
              className="add-clinic-btn"
              onClick={() => handleOpenModal()}
              disabled={loading}
            >
              + Add New Clinic
            </button>

            <div className="search-filter-container">
              <input
                type="text"
                placeholder="Search by name, location, or email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Clinics Table */}
          <section className="clinics-table-section">
            {loading && !showModal ? (
              <div className="loading">Loading clinics...</div>
            ) : filteredClinics.length > 0 ? (
              <table className="clinics-table">
                <thead>
                  <tr>
                    <th>Clinic Name</th>
                    <th>Location</th>
                    <th>Email</th>
                    <th>Doctors</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClinics.map((clinic) => (
                    <tr key={clinic.id}>
                      <td className="clinic-name">{clinic.name}</td>
                      <td>{clinic.location}</td>
                      <td>{clinic.email}</td>
                      <td>{clinic.doctors}</td>
                      <td>
                        <span
                          className={`status ${clinic.status.toLowerCase()}`}
                        >
                          {clinic.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleOpenModal(clinic)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(clinic.id)}
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
                No clinics found. {searchTerm && "Try clearing your search."}
              </div>
            )}
          </section>

          {/* Total count */}
          <div className="clinics-footer">
            Showing {filteredClinics.length} of {clinics.length} clinics
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
                  <label htmlFor="name">Clinic Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter clinic name"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Dhaka, Chittagong"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="clinic@example.com"
                    required
                    disabled={loading}
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
                    placeholder="+880-2-XXXX-XXXX"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="doctors">Number of Doctors</label>
                  <input
                    type="number"
                    id="doctors"
                    name="doctors"
                    value={formData.doctors}
                    onChange={handleChange}
                    min="0"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : isEditing ? "Update Clinic" : "Add Clinic"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
