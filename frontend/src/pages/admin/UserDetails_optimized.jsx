import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import adminApi from "../../services/adminApi";
import { toast } from "react-toastify";

function UserDetails({ userId, onClose, fetchUsers }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [status, setStatus] = useState("");
  const [showreason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [newRole, setNewRole] = useState("");

  const { user } = useAuth();
  const token = user?.userWithToken?.token;

  const fetchUserDetails = async () => {
    try {
      if (!token || !userId) {
        console.log("Missing token or userId:", { token: !!token, userId });
        return;
      }

      console.log("Fetching details for userId:", userId);
      setLoading(true);
      setError(null);

      const res = await adminApi.getUserDetails(userId, token);
      console.log("res in UserDetails:", res);

      if (res.success) {
        setUserDetails(res.user);
      } else {
        setError(res.message || "Failed to fetch user details");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setShowReason(true);
  };

  const updateUserStatus = async () => {
    // Placeholder for status update functionality
    try {
      const res = await adminApi.updateUserStatus(
        userId,
        status,
        reason,
        token
      );
      console.log("res in updateuser status=>", res);
      if (res.success) {
        setShowReason(false);
        toast.success("User status updated Successfully");
        fetchUserDetails();
        if(fetchUsers) fetchUsers();
      }
    } catch (err) {
      console.log("err in upatestatus", err);
    }
  };

  const PromoteUserRole = async (email, newRole) => {
    try {
      const res = await adminApi.promoteUser(email, newRole, token);
      console.log("res in promoting user role=>", res);
      if (res.success) {
        toast.success("User role promoted successfully");
        fetchUserDetails();
        if(fetchUsers) fetchUsers();
      }
    } catch (err) {
      console.log("err in promoting user role", err);
    }
  };


  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (taskstatus) => {
    switch (taskstatus) {
      case "To Do":
        return "bg-yellow-500 text-white";
      case "In Progress":
        return "bg-blue-500 text-white";
      case "Completed":
        return "bg-green-500 text-white";
      case "On Hold":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super-admin":
        return "bg-red-500 text-white";
      case "admin":
        return "bg-orange-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Loading User Details
            </h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Unable to Load User
            </h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUserDetails()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="flex-1  px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">👤</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              User Not Found
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              The requested user details could not be found.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-xl">
        {/* Header */}

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 sm:p-8 text-white relative rounded-t-3xl shadow-md">
          {/* Close & Status */}
          <div className="flex justify-between items-center mb-6">
            {/* Status Dropdown */}
            <select
              onChange={handleStatusChange}
              value={userDetails?.profile?.status}
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition"
            >
              <option value="Active">🟢 Active</option>
              <option value="Inactive">⚪ Inactive</option>
              <option value="Banned">🔴 Banned</option>
            </select>

            {showreason && (
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for setting status to "${status}"`}
                  className="w-full sm:w-64 p-2 rounded-md border border-gray-300 text-black text-sm resize-none"
                  rows={2}
                />
                <button
                  onClick={updateUserStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Update
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {/* Role Promotion */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <select
              value={userDetails?.role}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="user">User</option>
              <option value="admin">🛡️ Admin</option>
              <option value="super-admin">👑 Super Admin</option>
            </select>

            <button
              disabled={!newRole}
              onClick={() => PromoteUserRole(userDetails.email, newRole)}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                newRole
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Promote
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-6 space-y-4 sm:space-y-0">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={userDetails.profileImage}
                alt={userDetails.username}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/40 shadow-xl object-cover"
              />
              <div
                className={`absolute -bottom-2 -right-2 w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-base sm:text-lg font-bold ${
                  userDetails.isAdmin ? "bg-orange-500" : "bg-green-500"
                }`}
              >
                {userDetails.isAdmin ? "👑" : "👤"}
              </div>
            </div>

            {/* User Details */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1">
                {userDetails.username}
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mb-3">
                {userDetails.email}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md ${getRoleColor(
                    userDetails.role
                  )}`}
                >
                  {userDetails.role === "super-admin"
                    ? "👑 SUPER ADMIN"
                    : userDetails.role === "admin"
                    ? "🛡️ ADMIN"
                    : "👤 MEMBER"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md ${
                    userDetails.isAdmin
                      ? "bg-purple-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {userDetails.isAdmin ? "⚡ ADMIN" : "🌟 MEMBER"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md ${
                    userDetails.hascompletedGuideline
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {userDetails.hascompletedGuideline
                    ? "✅ VERIFIED"
                    : "⏳ PENDING"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 max-h-[calc(95vh-180px)] overflow-y-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              {
                label: "Tasks",
                value: userDetails.tasks?.length || 0,
                icon: "📋",
                color: "blue",
              },
              {
                label: "Joined Projects",
                value: userDetails.projects?.joined?.length || 0,
                icon: "🚀",
                color: "green",
              },
              {
                label: "Owned Projects",
                value: userDetails.projects?.owned?.length || 0,
                icon: "👑",
                color: "purple",
              },
              {
                label: "Requests",
                value: userDetails.requests?.sent?.length || 0,
                icon: "📨",
                color: "orange",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-${stat.color}-50 border border-${stat.color}-200 p-3 sm:p-4 rounded-lg shadow-sm`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div
                    className={`text-xl sm:text-2xl font-bold text-${stat.color}-700 mb-1`}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-medium text-${stat.color}-600`}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Information */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>👤</span>
                  Profile Information
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {/* Bio */}
                {userDetails.profile?.bio && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <span>📝</span> Bio
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {userDetails.profile.bio}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {userDetails.profile?.experience && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <span>💼</span> Experience
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {userDetails.profile.experience}
                    </p>
                    {userDetails.profile?.experienceLevel && (
                      <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                        {userDetails.profile.experienceLevel}
                      </span>
                    )}
                  </div>
                )}

                {/* Skills */}
                {userDetails.profile?.skills &&
                  userDetails.profile.skills.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                        <span>🛠️</span> Skills (
                        {userDetails.profile.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {userDetails.profile.skills
                          .slice(0, 8)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        {userDetails.profile.skills.length > 8 && (
                          <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded">
                            +{userDetails.profile.skills.length - 8}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* Activity Stats */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                    <span>📊</span> Activity
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-yellow-100 p-2 rounded text-center">
                      <div className="font-bold text-yellow-800">
                        {userDetails.profile?.points || 0}
                      </div>
                      <div className="text-yellow-600">Points</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="font-bold text-green-800">
                        {userDetails.profile?.reliabilityScore || 0}%
                      </div>
                      <div className="text-green-600">Reliability</div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded text-center">
                      <div className="font-bold text-blue-800">
                        {userDetails.profile?.weeklyLogins?.length || 0}
                      </div>
                      <div className="text-blue-600">Weekly Logins</div>
                    </div>
                    <div className="bg-purple-100 p-2 rounded text-center">
                      <div className="font-bold text-purple-800">
                        {userDetails.profile?.githubCommits || 0}
                      </div>
                      <div className="text-purple-600">Commits</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks & Projects */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="bg-green-600 text-white p-4 rounded-t-lg">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🚀</span>
                  Tasks & Projects
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {/* Recent Tasks */}
                {userDetails.tasks?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Recent Tasks ({userDetails.tasks.length})
                    </h4>
                    <div className="space-y-2">
                      {userDetails.tasks.slice(0, 3).map((task, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded border-l-4 border-blue-500"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-gray-800 text-sm">
                              {task.title}
                            </h5>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-2">
                            {task.description?.substring(0, 80)}...
                          </p>
                          <div className="text-xs text-gray-500">
                            Project: {task.projectId?.name || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {(userDetails.projects?.owned?.length > 0 ||
                  userDetails.projects?.joined?.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Projects
                    </h4>

                    {/* Owned Projects */}
                    {userDetails.projects?.owned?.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-purple-800 mb-2">
                          👑 Owned ({userDetails.projects.owned.length})
                        </h5>
                        <div className="space-y-2">
                          {userDetails.projects.owned
                            .slice(0, 2)
                            .map((project, index) => (
                              <div
                                key={index}
                                className="bg-purple-50 p-2 rounded border border-purple-200"
                              >
                                <div className="font-medium text-purple-800 text-sm">
                                  {project.name}
                                </div>
                                <div className="text-xs text-purple-600">
                                  Created: {formatDate(project.createdAt)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Joined Projects */}
                    {userDetails.projects?.joined?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-green-800 mb-2">
                          🤝 Joined ({userDetails.projects.joined.length})
                        </h5>
                        <div className="space-y-2">
                          {userDetails.projects.joined
                            .slice(0, 2)
                            .map((project, index) => (
                              <div
                                key={index}
                                className="bg-green-50 p-2 rounded border border-green-200"
                              >
                                <div className="font-medium text-green-800 text-sm">
                                  {project.name}
                                </div>
                                <div className="text-xs text-green-600">
                                  Members: {project.user?.length || 0}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!userDetails.tasks?.length &&
                  !userDetails.projects?.owned?.length &&
                  !userDetails.projects?.joined?.length && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2 opacity-50">📝</div>
                      <p className="text-gray-500">No tasks or projects yet</p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-gray-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>⚙️</span>
                Account Details
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Basic Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>{" "}
                      <span className="font-mono text-xs">
                        {userDetails._id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>{" "}
                      <span className="font-medium">{userDetails.role}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Joined:</span>{" "}
                      <span className="font-medium">
                        {formatDate(userDetails.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admin:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          userDetails.isAdmin
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userDetails.isAdmin ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verified:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          userDetails.hascompletedGuideline
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {userDetails.hascompletedGuideline ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          userDetails.profile?.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userDetails.profile?.status === "Active"
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tasks:</span>
                      <span className="font-bold text-blue-600">
                        {userDetails.tasks?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Projects:</span>
                      <span className="font-bold text-green-600">
                        {(userDetails.projects?.joined?.length || 0) +
                          (userDetails.projects?.owned?.length || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Requests:</span>
                      <span className="font-bold text-orange-600">
                        {userDetails.requests?.sent?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
