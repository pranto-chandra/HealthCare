import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import userApi from "../../api/userApi";
import doctorApi from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/helpers";
import "./EditProfile.css";
import Sidebar from "../../components/Sidebar";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';


export default function EditProfile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    locationDiv: "",
    licenseNumber: "",
    consultationFee: "",
    experienceYears: "",
    specialties: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Password change states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

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
            name: profile.name || "",
            phone: profile.phone || "",
            dateOfBirth: profile.dateOfBirth
              ? profile.dateOfBirth.split("T")[0]
              : "",
            locationDiv: profile.locationDiv || "",
            licenseNumber: profile.licenseNumber || "",
            consultationFee: profile.consultationFee || "",
            experienceYears: profile.experienceYears || "",
            specialties: profile.specialties?.map(s => s.id) || [],
          });
        }
      } catch (err) {
        // fallback to context user if API fails
        if (mounted) {
          setFormData({
            name: user.doctorProfile?.name || "",
            phone: user.doctorProfile?.phone || "",
            dateOfBirth: user.doctorProfile?.dateOfBirth || "",
            locationDiv: user.doctorProfile?.locationDiv || "",
            licenseNumber: user.doctorProfile?.licenseNumber || "",
            consultationFee: user.doctorProfile?.consultationFee || "",
            experienceYears: user.doctorProfile?.experienceYears || "",
            specialties: user.doctorProfile?.specialties?.map(s => s.id) || [],
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
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isEditing]);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 6) errors.push("Password must be at least 6 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("Must contain an uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("Must contain a number");
    return errors;
  };

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

    // Validate password if provided
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        setError("Please fill in both password fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join(". "));
        return;
      }
    }

    setLoading(true);

    try {
      const updateData = {
        ...formData,
      };

      // Include password if provided
      if (newPassword) {
        updateData.password = newPassword;
      }
      const res = await doctorApi.updateDoctorProfile(user.id, updateData);
      const updatedUser = res?.data?.data;

      if (newPassword) {
        await logout();
        navigate("/login");
        return;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Update AuthContext with the complete user object
      if (updatedUser) {
        updateUser(updatedUser);
      }

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
      name: user.doctorProfile?.name || "",
      phone: user.doctorProfile?.phone || "",
      dateOfBirth: user.doctorProfile?.dateOfBirth || "",
      locationDiv: user.doctorProfile?.locationDiv || "",
      licenseNumber: user.doctorProfile?.licenseNumber || "",
      consultationFee: user.doctorProfile?.consultationFee || "",
      experienceYears: user.doctorProfile?.experienceYears || "",
      specialties: user.doctorProfile?.specialties?.map(s => s.id) || [],
    });

     setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
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

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
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
                  <label>Location Division</label>
                  <select
                    name="locationDiv"
                    value={formData.locationDiv}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  >
                    <option value="">Select Division</option>
                    <option value="DHAKA">Dhaka</option>
                    <option value="CHITTAGONG">Chittagong</option>
                    <option value="RAJSHAHI">Rajshahi</option>
                    <option value="KHULNA">Khulna</option>
                    <option value="BARISHAL">Barishal</option>
                    <option value="SYLHET">Sylhet</option>
                    <option value="RANGPUR">Rangpur</option>
                    <option value="MYMENSINGH">Mymensingh</option>
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
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="e.g., 10"
                    min="0"
                    max="70"
                    required
                  />
                </div>
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
              </div>
            </div>

            {isEditing && (
              <div className="form-section">
                <h2>Change Password (Optional)</h2>
                <p className="section-info">Leave blank to keep current password</p>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="password-hints">
                      <p>Password must contain:</p>
                      <ul>
                        <li className={newPassword.length >= 6 ? "valid" : ""}>
                          At least 6 characters
                        </li>
                        <li className={/[A-Z]/.test(newPassword) ? "valid" : ""}>
                          One uppercase letter
                        </li>
                        <li className={/[0-9]/.test(newPassword) ? "valid" : ""}>
                          One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </button>
                  </div>
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="match-indicator valid">✓ Passwords match</p>
                  )}
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="match-indicator invalid">
                      ✗ Passwords do not match
                    </p>
                  )}
                </div>
              </div>
            )}

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
