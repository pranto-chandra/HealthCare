import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { createUser, getAllUsers, updateUserStatus, deleteUser } from "../../api/adminApi";
import "./ManageUsers.css";

export default function ManageUsers() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "DOCTOR",
    tempPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setError(null);
      const response = await getAllUsers();

      if (response && response.data && response.data.success) {
        // Transform the data to match table structure
        const transformedUsers = response.data.data.map(user => ({
          id: user.id,
          name: getUserName(user),
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase(),
        email: user.email,
        status: user.isProfileComplete ? "Active" : "Pending",
        isProfileComplete: user.isProfileComplete,
        createdAt: new Date(user.createdAt).toLocaleDateString()
        }));
        setUsers(transformedUsers);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Get user name from profile or show email as fallback
  const getUserName = (user) => {
    if (user.patientProfile?.name) return user.patientProfile.name;
    if (user.doctorProfile?.name) return `Dr. ${user.doctorProfile.name}`;
    if (user.adminProfile?.name) return user.adminProfile.name;
    return user.email.split('@')[0]; // Fallback to email username
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Generate temporary password
  const generateTempPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempPassword = generateTempPassword();
      const userData = {
        email: newUser.email,
        password: tempPassword,
        role: newUser.role
      };

      const response = await createUser(userData);

      if (response && response.status === 200) {
        alert(`✅ User created successfully!\n\nAn email with login credentials has been sent to: ${newUser.email}\n\nThe user can now log in and change their password.`);

        // Reset form and close modal
        setNewUser({ email: "", role: "DOCTOR", tempPassword: "" });
        setShowAddUserModal(false);

        // Refresh users list
        fetchUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Failed to create user";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeneratePassword = () => {
    const tempPassword = generateTempPassword();
    setNewUser(prev => ({
      ...prev,
      tempPassword
    }));
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      setUsersLoading(true);
      setError(null);
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err?.response?.data?.message || err.message || "Failed to delete user");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.isProfileComplete ? "Pending" : "Active";
    const confirmed = window.confirm(
      `Change status of ${user.name} from ${user.status} to ${newStatus}?`
    );
    if (!confirmed) return;

    try {
      setUsersLoading(true);
      setError(null);
      await updateUserStatus(user.id, !user.isProfileComplete);
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      setError(err?.response?.data?.message || err.message || "Failed to update user status");
    } finally {
      setUsersLoading(false);
    }
  };

  return (
    <div className="admin-users-page">
      {/* Sidebar Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <div className={`admin-users-layout ${isSidebarOpen ? "" : "collapsed"}`}>
        {isSidebarOpen && <Sidebar role="Admin" />}

        <main className="admin-users-content">
          <h1 className="page-title">Manage Users</h1>

          {/* --- Add User Button --- */}
          <div className="add-user-container">
            <button
              className="add-user-btn"
              onClick={() => setShowAddUserModal(true)}
            >
              + Add New User
            </button>
            <button
              className="refresh-btn"
              onClick={fetchUsers}
              disabled={usersLoading}
            >
              {usersLoading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={fetchUsers} className="retry-btn">Retry</button>
            </div>
          )}

          {/* --- User Table --- */}
          <section className="user-table-section">
            {usersLoading ? (
              <div className="loading-container">
                <p>Loading users...</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.role}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.createdAt}</td>
                        <td className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleToggleStatus(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="Enter user's email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="PATHOLOGIST">Pathologist</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tempPassword">Temporary Password</label>
                <div className="password-input-group">
                  <input
                    type="text"
                    id="tempPassword"
                    name="tempPassword"
                    value={newUser.tempPassword}
                    onChange={handleInputChange}
                    placeholder="Click generate to create password"
                    readOnly
                    required
                  />
                  <button
                    type="button"
                    className="generate-btn"
                    onClick={handleGeneratePassword}
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || !newUser.email || !newUser.tempPassword}
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
