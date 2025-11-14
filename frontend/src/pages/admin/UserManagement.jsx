import React from "react";
import adminApi from "../../services/adminApi";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UserDetails from "./UserDetails";

function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const navigate = useNavigate();
  
  const {user} = useAuth();
  const token = user?.userWithToken?.token;
  
  const fetchUsers = async (page = 1) => {
    if(!token){
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.getAllUsers({
        page: page, limit: 12
      });
      if(res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openUserModal = (user) => {
    console.log("user=>", user);
    setSelectedUser(user);
    setShowUserModal(true);
  };
  console.log("selecteduser",
    selectedUser
  );

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
    console.log("selectedUser",selectedUser);
    console.log("shoe user modal",showUserModal);
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'super-admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg';
      case 'admin': return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                User Management Hub
              </h1>
              <p className="text-xl text-slate-600 font-medium">
                Complete oversight and management of your platform community
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Advanced Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                {
                  title: "Total Users",
                  value: pagination.total || 0,
                  subtitle: "Registered Members",
                  icon: "👥",
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50",
                  textColor: "text-blue-700",
                  iconBg: "bg-blue-500"
                },
                {
                  title: "Active Users",
                  value: users.filter(u => u.profile?.isactive).length,
                  subtitle: "Currently Online",
                  icon: "🟢",
                  gradient: "from-green-500 to-emerald-500",
                  bgGradient: "from-green-50 to-emerald-50",
                  textColor: "text-green-700",
                  iconBg: "bg-green-500"
                },
                {
                  title: "Admin Users",
                  value: users.filter(u => u.isAdmin).length,
                  subtitle: "Platform Admins",
                  icon: "👑",
                  gradient: "from-purple-500 to-violet-500",
                  bgGradient: "from-purple-50 to-violet-50",
                  textColor: "text-purple-700",
                  iconBg: "bg-purple-500"
                },
                {
                  title: "Total Points",
                  value: users.reduce((acc, u) => acc + (u.activity?.totalPoints || u.profile?.points || 0), 0),
                  subtitle: "Platform Wide",
                  icon: "⭐",
                  gradient: "from-orange-500 to-red-500",
                  bgGradient: "from-orange-50 to-red-50",
                  textColor: "text-orange-700",
                  iconBg: "bg-orange-500"
                },
                {
                  title: "Completed Tasks",
                  value: users.reduce((acc, u) => acc + (u.activity?.tasksCompleted || 0), 0),
                  subtitle: "All Time",
                  icon: "✅",
                  gradient: "from-indigo-500 to-purple-500",
                  bgGradient: "from-indigo-50 to-purple-50",
                  textColor: "text-indigo-700",
                  iconBg: "bg-indigo-500"
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group overflow-hidden`}
                >
                  {/* Background decoration */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                      <div className={`text-right ${stat.textColor}`}>
                        <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">{stat.title}</div>
                      </div>
                    </div>
                    
                    <div className={`text-4xl font-black ${stat.textColor} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                      {stat.value.toLocaleString()}
                    </div>
                    
                    <div className={`text-sm font-medium ${stat.textColor} opacity-80`}>
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {users.map((userData) => (
              <div 
                key={userData._id} 
                className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/40 overflow-hidden transform hover:-translate-y-2 cursor-pointer relative"
                onClick={() => openUserModal(userData)}
              >
                {/* Card Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-8">
                  {/* Enhanced User Header */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500"></div>
                      <img 
                        src={userData.profileImage} 
                        alt={userData.username}
                        className="relative w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xs font-bold ${
                        userData.isAdmin 
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' 
                          : userData.profile?.isactive 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                            : 'bg-gray-400 text-white'
                      }`}>
                        {userData.isAdmin ? '👑' : userData.profile?.isactive ? '✓' : '⏸'}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {userData.username}
                      </h3>
                      <p className="text-sm text-slate-500 truncate mb-3">{userData.email}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getRoleColor(userData.role)}`}>
                          {userData.role.toUpperCase()}
                        </span>
                        {userData.profile?.isactive !== undefined && (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(userData.profile.isactive)}`}>
                            {userData.profile.isactive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        )}
                        {userData.hascompletedGuideline && (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 shadow-sm">
                            VERIFIED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      {
                        label: "Tasks",
                        value: userData.activity?.tasksCompleted || 0,
                        icon: "📋",
                        color: "blue"
                      },
                      {
                        label: "Points",
                        value: userData.activity?.totalPoints || userData.profile?.points || 0,
                        icon: "⭐",
                        color: "yellow"
                      },
                      {
                        label: "Projects",
                        value: userData.activity?.projectsOwned || 0,
                        icon: "🚀",
                        color: "purple"
                      },
                      {
                        label: "Reliability",
                        value: `${userData.profile?.reliabilityScore || 0}%`,
                        icon: "🎯",
                        color: "green"
                      }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200 rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300`}
                      >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-2xl font-black text-${stat.color}-700 mb-1`}>
                          {stat.value}
                        </div>
                        <div className={`text-xs font-semibold text-${stat.color}-600 uppercase tracking-wider`}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Quick Info */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    {[
                      {
                        label: "Tasks Assigned",
                        value: userData.activity?.tasksAssigned || 0,
                        icon: "📝",
                        color: "blue"
                      },
                      {
                        label: "Weekly Logins",
                        value: userData.profile?.weeklyLogins?.length || 0,
                        icon: "🔄",
                        color: "green"
                      },
                      {
                        label: "GitHub Commits",
                        value: userData.profile?.githubCommits || 0,
                        icon: "💻",
                        color: "purple"
                      },
                      {
                        label: "Member Since",
                        value: formatDate(userData.createdAt),
                        icon: "📅",
                        color: "orange"
                      }
                    ].map((info, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="text-base">{info.icon}</span>
                          {info.label}:
                        </span>
                        <span className="font-bold text-slate-800">{info.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Skills Preview */}
                  {userData.profile?.skills && userData.profile.skills.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-slate-600">🛠️ Skills:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userData.profile.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-full border border-slate-300 hover:scale-105 transition-transform"
                          >
                            {skill}
                          </span>
                        ))}
                        {userData.profile.skills.length > 4 && (
                          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-300">
                            +{userData.profile.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-white/80 backdrop-blur-lg border border-white/60 rounded-2xl hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                ← Previous
              </button>
              
              <div className="flex space-x-2">
                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-110'
                          : 'text-slate-600 bg-white/80 backdrop-blur-lg border border-white/60 hover:bg-white hover:shadow-lg'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-white/80 backdrop-blur-lg border border-white/60 rounded-2xl hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetails userId={selectedUser._id} onClose={closeUserModal} fetchUsers={fetchUsers} />
      )}
    </div>
  );
}

export default UserManagement;
