// ❌ Remove this import - you don't need backend imports in frontend
// const { getAllUsers } = require("../../../backend (2)new/backend/controllers/admincontroller");

const API_BASE_URL = "http://localhost:8000/api/v1/admin";

class AdminApi {
  constructor() {
    this.getUser = () => {
      try {
        return JSON.parse(localStorage.getItem("user")) || null;
      } catch {
        return null;
      }
    };
    this.getToken = () => this.getUser()?.userWithToken?.token || null;
  }

  async request(endpoint, options = {}) {
    // ✅ Fix: rename "option" to "options"
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json", // ✅ Fix: Capital "C"
        Authorization: `Bearer ${this.getToken()}`, // ✅ Fix: use getToken method
      },
      ...options,
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json(); // ✅ Fix: Add "await"

      if (!res.ok) {
        throw new Error(data.msg || data.message || "API request failed");
      }

      return data;
    } catch (err) {
      console.error("Error in AdminApi service:", err);
      throw err; // ✅ Fix: Re-throw error so components can handle it
    }
  }

  // ✅ Dashboard API
  async getDashboardStats() {
    return this.request("/dashboard");
  }

  // ✅ User Management APIs
  async getAllUsers(params = {}) {
    // ✅ Fix: Add params parameter
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users?${queryString}`);
  }

  async getUserDetails(userId, token) {
  return this.request(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token || this.getToken()}`,
    },
  });
}


  async updateUserStatus(userId, status, reason) {
    // ✅ Fix: Add reason parameter
    return this.request(`/users/${userId}/status`, {
      // ✅ Fix: correct endpoint
      method: "PUT",
      body: JSON.stringify({ status, reason }),
    });
  }

  async updateUserPoints(userId, points, reason) {
    // ✅ Fix: Add reason parameter
    return this.request(`/users/${userId}/points`, {
      method: "PUT",
      body: JSON.stringify({ points, reason }), // ✅ Fix: Add body content
    });
  }

  // ✅ Project Management APIs
  async getAllProjects(params = {}) {
    // ✅ Add params for pagination/search
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects?${queryString}`);
  }

  async getProjectDetails(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async deleteProject(projectId, reason) {
    // ✅ Fix: Add reason parameter
    return this.request(`/projects/${projectId}`, {
      method: "DELETE", // ✅ Fix: Add DELETE method
      body: JSON.stringify({ reason }),
    });
  }

  // ✅ Task Management APIs
  async getAllTasks(params = {}) {
    // ✅ Add params for filtering
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tasks?${queryString}`);
  }

  async verifyTask(taskId, verified, reason) {
    // ✅ Fix: Add missing parameters
    return this.request(`/tasks/${taskId}/verify`, {
      method: "PUT", // ✅ Fix: Add PUT method
      body: JSON.stringify({ verified, reason }),
    });
  }

  // ✅ Request Management APIs
  async getAllProjectRequests(params = {}) {
    // ✅ Add params for filtering
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/requests?${queryString}`);
  }

  // ✅ Admin Management APIs
  async promoteUser(email, newRole) {
    // ✅ Add missing function
    return this.request("/promote-user", {
      method: "POST",
      body: JSON.stringify({ email, newRole }),
    });
  }

  async inviteAdmin(email, role) {
    // ✅ Add missing function
    return this.request("/admin-invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  async demoteAdmin(adminId, reason) {
    // ✅ Fix: Add reason parameter
    return this.request(`/demote-admin/${adminId}`, {
      method: "PUT", // ✅ Fix: Add PUT method
      body: JSON.stringify({ reason }),
    });
  }

  async getAllAdmins() {
    return this.request("/admins");
  }

  async firstsuperAdmin(email, secretkey) {
    return this.request("/firstsuperadmin", {
      method: "POST",
      body: JSON.stringify({ email, secretkey }),
    });
  }
  async registerWithInvitation(email, password, invitationToken, username) {
    return this.request("/registerwithinvite", {
      method: "POST",
      body: JSON.stringify({ email, password, invitationToken, username }),
    });
  }
}

// ✅ Export as singleton
export default new AdminApi();
