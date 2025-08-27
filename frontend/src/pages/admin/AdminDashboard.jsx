import React, { useEffect, useState } from "react";
import {useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  FolderOpen,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  Star,
  Target,
  Zap,
  Crown,
  Database,
  GitBranch,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const token = user?.userWithToken?.token;
  const navigate = useNavigate();

  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        "http://localhost:8000/api/v1/admin/dashboard",
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Admin dashboard data:", res.data);
      setDashboardData(res.data.stats);
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setError(err.response?.data?.msg || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <h2 className="text-white text-xl mt-6 font-semibold">
            Loading Dashboard...
          </h2>
          <p className="text-slate-400 mt-2">Gathering the latest analytics</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl mb-2 font-semibold">
            Dashboard Error
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { users, projects, tasks, requests, admin: adminStats } = dashboardData;
  const userRole = user?.userWithToken?.user?.role;
  const isSuperAdmin = userRole === "super-admin";

  // Stats Cards Component
  const StatsCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    bgColor,
    trend,
  }) => (
    <div
      className={`relative overflow-hidden rounded-2xl ${bgColor} p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-slate-700/50`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">
            {value.toLocaleString()}
          </p>
          {change && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend === "up"
                  ? "text-green-400"
                  : trend === "down"
                  ? "text-red-400"
                  : "text-blue-400"
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 mr-1 ${
                  trend === "down" ? "rotate-180" : ""
                }`}
              />
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );

  // Progress Ring Component
  const ProgressRing = ({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "#8b5cf6",
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative">
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#334155"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{progress}%</span>
        </div>
      </div>
    );
  };

  // Chart Card Component
  const ChartCard = ({ title, children, className = "" }) => (
    <div
      className={`bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-purple-400" />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {isSuperAdmin
                  ? "👑 Super Admin Dashboard"
                  : "🛡️ Admin Dashboard"}
              </h1>
              <p className="text-slate-400 text-lg">
                Welcome back! Here's what's happening with your platform today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Last updated</p>
                <p className="text-white font-medium">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={fetchData}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          <StatsCard
            title="Total Users"
            value={users.total}
            change={`+${users.newUserThisWeek} this week`}
            icon={Users}
            color="bg-blue-500"
            bgColor="bg-slate-800/40 backdrop-blur-sm"
            trend="up"
          />
          <StatsCard
            title="Active Users"
            value={users.active}
            change={`${Math.round(
              (users.active / users.total) * 100
            )}% of total`}
            icon={UserCheck}
            color="bg-green-500"
            bgColor="bg-slate-800/40 backdrop-blur-sm"
            trend="up"
          />
          <StatsCard
            title="Total Projects"
            value={projects.total}
            change={`+${projects.newThisWeek} this week`}
            icon={FolderOpen}
            color="bg-purple-500"
            bgColor="bg-slate-800/40 backdrop-blur-sm"
            trend="up"
          />
          <StatsCard
            title="Completed Tasks"
            value={tasks.completed}
            change={`${tasks.completionRate}% completion rate`}
            icon={CheckSquare}
            color="bg-orange-500"
            bgColor="bg-slate-800/40 backdrop-blur-sm"
            trend="up"
          />
        </div>

        {/* User Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          {/* User Status Overview */}
          <ChartCard title="User Status Distribution" className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <ProgressRing
                    progress={Math.round((users.active / users.total) * 100)}
                    color="#10b981"
                  />
                </div>
                <p className="text-green-400 font-semibold mt-2">
                  Active Users
                </p>
                <p className="text-white text-2xl font-bold">{users.active}</p>
              </div>
              <div className="text-center">
                <div className="relative inline-block">
                  <ProgressRing
                    progress={Math.round((users.inactive / users.total) * 100)}
                    color="#f59e0b"
                  />
                </div>
                <p className="text-yellow-400 font-semibold mt-2">
                  Inactive Users
                </p>
                <p className="text-white text-2xl font-bold">
                  {users.inactive}
                </p>
              </div>
              <div className="text-center">
                <div className="relative inline-block">
                  <ProgressRing
                    progress={Math.round((users.banned / users.total) * 100)}
                    color="#ef4444"
                  />
                </div>
                <p className="text-red-400 font-semibold mt-2">Banned Users</p>
                <p className="text-white text-2xl font-bold">{users.banned}</p>
              </div>
            </div>
          </ChartCard>

          {/* User Growth */}
          <ChartCard title="User Growth">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="text-slate-300">This Week</span>
                </div>
                <span className="text-white font-bold text-lg">
                  +{users.newUserThisWeek}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <span className="text-slate-300">This Month</span>
                </div>
                <span className="text-white font-bold text-lg">
                  +{users.newUserThisMonth}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">Recent Active</span>
                </div>
                <span className="text-white font-bold text-lg">
                  {users.recendActive}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-slate-200">Average Points</span>
                </div>
                <span className="text-yellow-400 font-bold text-lg">
                  {users.averagePoints}
                </span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Projects & Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Status */}
          <ChartCard title="Task Management Overview">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Tasks</span>
                <span className="text-white font-bold text-xl">
                  {tasks.total}
                </span>
              </div>

              {/* Task Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-green-400">Completed</span>
                    <span className="text-sm text-white">
                      {tasks.completed}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(tasks.completed / tasks.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-blue-400">In Progress</span>
                    <span className="text-sm text-white">
                      {tasks.inProgress}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(tasks.inProgress / tasks.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-yellow-400">Pending</span>
                    <span className="text-sm text-white">{tasks.pending}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(tasks.pending / tasks.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    Completion Rate
                  </span>
                </div>
                <span className="text-white font-bold text-2xl">
                  {tasks.completionRate}%
                </span>
              </div>
            </div>
          </ChartCard>

          {/* Project Requests */}
          <ChartCard title="Project Requests">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm">Total Requests</p>
                  <p className="text-white font-bold text-2xl">
                    {requests.total}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm">Pending</p>
                  <p className="text-white font-bold text-2xl">
                    {requests.pending}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <CheckSquare className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 text-sm">Accepted</p>
                  <p className="text-white font-bold text-2xl">
                    {requests.accepted}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <UserX className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-sm">Rejected</p>
                  <p className="text-white font-bold text-2xl">
                    {requests.rejected}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm">Approval Rate</span>
                  <span className="text-white font-semibold">
                    {Math.round((requests.accepted / requests.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(requests.accepted / requests.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && adminStats && (
          <div className="mb-8">
            <ChartCard
              title="🚀 Super Admin Overview"
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <Crown className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                  <p className="text-yellow-400 font-semibold">Super Admins</p>
                  <p className="text-white font-bold text-3xl">
                    {adminStats.superAdmins || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <Shield className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-400 font-semibold">Regular Admins</p>
                  <p className="text-white font-bold text-3xl">
                    {adminStats.admins || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <Users className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                  <p className="text-purple-400 font-semibold">
                    Total Admin Team
                  </p>
                  <p className="text-white font-bold text-3xl">
                    {(adminStats.superAdmins || 0) + (adminStats.admins || 0)}
                  </p>
                </div>
              </div>
            </ChartCard>
          </div>
        )}

        {/* Quick Actions */}
        <ChartCard title="🚀 Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={()=>navigate('/admin/users')} className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-colors group">
              <Eye className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-blue-400 text-sm font-medium">
                View Users
              </span>
            </button>
            <button onClick={() => navigate('/admin/projects')} className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-colors group">
              <FolderOpen className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-purple-400 text-sm font-medium">
                Manage Projects
              </span>
            </button>
            <button onClick={()=>navigate(`/admin/tasks`)} className="flex flex-col items-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-colors group">
              <CheckSquare className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-green-400 text-sm font-medium">
                Review Tasks
              </span>
            </button>
            <button onClick={()=>navigate(`/admin/requests`)} className="flex flex-col items-center gap-2 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors group">
              <Settings className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-yellow-400 text-sm font-medium">
                Project Request
              </span>
            </button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default AdminDashboard;

// pages/admin/AdminDashboard.jsx - Fixed version
// import React, { useEffect, useState } from 'react';
// import axios from 'axios'; // Remove the duplicate import
// import {
//   Users,
//   UserCheck,
//   UserX,
//   Shield,
//   FolderOpen,
//   CheckSquare,
//   Clock,
//   AlertCircle,
//   TrendingUp,
//   Award,
//   Activity,
//   Calendar,
//   BarChart3,
//   PieChart,
//   Eye,
//   Star,
//   Target,
//   Zap,
//   Crown,
//   Database,
//   GitBranch,
//   MessageSquare,
//   Settings
// } from 'lucide-react';
// import { useAuth } from '../../../context/AuthContext';

// function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [error, setError] = useState(null);
//   const { user } = useAuth();
//   const token = user?.userWithToken?.token;

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!token) {
//         setError("Authentication token not found");
//         setLoading(false);
//         return;
//       }

//       const res = await axios.get('http://localhost:8000/api/v1/admin/dashboard', {
//         headers: {
//           authorization: `Bearer ${token}`,
//         },
//       });

//       console.log("Admin dashboard data:", res.data);
//       setDashboardData(res.data.stats);
//     } catch (err) {
//       console.error("Error fetching admin dashboard data:", err);
//       setError(err.response?.data?.msg || "Failed to fetch dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchData();
//     } else {
//       setError("No authentication token available");
//       setLoading(false);
//     }
//   }, [token]);

//   // Add safe data checking
//   const safeData = dashboardData || {
//     users: {
//       total: 0,
//       active: 0,
//       inactive: 0,
//       banned: 0,
//       newUserThisWeek: 0,
//       newUserThisMonth: 0,
//       recendActive: 0,
//       averagePoints: 0
//     },
//     projects: {
//       total: 0,
//       newThisWeek: 0
//     },
//     tasks: {
//       total: 0,
//       completed: 0,
//       inProgress: 0,
//       pending: 0,
//       completionRate: 0
//     },
//     requests: {
//       total: 0,
//       pending: 0,
//       accepted: 0,
//       rejected: 0
//     },
//     admin: {
//       superAdmins: 0,
//       admins: 0
//     }
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
//           <h2 className="text-white text-xl mt-6 font-semibold">Loading Dashboard...</h2>
//           <p className="text-slate-400 mt-2">Gathering the latest analytics</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-white text-xl mb-2 font-semibold">Dashboard Error</h2>
//           <p className="text-slate-400 mb-6">{error}</p>
//           <button
//             onClick={fetchData}
//             className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const { users, projects, tasks, requests, admin: adminStats } = safeData;
//   const userRole = user?.userWithToken?.user?.role;
//   const isSuperAdmin = userRole === 'super-admin';

//   // Safe calculation functions
//   const safePercentage = (part, total) => {
//     return total > 0 ? Math.round((part / total) * 100) : 0;
//   };

//   // Stats Cards Component
//   const StatsCard = ({ title, value, change, icon: Icon, color, bgColor, trend }) => (
//     <div className={`relative overflow-hidden rounded-2xl ${bgColor} p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg group border border-slate-700/50`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
//           <p className="text-3xl font-bold text-white">{(value || 0).toLocaleString()}</p>
//           {change && (
//             <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-blue-400'}`}>
//               <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
//               <span>{change}</span>
//             </div>
//           )}
//         </div>
//         <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//       </div>
//       <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//     </div>
//   );

//   // Progress Ring Component
//   const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = "#8b5cf6" }) => {
//     const safeProgress = Math.min(Math.max(progress || 0, 0), 100);
//     const radius = (size - strokeWidth) / 2;
//     const circumference = radius * 2 * Math.PI;
//     const strokeDasharray = `${circumference} ${circumference}`;
//     const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

//     return (
//       <div className="relative">
//         <svg className="transform -rotate-90" width={size} height={size}>
//           <circle
//             cx={size / 2}
//             cy={size / 2}
//             r={radius}
//             stroke="#334155"
//             strokeWidth={strokeWidth}
//             fill="transparent"
//           />
//           <circle
//             cx={size / 2}
//             cy={size / 2}
//             r={radius}
//             stroke={color}
//             strokeWidth={strokeWidth}
//             fill="transparent"
//             strokeDasharray={strokeDasharray}
//             strokeDashoffset={strokeDashoffset}
//             strokeLinecap="round"
//             className="transition-all duration-1000 ease-out"
//           />
//         </svg>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className="text-2xl font-bold text-white">{safeProgress}%</span>
//         </div>
//       </div>
//     );
//   };

//   // Chart Card Component
//   const ChartCard = ({ title, children, className = "" }) => (
//     <div className={`bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 ${className}`}>
//       <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//         <BarChart3 className="h-5 w-5 text-purple-400" />
//         {title}
//       </h3>
//       {children}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
//       {/* Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
//       </div>

//       <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
//                 {isSuperAdmin ? '👑 Super Admin Dashboard' : '🛡️ Admin Dashboard'}
//               </h1>
//               <p className="text-slate-400 text-lg">
//                 Welcome back! Here's what's happening with your platform today.
//               </p>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="text-right">
//                 <p className="text-sm text-slate-400">Last updated</p>
//                 <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
//               </div>
//               <button
//                 onClick={fetchData}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
//               >
//                 <Activity className="h-4 w-4" />
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatsCard
//             title="Total Users"
//             value={users.total}
//             change={`+${users.newUserThisWeek || 0} this week`}
//             icon={Users}
//             color="bg-blue-500"
//             bgColor="bg-slate-800/40 backdrop-blur-sm"
//             trend="up"
//           />
//           <StatsCard
//             title="Active Users"
//             value={users.active}
//             change={`${safePercentage(users.active, users.total)}% of total`}
//             icon={UserCheck}
//             color="bg-green-500"
//             bgColor="bg-slate-800/40 backdrop-blur-sm"
//             trend="up"
//           />
//           <StatsCard
//             title="Total Projects"
//             value={projects.total}
//             change={`+${projects.newThisWeek || 0} this week`}
//             icon={FolderOpen}
//             color="bg-purple-500"
//             bgColor="bg-slate-800/40 backdrop-blur-sm"
//             trend="up"
//           />
//           <StatsCard
//             title="Completed Tasks"
//             value={tasks.completed}
//             change={`${tasks.completionRate || 0}% completion rate`}
//             icon={CheckSquare}
//             color="bg-orange-500"
//             bgColor="bg-slate-800/40 backdrop-blur-sm"
//             trend="up"
//           />
//         </div>

//         {/* User Analytics Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
//           {/* User Status Overview */}
//           <ChartCard title="User Status Distribution" className="lg:col-span-2">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="text-center">
//                 <div className="relative inline-block">
//                   <ProgressRing
//                     progress={safePercentage(users.active, users.total)}
//                     color="#10b981"
//                   />
//                 </div>
//                 <p className="text-green-400 font-semibold mt-2">Active Users</p>
//                 <p className="text-white text-2xl font-bold">{users.active || 0}</p>
//               </div>
//               <div className="text-center">
//                 <div className="relative inline-block">
//                   <ProgressRing
//                     progress={safePercentage(users.inactive, users.total)}
//                     color="#f59e0b"
//                   />
//                 </div>
//                 <p className="text-yellow-400 font-semibold mt-2">Inactive Users</p>
//                 <p className="text-white text-2xl font-bold">{users.inactive || 0}</p>
//               </div>
//               <div className="text-center">
//                 <div className="relative inline-block">
//                   <ProgressRing
//                     progress={safePercentage(users.banned, users.total)}
//                     color="#ef4444"
//                   />
//                 </div>
//                 <p className="text-red-400 font-semibold mt-2">Banned Users</p>
//                 <p className="text-white text-2xl font-bold">{users.banned || 0}</p>
//               </div>
//             </div>
//           </ChartCard>

//           {/* User Growth */}
//           <ChartCard title="User Growth">
//             <div className="space-y-4">
//               <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <Calendar className="h-5 w-5 text-blue-400" />
//                   <span className="text-slate-300">This Week</span>
//                 </div>
//                 <span className="text-white font-bold text-lg">+{users.newUserThisWeek || 0}</span>
//               </div>
//               <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <Calendar className="h-5 w-5 text-purple-400" />
//                   <span className="text-slate-300">This Month</span>
//                 </div>
//                 <span className="text-white font-bold text-lg">+{users.newUserThisMonth || 0}</span>
//               </div>
//               <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <Activity className="h-5 w-5 text-green-400" />
//                   <span className="text-slate-300">Recent Active</span>
//                 </div>
//                 <span className="text-white font-bold text-lg">{users.recendActive || 0}</span>
//               </div>
//               <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
//                 <div className="flex items-center gap-3">
//                   <Award className="h-5 w-5 text-yellow-400" />
//                   <span className="text-slate-200">Average Points</span>
//                 </div>
//                 <span className="text-yellow-400 font-bold text-lg">{users.averagePoints || 0}</span>
//               </div>
//             </div>
//           </ChartCard>
//         </div>

//         {/* Projects & Tasks Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Task Status */}
//           <ChartCard title="Task Management Overview">
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-300">Total Tasks</span>
//                 <span className="text-white font-bold text-xl">{tasks.total || 0}</span>
//               </div>

//               {/* Task Progress Bars */}
//               <div className="space-y-3">
//                 <div>
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-sm text-green-400">Completed</span>
//                     <span className="text-sm text-white">{tasks.completed || 0}</span>
//                   </div>
//                   <div className="w-full bg-slate-700 rounded-full h-2">
//                     <div
//                       className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
//                       style={{ width: `${safePercentage(tasks.completed, tasks.total)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-sm text-blue-400">In Progress</span>
//                     <span className="text-sm text-white">{tasks.inProgress || 0}</span>
//                   </div>
//                   <div className="w-full bg-slate-700 rounded-full h-2">
//                     <div
//                       className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
//                       style={{ width: `${safePercentage(tasks.inProgress, tasks.total)}%` }}
//                     ></div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-sm text-yellow-400">Pending</span>
//                     <span className="text-sm text-white">{tasks.pending || 0}</span>
//                   </div>
//                   <div className="w-full bg-slate-700 rounded-full h-2">
//                     <div
//                       className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out"
//                       style={{ width: `${safePercentage(tasks.pending, tasks.total)}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
//                 <div className="flex items-center gap-2">
//                   <Target className="h-5 w-5 text-green-400" />
//                   <span className="text-green-400 font-semibold">Completion Rate</span>
//                 </div>
//                 <span className="text-white font-bold text-2xl">{tasks.completionRate || 0}%</span>
//               </div>
//             </div>
//           </ChartCard>

//           {/* Project Requests */}
//           <ChartCard title="Project Requests">
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-4 bg-slate-700/30 rounded-lg">
//                   <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
//                   <p className="text-slate-300 text-sm">Total Requests</p>
//                   <p className="text-white font-bold text-2xl">{requests.total || 0}</p>
//                 </div>
//                 <div className="text-center p-4 bg-slate-700/30 rounded-lg">
//                   <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
//                   <p className="text-slate-300 text-sm">Pending</p>
//                   <p className="text-white font-bold text-2xl">{requests.pending || 0}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
//                   <CheckSquare className="h-8 w-8 text-green-400 mx-auto mb-2" />
//                   <p className="text-green-400 text-sm">Accepted</p>
//                   <p className="text-white font-bold text-2xl">{requests.accepted || 0}</p>
//                 </div>
//                 <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
//                   <UserX className="h-8 w-8 text-red-400 mx-auto mb-2" />
//                   <p className="text-red-400 text-sm">Rejected</p>
//                   <p className="text-white font-bold text-2xl">{requests.rejected || 0}</p>
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-slate-300 text-sm">Approval Rate</span>
//                   <span className="text-white font-semibold">
//                     {safePercentage(requests.accepted, requests.total)}%
//                   </span>
//                 </div>
//                 <div className="w-full bg-slate-700 rounded-full h-2">
//                   <div
//                     className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
//                     style={{ width: `${safePercentage(requests.accepted, requests.total)}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </ChartCard>
//         </div>

//         {/* Super Admin Section */}
//         {isSuperAdmin && adminStats && (
//           <div className="mb-8">
//             <ChartCard title="🚀 Super Admin Overview" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="text-center p-4 bg-slate-800/50 rounded-lg">
//                   <Crown className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
//                   <p className="text-yellow-400 font-semibold">Super Admins</p>
//                   <p className="text-white font-bold text-3xl">{adminStats.superAdmins || 0}</p>
//                 </div>
//                 <div className="text-center p-4 bg-slate-800/50 rounded-lg">
//                   <Shield className="h-10 w-10 text-blue-400 mx-auto mb-3" />
//                   <p className="text-blue-400 font-semibold">Regular Admins</p>
//                   <p className="text-white font-bold text-3xl">{adminStats.admins || 0}</p>
//                 </div>
//                 <div className="text-center p-4 bg-slate-800/50 rounded-lg">
//                   <Users className="h-10 w-10 text-purple-400 mx-auto mb-3" />
//                   <p className="text-purple-400 font-semibold">Total Admin Team</p>
//                   <p className="text-white font-bold text-3xl">{(adminStats.superAdmins || 0) + (adminStats.admins || 0)}</p>
//                 </div>
//               </div>
//             </ChartCard>
//           </div>
//         )}

//         {/* Quick Actions */}
//         <ChartCard title="🚀 Quick Actions">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <button className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 hover:bg-blue-500/20 transition-colors group">
//               <Eye className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
//               <span className="text-blue-400 text-sm font-medium">View Users</span>
//             </button>
//             <button className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-colors group">
//               <FolderOpen className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
//               <span className="text-purple-400 text-sm font-medium">Manage Projects</span>
//             </button>
//             <button className="flex flex-col items-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/30 hover:bg-green-500/20 transition-colors group">
//               <CheckSquare className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform" />
//               <span className="text-green-400 text-sm font-medium">Review Tasks</span>
//             </button>
//             <button className="flex flex-col items-center gap-2 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors group">
//               <Settings className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
//               <span className="text-yellow-400 text-sm font-medium">Settings</span>
//             </button>
//           </div>
//         </ChartCard>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;
