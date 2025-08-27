import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import adminApi from "../../services/adminApi";
import { toast } from "react-toastify";
import { GrStatusGood } from "react-icons/gr";

// Add custom styles for amazing animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes modalSlideIn {
    from { 
      opacity: 0; 
      transform: scale(0.9) translateY(-50px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-modalSlideIn {
    animation: modalSlideIn 0.4s ease-out;
  }
  
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float-delayed 3s ease-in-out infinite 1.5s;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8b5cf6, #ec4899);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #7c3aed, #db2777);
  }
`;

function TaskManagement() {
  const { user } = useAuth();
  const token = user?.userWithToken?.token;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [openInput, setOpenInput] = useState(false);

  const fetchAllTasks = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await adminApi.getAllTasks({ page, limit });
      console.log("Fetched tasks:", res);

      if (res.success) {
        setTasks(res.tasks);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.log("Error fetching tasks:", err);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const verifyingTask = async (taskId, verified, directReason = null) => {
    try {
      const reasonToUse = directReason || reason;
      
      if (!reasonToUse.trim()) {
        toast.error("Please provide a reason for verification");
        return;
      }

      const res = await adminApi.verifyTask(taskId, verified, reasonToUse);
      console.log("res in verifying task=>", res);
      
      if (res.success) {
        toast.success(`Task ${verified ? 'verified' : 'rejected'} successfully`);
        // Refresh tasks list
        fetchAllTasks(currentPage);
        // Reset form
        setReason("");
        setOpenInput(false);
        setSelectedTask(null);
      } else {
        toast.error(res.message || "Failed to verify task");
      }
    } catch (err) {
      console.log("err in verifying the task", err);
      toast.error(err.message || "Error verifying task");
    }
  };

  const handleReason = (e) => {
    const value = e.target.value;
    setStatus(value);
    
    if (value === "verified" || value === "pending") {
      setOpenInput(true);
    } else {
      setOpenInput(false);
    }
  };

  useEffect(() => {
    fetchAllTasks(currentPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do":
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
      case "In Progress":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
      case "Completed":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "On Hold":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-slate-500 text-white";
    }
  };

  const getPriorityColor = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "bg-gradient-to-r from-red-600 to-rose-700"; // Overdue
    if (daysUntilDue <= 3) return "bg-gradient-to-r from-orange-500 to-red-600"; // Urgent
    if (daysUntilDue <= 7)
      return "bg-gradient-to-r from-yellow-500 to-orange-600"; // High
    return "bg-gradient-to-r from-green-500 to-emerald-600"; // Normal
  };

  const getAIVerificationColor = (status) => {
    switch (status) {
      case "Verified":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "Pending":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white";
      case "Rejected":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-slate-500 text-white";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="text-center relative z-10">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Loading Tasks
            </h3>
            <p className="text-gray-600 text-lg">Fetching task data...</p>
            <div className="mt-8 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add custom styles */}
      <style>{customStyles}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 backdrop-blur-xl bg-white/80 border-b border-white/20 sticky top-0 shadow-xl shadow-blue-500/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl sm:rounded-3xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Task Management
                </h1>
                <p className="text-gray-600 text-sm sm:text-lg lg:text-xl font-medium flex items-center flex-wrap">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 sm:mr-3 animate-pulse flex-shrink-0"></span>
                  <span className="truncate">Manage and oversee all project tasks</span>
                  <span className="hidden sm:inline mx-2">•</span>
                  <span className="text-xs sm:text-sm lg:text-base">{pagination.total || 0} Total Tasks</span>
                </p>
              </div>
            </div>

            {/* Enhanced View Mode Toggle */}
            <div className="flex items-center justify-center sm:justify-end">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2 flex shadow-xl">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-1 sm:space-x-2 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-1 sm:space-x-2 ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0">
            {/* Enhanced Search */}
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-0 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl focus:ring-4 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Enhanced Status Filter */}
            <div className="w-full sm:w-auto lg:w-80 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="relative block w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-0 rounded-xl sm:rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl focus:ring-4 focus:ring-purple-500/30 focus:outline-none transition-all duration-300 appearance-none cursor-pointer font-medium"
              >
                <option value="all">🎯 All Status</option>
                <option value="To Do">📋 To Do</option>
                <option value="In Progress">⚡ In Progress</option>
                <option value="Completed">✅ Completed</option>
                <option value="On Hold">⏸️ On Hold</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 transform group-hover:scale-105 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2 truncate">Total Tasks</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {pagination.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 transform group-hover:scale-105 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2 truncate">Completed</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {tasks.filter((task) => task.status === "Completed").length}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((tasks.filter((task) => task.status === "Completed").length / (pagination.total || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 transform group-hover:scale-105 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2 truncate">In Progress</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {tasks.filter((task) => task.status === "In Progress").length}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: `${Math.min((tasks.filter((task) => task.status === "In Progress").length / (pagination.total || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl sm:rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 transform group-hover:scale-105 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-1 sm:mb-2 truncate">Overdue</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {tasks.filter((task) => new Date(task.dueDate) < new Date()).length}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((tasks.filter((task) => new Date(task.dueDate) < new Date()).length / (pagination.total || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-lg border border-gray-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              No Tasks Found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters to find tasks."
                : "No tasks have been created yet."}
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="group relative">
                    {/* Magical Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-700 animate-pulse"></div>
                    
                    <div 
                      onClick={() => setSelectedTask(task)}
                      className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/30 transform group-hover:scale-105 transition-all duration-500 hover:shadow-purple-500/25 cursor-pointer overflow-hidden"
                    >
                      {/* Floating Status Badge */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                        <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl backdrop-blur-sm ${getStatusColor(task.status)} `}>
                          <span className="ml-1 truncate">{task.status}</span>
                        </span>
                      </div>

                      {/* Priority Indicator */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getPriorityColor(task.dueDate)} shadow-lg animate-pulse`}></div>
                      </div>

                      {/* Header */}
                      <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-500 line-clamp-2">
                          {task.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {task.description}
                        </p>
                      </div>

                      {/* Enhanced Project Info */}
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50/70 to-purple-50/70 rounded-xl sm:rounded-2xl border border-blue-200/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">{task.projectId?.name || 'No Project'}</p>
                            <p className="text-gray-500 text-xs">Project workspace</p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Assigned Users */}
                      <div className="mb-4 sm:mb-6">
                        <p className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                          Team Members
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {task.assignedTo?.slice(0, 3).map((user, index) => (
                            <div key={index} className="group/user relative">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur opacity-50 group-hover/user:opacity-100 transition duration-300"></div>
                              <div className="relative flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-md">
                                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {user.username?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate max-w-16 sm:max-w-none">{user.username}</span>
                              </div>
                            </div>
                          ))}
                          {task.assignedTo?.length > 3 && (
                            <div className="relative flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-md">
                              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  +{task.assignedTo.length - 3}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Task Meta */}
                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-yellow-50/70 to-orange-50/70 rounded-lg sm:rounded-xl border border-yellow-200/30">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">Due: {formatDate(task.dueDate)}</span>
                          </div>
                        </div>

                        {/* Verification Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-lg ${task.isVerifiedByOwner ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-gray-300 to-gray-500"}`}></div>
                            <span className="text-xs font-medium text-gray-600">Owner Verified</span>
                          </div>
                          <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-md ${getAIVerificationColor(task.Proofsubmission?.aiverified)}`}>
                            AI: {task.Proofsubmission?.aiverified || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Floating particles effect */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full opacity-50 animate-ping"></div>
                      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 w-1 h-1 bg-pink-400 rounded-full opacity-40 animate-pulse"></div>
                      <div className="absolute top-1/2 right-6 sm:right-8 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full opacity-30 animate-bounce"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Enhanced List Header - Hidden on mobile for better UX */}
                <div className="relative mb-6 sm:mb-8 hidden md:block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-2xl sm:rounded-3xl blur opacity-30"></div>
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-200/50">
                      <div className="grid grid-cols-12 gap-4 text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider">
                        <div className="col-span-3 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Task Details
                        </div>
                        <div className="col-span-2 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Project
                        </div>
                        <div className="col-span-2 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                          Team
                        </div>
                        <div className="col-span-1 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Status
                        </div>
                        <div className="col-span-2 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due Date
                        </div>
                        <div className="col-span-2 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verification
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced List Items */}
                <div className="space-y-3 sm:space-y-4">
                  {filteredTasks.map((task, index) => (
                    <div key={task._id} className="group relative">
                      {/* Hover glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-50 transition duration-500"></div>
                      
                      <div 
                        onClick={() => setSelectedTask(task)}
                        className="relative bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 cursor-pointer transform group-hover:scale-[1.02] group-hover:shadow-purple-500/25"
                      >
                        {/* Mobile Layout */}
                        <div className="block md:hidden space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-500 text-sm line-clamp-2">
                                  {task.title}
                                </h3>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg flex-shrink-0 ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 line-clamp-2 ml-13">
                            {task.description}
                          </p>

                          {/* Project & Team Row */}
                          <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <span className="text-xs font-semibold text-blue-800 truncate">{task.projectId?.name || 'No Project'}</span>
                            </div>
                            
                            <div className="flex -space-x-1">
                              {task.assignedTo?.slice(0, 2).map((user, userIndex) => (
                                <div key={userIndex} className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                                  <span className="text-white text-xs font-bold">
                                    {user.username?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              ))}
                              {task.assignedTo?.length > 2 && (
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center border border-white shadow-sm">
                                  <span className="text-white text-xs font-bold">
                                    +{task.assignedTo.length - 2}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Due Date & Verification Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-700">
                                {formatDate(task.dueDate)}
                              </span>
                              <div className={`w-2 h-2 rounded-full shadow-sm ${getPriorityColor(task.dueDate)} animate-pulse`}></div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full shadow-sm ${task.isVerifiedByOwner ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-gray-300 to-gray-500"}`}></div>
                              <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${getAIVerificationColor(task.Proofsubmission?.aiverified)}`}>
                                AI: {task.Proofsubmission?.aiverified || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                          {/* Task Details */}
                          <div className="col-span-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-500 truncate">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Project */}
                          <div className="col-span-2">
                            <div className="group/project relative">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl blur opacity-20 group-hover/project:opacity-60 transition duration-300"></div>
                              <div className="relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl px-4 py-2 border border-blue-200/50">
                                <span className="text-sm font-bold text-blue-800 truncate block">{task.projectId?.name || 'No Project'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Team */}
                          <div className="col-span-2">
                            <div className="flex -space-x-2">
                              {task.assignedTo?.slice(0, 3).map((user, userIndex) => (
                                <div key={userIndex} className="group/user relative">
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur opacity-50 group-hover/user:opacity-100 transition duration-300"></div>
                                  <div
                                    className="relative w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg transform group-hover/user:scale-110 transition duration-300"
                                    title={user.username}
                                  >
                                    <span className="text-white text-xs font-bold">
                                      {user.username?.charAt(0)?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {task.assignedTo?.length > 3 && (
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                  <span className="text-white text-xs font-bold">
                                    +{task.assignedTo.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>

                          {/* Due Date */}
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg px-3 py-2 border border-yellow-200/50">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700 truncate">
                                  {formatDate(task.dueDate)}
                                </span>
                              </div>
                              <div className={`w-3 h-3 rounded-full shadow-lg ${getPriorityColor(task.dueDate)} animate-pulse`}></div>
                            </div>
                          </div>

                          {/* Verification */}
                          <div className="col-span-2">
                            <div className="flex items-center justify-between space-x-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full shadow-lg ${task.isVerifiedByOwner ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-gray-300 to-gray-500"} animate-pulse`}></div>
                                <span className="text-xs font-medium text-gray-600">Owner</span>
                              </div>
                              <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow-md ${getAIVerificationColor(task.Proofsubmission?.aiverified)}`}>
                                AI: {task.Proofsubmission?.aiverified || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Enhanced Magical Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 sm:mt-10 lg:mt-12 relative">
            {/* Glow background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl sm:rounded-3xl blur opacity-20"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Results Info */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base lg:text-lg font-black text-gray-800">
                      Showing <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{(currentPage - 1) * pagination.limit + 1}</span> to{" "}
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of{" "}
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{pagination.total}</span> tasks
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Navigate through your task management paradise</p>
                  </div>
                </div>

                {/* Enhanced Pagination Controls */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </div>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`group relative overflow-hidden w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-500 transform hover:scale-110 shadow-lg ${
                            currentPage === page
                              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-purple-500/50"
                              : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative">{page}</span>
                          {currentPage === page && (
                            <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))}
                    disabled={currentPage === pagination.pages}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center">
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 sm:mt-6 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: `${(currentPage / pagination.pages) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Amazing Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
          {/* Modal Container */}
          <div className="relative w-full max-w-6xl max-h-[98vh] sm:max-h-[95vh] my-2 sm:my-0 animate-modalSlideIn">
            {/* Magical Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl sm:rounded-3xl blur opacity-50 animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
              {/* Enhanced Header */}
              <div className="relative bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Floating Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full blur-xl animate-float"></div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full blur-xl animate-float-delayed"></div>
                  <div className="absolute top-1/2 left-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/15 rounded-full blur-xl animate-bounce"></div>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 min-w-0 flex-1">
                    <div className="relative group flex-shrink-0">
                      <div className="absolute -inset-1 bg-white/30 rounded-xl sm:rounded-2xl blur"></div>
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg line-clamp-2">
                        {selectedTask.title}
                      </h2>
                      <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium flex items-center">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 sm:mr-3 animate-pulse flex-shrink-0"></span>
                        <span className="truncate">Task Management & Verification Dashboard</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="group relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="max-h-[calc(98vh-120px)] sm:max-h-[calc(95vh-120px)] overflow-y-auto custom-scrollbar">
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* Status Overview Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider truncate">Status</p>
                            <p className={`text-sm sm:text-base lg:text-lg font-black ${getStatusColor(selectedTask.status)} bg-clip-text text-transparent truncate`}>
                              {selectedTask.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider truncate">Due Date</p>
                            <p className="text-sm sm:text-base lg:text-lg font-black text-gray-800 truncate">
                              {formatDate(selectedTask.dueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider truncate">Team Size</p>
                            <p className="text-sm sm:text-base lg:text-lg font-black text-gray-800 truncate">
                              {selectedTask.assignedTo?.length || 0} Members
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                          <div className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${getPriorityColor(selectedTask.dueDate)}`}>
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider truncate">Priority</p>
                            <p className="text-sm sm:text-base lg:text-lg font-black text-gray-800 truncate">
                              {new Date(selectedTask.dueDate) < new Date() ? 'Overdue' : 
                               Math.ceil((new Date(selectedTask.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 3 ? 'High' :
                               Math.ceil((new Date(selectedTask.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 7 ? 'Medium' : 'Normal'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left Column - Task Details */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                      {/* Description */}
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/30">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                              </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              Task Description
                            </h3>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/30">
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                              {selectedTask.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Project Information */}
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/30">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              Project Information
                            </h3>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200/30">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg sm:text-xl font-black text-gray-800 mb-2 truncate">
                                  {selectedTask.projectId?.name || 'No Project Assigned'}
                                </h4>
                                <p className="text-gray-600 font-medium text-sm sm:text-base">
                                  Project ID: <span className="font-mono text-xs sm:text-sm bg-white/60 px-2 py-1 rounded break-all">{selectedTask.projectId?._id || 'N/A'}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/30">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              Team Members
                            </h3>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200/30">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {selectedTask.assignedTo?.map((user, index) => (
                                <div key={index} className="group/member relative">
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg sm:rounded-xl blur opacity-30 group-hover/member:opacity-60 transition duration-300"></div>
                                  <div className="relative flex items-center space-x-3 sm:space-x-4 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                      <span className="text-white font-bold text-sm sm:text-lg">
                                        {user.username?.charAt(0)?.toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{user.username}</p>
                                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Verification Panel */}
                    <div className="lg:col-span-1 space-y-6 sm:space-y-8">
                      {/* Amazing Verification Panel */}
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl sm:rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/30">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              Verification Panel
                            </h3>
                          </div>

                          {/* Current Status */}
                          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                            <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200/30">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <span className="text-gray-600 font-semibold text-sm sm:text-base">Owner Verification</span>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${selectedTask.isVerifiedByOwner ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-gray-300 to-gray-500"} animate-pulse`}></div>
                                  <span className={`font-bold text-xs sm:text-sm ${selectedTask.isVerifiedByOwner ? "text-green-600" : "text-gray-600"}`}>
                                    {selectedTask.isVerifiedByOwner ? "✅ Verified" : "⏳ Pending"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-semibold text-sm sm:text-base">AI Verification</span>
                                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${getAIVerificationColor(selectedTask.Proofsubmission?.aiverified)}`}>
                                  {selectedTask.Proofsubmission?.aiverified || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Verification Actions */}
                          <div className="space-y-4 sm:space-y-6">
                            <div>
                              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                                🎯 Select Verification Action
                              </label>
                              <select
                                onChange={handleReason}
                                value={status}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 font-semibold text-gray-800 text-sm sm:text-base"
                              >
                                <option value="">-- Select Action --</option>
                                <option value="verified">✅ Verify Task</option>
                                <option value="pending">⏸️ Set Pending</option>
                              </select>
                            </div>

                            {/* Reason Input */}
                            {openInput && (
                              <div className="relative animate-slideDown">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/40">
                                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                                    📝 Verification Reason
                                  </label>
                                  <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={`Enter detailed reason for ${status === "verified" ? "verifying" : "setting pending"} this task...`}
                                    className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-emerald-200/50 bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 resize-none text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                                    rows={4}
                                  />
                                  
                                  {/* Action Button */}
                                  <div className="mt-4 sm:mt-6">
                                    <button
                                      onClick={() => verifyingTask(selectedTask._id, status === "verified")}
                                      disabled={!reason.trim()}
                                      className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-500 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 transform hover:scale-105 hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                      <div className="relative flex items-center justify-center space-x-2 sm:space-x-3">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm sm:text-base lg:text-lg">
                                          {status === "verified" ? "✨ Verify Task" : "⏸️ Set Pending"}
                                        </span>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Task Metadata */}
                      <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/30">
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                              Metadata
                            </h3>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-200/30 space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-indigo-200/50">
                              <span className="text-gray-600 font-semibold text-sm sm:text-base">Task ID</span>
                              <span className="font-mono text-xs sm:text-sm bg-white/60 px-2 sm:px-3 py-1 rounded-lg text-gray-800 break-all">
                                {selectedTask._id}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-indigo-200/50">
                              <span className="text-gray-600 font-semibold text-sm sm:text-base">Created By</span>
                              <span className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-32 sm:max-w-none">
                                {selectedTask.user || 'System'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 font-semibold text-sm sm:text-base">Comments</span>
                              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                                {selectedTask.comment?.length || 0}
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
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default TaskManagement;
