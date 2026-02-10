import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import userApi from "../../api/userApi";
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
        const res = await userApi.getProfile(user.id);
        const profile = res?.data?.data;
        if (mounted && profile) {
          setFormData({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
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
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const res = await userApi.updateProfile(user.id, formData);
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

          <div className="form-actions">
            {!isEditing ? (
              <span style={{ color: "#999", fontSize: "14px" }}>Click "Edit Profile" button above to start editing</span>
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
