import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import userApi from "../../api/userApi";
import doctorApi from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/helpers";
import "./EditProfile.css";
import Sidebar from "../../components/Sidebar";

export default function EditProfile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    specialization: "",
    licenseNumber: "",
    qualifications: "",
    experience: "",
    consultationFee: "",
    availableDays: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    console.log("Profile loading useEffect running");
    let mounted = true;
    const loadProfile = async () => {
      try {
        const res = await doctorApi.getDoctorProfile(user.id);
        const profile = res?.data?.data;
        if (mounted && profile) {
          setFormData({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            dateOfBirth: profile.dateOfBirth
              ? profile.dateOfBirth.split("T")[0]
              : "",
            specialization: profile.specialization || "",
            licenseNumber: profile.licenseNumber || "",
            qualifications: profile.qualifications || "",
            experience: profile.experience || "",
            consultationFee: profile.consultationFee || "",
            availableDays: profile.availableDays || "",
          });
        }
      } catch (err) {
        // fallback to context user if API fails
        if (mounted) {
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            dateOfBirth: user.dateOfBirth || "",
            specialization: "",
            licenseNumber: "",
            qualifications: "",
            experience: "",
            consultationFee: "",
            availableDays: "",
          });
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  // Clear messages when entering/exiting edit mode
  useEffect(() => {
    console.log("isEditing state changed to:", isEditing);
    setError("");
    setSuccess("");
  }, [isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    console.log("Edit button clicked. Current isEditing:", isEditing);
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit called! isEditing:", isEditing);

    // Only allow submission if in edit mode
    if (!isEditing) {
      console.log("Not in edit mode, blocking submission");
      return;
    }

    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("User ID not found");
      return;
    }

    setLoading(true);

    try {
      const res = await doctorApi.updateDoctorProfile(user.id, formData);
      const updated = res?.data?.data;
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      const updatedUser = {
        ...user,
        ...updated,
      };

      // Update AuthContext and localStorage
      updateUser(updatedUser);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("handleCancel called!");
    setIsEditing(false);
    setError("");
    // Reset form to current user data
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth || "",
      specialization: user.specialization || "",
      licenseNumber: user.licenseNumber || "",
      qualifications: user.qualifications || "",
      experience: user.experience || "",
      consultationFee: user.consultationFee || "",
      availableDays: user.availableDays || "",
    });
  };

  // const handleLogout = async () => {
  //   await logout();
  //   navigate("/");
  // };

  if (!user) {
    return null;
  }

  return (
    <div className="edit-profile-page">
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`editprofile-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Doctor" />}

        <div className="edit-profile-container">
          <div className="profile-header">
            <h1>Edit Profile</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {isEditing ? "✏️ EDITING MODE" : "🔒 VIEW MODE"}
              </span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!isEditing && (
            <div style={{ marginBottom: "20px" }}>
              <button
                type="button"
                className="edit-btn"
                onClick={handleEditClick}
              >
                Edit Profile
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Personal Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="user-role">
                <label>Account Type</label>
                <p className="role-badge">{user.role}</p>
              </div>
            </div>

            <div className="form-section">
              <h2>Professional Information</h2>

              <div className="form-row">
                <div className="form-group ">
                  <label>Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="border border-purple-700 rounded-lg p-3 w-full hover:bg-purple-100 hover:border-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="">Select Specialization</option>
                    <option value="Burn & Plastic Surgery">
                      Burn & Plastic Surgery
                    </option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Colorectal Surgery">
                      Colorectal Surgery
                    </option>
                    <option value="Dentistry">Dentistry</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="ENT">ENT</option>
                    <option value="General Surgery">General Surgery</option>
                    <option value="Gynaecology & Obstetrics">
                      Gynaecology & Obstetrics
                    </option>
                    <option value="Hepatobiliary Surgery">
                      Hepatobiliary Surgery
                    </option>
                    <option value="Hepatology">Hepatology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Laparoscopic Surgery">
                      Laparoscopic Surgery
                    </option>
                    <option value="Nephrology">Nephrology</option>
                    <option value="Neurosurgery">Neurosurgery</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Orthopaedics">Orthopaedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Physical Medicine">Physical Medicine</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Respiratory Medicine">
                      Respiratory Medicine
                    </option>
                    <option value="Rheumatology">Rheumatology</option>
                    <option value="Skin & Venereal Diseases">
                      Skin & Venereal Diseases
                    </option>
                    <option value="Skin-V.D-Allergy-Dermato-Laser-Dermato-Surgery and Cosmetic Dermatology">
                      Skin-V.D, Allergy, Dermato, Laser, Dermato, Surgery and
                      Cosmetic Dermatology
                    </option>
                    <option value="Surgical Oncology">Surgical Oncology</option>
                    <option value="Urology">Urology</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Medical License Number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Qualifications (JSON)</label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder='e.g., ["MBBS", "MD in Cardiology", "Advanced Certification"]'
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 10"
                    min="0"
                    max="70"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Consultation Fee (৳)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Available Days</label>
                  <input
                    type="text"
                    name="availableDays"
                    value={formData.availableDays}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder='e.g., ["Monday", "Tuesday", "Wednesday"]'
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              {!isEditing ? (
                <span style={{ color: "#999", fontSize: "14px" }}>
                  Click "Edit Profile" button above to start editing
                </span>
              ) : (
                <>
                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
