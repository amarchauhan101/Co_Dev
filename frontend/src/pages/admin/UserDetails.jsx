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
        return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg";
      case "In Progress":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg";
      case "Completed":
        return "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg";
      case "On Hold":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-lg";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "super-admin":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg";
      case "admin":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-indigo-900/95 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="text-center relative z-10">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              Loading User Profile
            </h3>
            <p className="text-gray-600 text-lg">Fetching detailed information...</p>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-red-900/90 to-rose-900/95 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500"></div>
          
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-500 rounded-full animate-ping opacity-20"></div>
              <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Unable to Load User
            </h3>
            <p className="text-red-600 mb-8 bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => fetchUserDetails()}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-2xl hover:from-gray-600 hover:to-gray-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
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
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-slate-900/95 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600"></div>
          
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-400 to-slate-600 rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              User Not Found
            </h3>
            <p className="text-gray-600 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
              The requested user profile could not be found in our database.
            </p>
            <button
              onClick={onClose}
              className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-700 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-800 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Users
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/80 to-indigo-900/95 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100 relative">
        
        {/* Compact Header with Premium Design */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 p-3 sm:p-4 text-white overflow-hidden">
          {/* Premium Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-indigo-600/30"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600"></div>
          
          {/* Compact Header Controls */}
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center mb-3 gap-3">
            
            {/* Compact Admin Controls Section */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              {/* Status Management */}
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg">
                <label className="block text-xs font-medium mb-1 text-blue-100">Status</label>
                <select
                  onChange={handleStatusChange}
                  value={userDetails?.profile?.status}
                  className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-2 py-1 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 text-sm min-w-[120px]"
                >
                  <option value="Active" className="text-gray-800">🟢 Active</option>
                  <option value="Inactive" className="text-gray-800">⚪ Inactive</option>
                  <option value="Banned" className="text-gray-800">🔴 Banned</option>
                </select>
              </div>

              {/* Role Management */}
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg">
                <label className="block text-xs font-medium mb-1 text-blue-100">Role</label>
                <div className="flex gap-1">
                  <select
                    value={newRole || userDetails?.role}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-2 py-1 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 text-sm"
                  >
                    <option value="user" className="text-gray-800">👤 User</option>
                    <option value="admin" className="text-gray-800">🛡️ Admin</option>
                    <option value="super-admin" className="text-gray-800">👑 Super Admin</option>
                  </select>
                  <button
                    disabled={!newRole}
                    onClick={() => PromoteUserRole(userDetails.email, newRole)}
                    className={`px-3 py-1 rounded-lg text-white font-medium transition-all duration-200 text-sm ${
                      newRole
                        ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-gray-400/50 cursor-not-allowed"
                    }`}
                  >
                    Promote
                  </button>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Compact Reason Input for Status Change */}
          {showreason && (
            <div className="relative z-10 mb-3">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg">
                <h4 className="text-sm font-semibold mb-2 text-blue-100">Reason for Status Change</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={`Enter reason for setting status to "${status}"`}
                    className="flex-1 p-2 rounded-lg border border-white/30 bg-white/20 backdrop-blur-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none text-sm"
                    rows={2}
                  />
                  <button
                    onClick={updateUserStatus}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compact Profile Section */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-4">
            
            {/* Compact Profile Image */}
            <div className="relative group">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 p-1 backdrop-blur-md">
                  <img
                    src={userDetails.profileImage}
                    alt={userDetails.username}
                    className="w-full h-full rounded-full object-cover border-2 border-white/50 shadow-xl"
                  />
                </div>
                
                {/* Compact Status Badge */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold ${
                  userDetails.isAdmin ? "bg-gradient-to-br from-orange-500 to-red-600" : "bg-gradient-to-br from-green-500 to-emerald-600"
                }`}>
                  {userDetails.isAdmin ? "👑" : "👤"}
                </div>
              </div>
            </div>

            {/* Compact User Information */}
            <div className="text-center sm:text-left flex-1">
              <div className="mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-1 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent tracking-tight">
                  {userDetails.username}
                </h1>
                <p className="text-sm text-blue-100 font-medium mb-1">{userDetails.email}</p>
                <p className="text-xs text-blue-200 opacity-75">Member since {formatDate(userDetails.createdAt)}</p>
              </div>

              {/* Compact Badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border border-white/30 shadow-sm ${getRoleColor(userDetails.role)}`}>
                  {userDetails.role === 'super-admin' ? '👑 SUPER ADMIN' : userDetails.role === 'admin' ? '🛡️ ADMIN' : '👤 MEMBER'}
                </span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border border-white/30 shadow-sm ${
                  userDetails.isAdmin ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                }`}>
                  {userDetails.isAdmin ? '⚡ ADMIN' : '🌟 USER'}
                </span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border border-white/30 shadow-sm ${
                  userDetails.hascompletedGuideline ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                }`}>
                  {userDetails.hascompletedGuideline ? '✅ VERIFIED' : '⏳ PENDING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimized Content Area with Better Space Usage */}
        <div className="p-4 sm:p-6 max-h-[calc(95vh-200px)] overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
          
          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: "Tasks Assigned", value: userDetails.tasks?.length || 0, icon: "📋", gradient: "from-blue-500 to-cyan-600", iconBg: "from-blue-400 to-cyan-500" },
              { label: "Joined Projects", value: userDetails.projects?.joined?.length || 0, icon: "🚀", gradient: "from-emerald-500 to-teal-600", iconBg: "from-emerald-400 to-teal-500" },
              { label: "Owned Projects", value: userDetails.projects?.owned?.length || 0, icon: "👑", gradient: "from-purple-500 to-indigo-600", iconBg: "from-purple-400 to-indigo-500" },
              { label: "Total Requests", value: userDetails.requests?.sent?.length || 0, icon: "📨", gradient: "from-orange-500 to-red-600", iconBg: "from-orange-400 to-red-500" },
            ].map((stat, i) => (
              <div key={i} className="group relative">
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>
                
                {/* Card */}
                <div className="relative bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-center">
                    {/* Icon */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-gradient-to-br ${stat.iconBg} rounded-xl flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110`}>
                      <span className="text-lg sm:text-xl">{stat.icon}</span>
                    </div>
                    
                    {/* Value */}
                    <div className={`text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    
                    {/* Label */}
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optimized Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Profile Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                  <span className="text-2xl">👤</span>
                  Profile Overview
                </h3>
              </div>
              
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {/* Bio Section */}
                {userDetails.profile?.bio && (
                  <div className="group">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 group-hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                      <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-sm bg-gradient-to-r from-blue-500 to-indigo-600 p-1 rounded-lg text-white">📝</span>
                        <span className="text-sm">Biography</span>
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-xs">{userDetails.profile.bio}</p>
                    </div>
                  </div>
                )}

                {/* Experience Section */}
                {userDetails.profile?.experience && (
                  <div className="group">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100 group-hover:border-green-300 transition-all duration-300 hover:shadow-md">
                      <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 p-1 rounded-lg text-white">💼</span>
                        <span className="text-sm">Professional Experience</span>
                      </h4>
                      <p className="text-gray-700 mb-2 leading-relaxed text-xs">{userDetails.profile.experience}</p>
                      {userDetails.profile?.experienceLevel && (
                        <span className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-md">
                          {userDetails.profile.experienceLevel}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {userDetails.profile?.skills && userDetails.profile.skills.length > 0 && (
                  <div className="group">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100 group-hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                      <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-600 p-1 rounded-lg text-white">🛠️</span>
                        <span className="text-sm">Technical Skills ({userDetails.profile.skills.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {userDetails.profile.skills.slice(0, 12).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
                            {skill}
                          </span>
                        ))}
                        {userDetails.profile.skills.length > 12 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs rounded-lg font-medium shadow-md">
                            +{userDetails.profile.skills.length - 12} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Activity Stats */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-100">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-sm bg-gradient-to-r from-yellow-500 to-orange-600 p-1 rounded-lg text-white">📊</span>
                    <span className="text-sm">Performance Metrics</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Reputation Points", value: userDetails.profile?.points || 0, gradient: "from-yellow-400 to-orange-500", icon: "🏆" },
                      { label: "Reliability Score", value: `${userDetails.profile?.reliabilityScore || 0}%`, gradient: "from-green-400 to-emerald-500", icon: "⭐" },
                      { label: "Weekly Logins", value: userDetails.profile?.weeklyLogins?.length || 0, gradient: "from-blue-400 to-indigo-500", icon: "📅" },
                      { label: "GitHub Commits", value: userDetails.profile?.githubCommits || 0, gradient: "from-purple-400 to-pink-500", icon: "💻" },
                    ].map((item, index) => (
                      <div key={index} className={`bg-gradient-to-r ${item.gradient} p-2 rounded-lg text-white text-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}>
                        <div className="text-lg mb-1">{item.icon}</div>
                        <div className="font-bold text-sm mb-1">{item.value}</div>
                        <div className="text-xs opacity-90 font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks & Projects Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                  <span className="text-2xl">🚀</span>
                  Work Portfolio
                </h3>
              </div>
              
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {/* Recent Tasks */}
                {userDetails.tasks?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-sm bg-gradient-to-r from-blue-500 to-indigo-600 p-1 rounded-lg text-white">📋</span>
                      <span className="text-sm">Recent Tasks ({userDetails.tasks.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {userDetails.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-800 text-xs flex-1 pr-2">{task.title}</h5>
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getStatusColor(task.status)} transform transition-all duration-200 hover:scale-105`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-2 leading-relaxed">{task.description?.substring(0, 120)}...</p>
                          <div className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-md inline-block">
                            📁 Project: {task.projectId?.name || 'Unassigned'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Overview */}
                {(userDetails.projects?.owned?.length > 0 || userDetails.projects?.joined?.length > 0) && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-600 p-1 rounded-lg text-white">🏗️</span>
                      <span className="text-sm">Project Portfolio</span>
                    </h4>
                    
                    {/* Owned Projects */}
                    {userDetails.projects?.owned?.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-1 py-0.5 rounded text-xs">👑</span>
                          <span>Owned Projects ({userDetails.projects.owned.length})</span>
                        </h5>
                        <div className="space-y-2">
                          {userDetails.projects.owned.slice(0, 2).map((project, index) => (
                            <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-xl border border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5">
                              <div className="font-semibold text-purple-800 mb-1 flex items-center gap-1 text-xs">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                {project.name}
                              </div>
                              <div className="text-xs text-purple-600 flex items-center gap-1">
                                <span>📅</span>
                                <span>Created: {formatDate(project.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Joined Projects */}
                    {userDetails.projects?.joined?.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-1 py-0.5 rounded text-xs">🤝</span>
                          <span>Collaborated Projects ({userDetails.projects.joined.length})</span>
                        </h5>
                        <div className="space-y-2">
                          {userDetails.projects.joined.slice(0, 2).map((project, index) => (
                            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-xl border border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5">
                              <div className="font-semibold text-green-800 mb-1 flex items-center gap-1 text-xs">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {project.name}
                              </div>
                              <div className="text-xs text-green-600 flex items-center gap-1">
                                <span>👥</span>
                                <span>Team Size: {project.user?.length || 0} members</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Premium Empty State */}
                {(!userDetails.tasks?.length && !userDetails.projects?.owned?.length && !userDetails.projects?.joined?.length) && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-4xl opacity-50">📝</span>
                    </div>
                    <h5 className="text-xl font-bold text-gray-600 mb-2">No Projects or Tasks</h5>
                    <p className="text-gray-500">This user hasn't been assigned any work yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Account Details Section */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 text-white p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                <span className="text-2xl">⚙️</span>
                System Information
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-1 rounded-lg text-sm">ℹ️</span>
                    <span className="text-sm">Account Information</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">User ID:</span> 
                      <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">{userDetails._id.substring(0, 12)}...</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Account Type:</span> 
                      <span className="font-semibold capitalize bg-blue-100 px-2 py-1 rounded">{userDetails.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Registration:</span> 
                      <span className="font-semibold bg-blue-100 px-2 py-1 rounded">{formatDate(userDetails.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-1 rounded-lg text-sm">📊</span>
                    <span className="text-sm">Current Status</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Admin Access:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${userDetails.isAdmin ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                        {userDetails.isAdmin ? '✅ Granted' : '❌ Standard'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Verification:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${userDetails.hascompletedGuideline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {userDetails.hascompletedGuideline ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${userDetails.profile?.status === "Active" ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {userDetails.profile?.status === "Active" ? '🟢 Active' : '⚪ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-1 rounded-lg text-sm">📈</span>
                    <span className="text-sm">Activity Summary</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Tasks:</span>
                      <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded shadow-sm">{userDetails.tasks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Project Count:</span>
                      <span className="font-bold text-green-600 bg-green-100 px-2 py-1 rounded shadow-sm">{(userDetails.projects?.joined?.length || 0) + (userDetails.projects?.owned?.length || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Requests Sent:</span>
                      <span className="font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded shadow-sm">{userDetails.requests?.sent?.length || 0}</span>
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
