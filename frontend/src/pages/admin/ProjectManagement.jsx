import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import adminApi from "../../services/adminApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function ProjectManagement() {
  const { user } = useAuth();
  const token = user?.userWithToken?.token;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchProjects = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await adminApi.getAllProjects({ page, limit });
      console.log("Fetched projects:", res);

      if (res.success) {
        setProjects(res.projects);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.log("err in fetching project", err);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const res = await adminApi.getProjectDetails(projectId);
      console.log("res of fetched", res);

      if (res.success) {
        setSelectedProject(res.project);
      }
    } catch (err) {
      console.log("err in fetching project details:", err);
      toast.error("Failed to fetch project details");
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7C3AED", // violet
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete these Project!",
      });
      if (result.isConfirmed) {
        const res = await adminApi.deleteProject(projectId);
        console.log("res of deleted project", res);

        if (res.success) {
          Swal.fire({
            title: "Deleted!",
            text: "these project has been deleted.",
            icon: "success",
            confirmButtonColor: "#7C3AED",
          });
          setProjects((prev) =>
            prev.filter((p) => p.id !== selectedProject.id)
          );
          setSelectedProject(null);
          fetchProjects();
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the project.",
            icon: "error",
            confirmButtonColor: "#7C3AED",
          });
        }
      }
    } catch (err) {
      console.log("err in deleting projects", err);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProjectStatus = (project) => {
    const { stats } = project;
    if (stats.totalTasks === 0) return "New";
    if (stats.taskCompletionRate === 100) return "Completed";
    if (stats.taskCompletionRate > 0) return "In Progress";
    return "Pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "In Progress":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
      case "New":
        return "bg-gradient-to-r from-purple-500 to-pink-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-slate-500 text-white";
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.owner.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      getProjectStatus(project).toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading && projects.length === 0) {
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Loading Projects
            </h3>
            <p className="text-gray-600 text-lg">Fetching project data...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Stunning Header */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Title Section */}
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-indigo-600 via-purple-700 to-blue-800 bg-clip-text text-transparent tracking-tight">
                    Project Management
                  </h1>
                  <p className="text-gray-600 text-lg flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Manage and monitor all projects across the platform
                  </p>

                  {/* Stats Overview */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-xl shadow-lg">
                      <span className="font-bold">{pagination.total || 0}</span>{" "}
                      Total Projects
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
                      <span className="font-bold">
                        {
                          filteredProjects.filter(
                            (p) => getProjectStatus(p) === "Completed"
                          ).length
                        }
                      </span>{" "}
                      Completed
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-lg">
                      <span className="font-bold">
                        {
                          filteredProjects.filter(
                            (p) => getProjectStatus(p) === "In Progress"
                          ).length
                        }
                      </span>{" "}
                      In Progress
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Project
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search projects by name or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                />
              </div>

              {/* Status Filter */}
              <div className="lg:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="new">New Projects</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchProjects(currentPage)}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredProjects.map((project, index) => (
            <div key={project._id} className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500"></div>

              {/* Project Card */}
              <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-blue-800 text-white p-4 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={project.owner?.profileImage}
                          alt={project.owner?.username}
                          className="w-8 h-8 rounded-full border-2 border-white/50"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {project.owner?.username}
                          </p>
                          <p className="text-xs text-blue-200">
                            {project.owner?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(
                        getProjectStatus(project)
                      )} shadow-lg`}
                    >
                      {getProjectStatus(project)}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">
                        {project.stats.totalTasks}
                      </div>
                      <div className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                        Total Tasks
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                      <div className="text-2xl font-bold text-green-600">
                        {project.stats.activeMembers}
                      </div>
                      <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                        Active Members
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Task Completion
                      </span>
                      <span className="text-sm font-bold text-indigo-600">
                        {project.stats.taskCompletionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${project.stats.taskCompletionRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Technologies */}
                  {project.technologies && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Technologies
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        {project.technologies || "Not specified"}
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Team Members ({project.user.length})
                    </div>
                    <div className="flex -space-x-2">
                      {project.user.slice(0, 5).map((member, idx) => (
                        <img
                          key={idx}
                          src={`https://api.dicebear.com/5.x/initials/svg?seed=${member.username}`}
                          alt={member.username}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          title={member.username}
                        />
                      ))}
                      {project.user.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                          +{project.user.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Created:</span>
                      <span className="font-semibold">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Updated:</span>
                      <span className="font-semibold">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Messages:</span>
                      <span className="font-semibold">
                        {project.messages.length}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchProjectDetails(project._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * 10, pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span>{" "}
                projects
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, idx) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(pagination.pages - 4, currentPage - 2)
                      ) + idx;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(pagination.pages, currentPage + 1))
                  }
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">
              No Projects Found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "No projects match your current filters. Try adjusting your search or filter criteria."
                : "No projects have been created yet. Create your first project to get started."}
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Create First Project
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-indigo-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100 relative">
            {/* Floating Background Elements */}
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-indigo-600/20 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            {/* Stunning Modal Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800 text-white overflow-hidden">
              {/* Premium Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-indigo-600/30"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600"></div>

              {/* Animated Background Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
              <div
                className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>

              <div className="relative z-10 p-8">
                <div className="flex justify-between items-start">
                  {/* Project Title Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      {/* Project Icon/Avatar */}
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-1 backdrop-blur-md">
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                            <span className="text-3xl font-bold text-white">
                              {selectedProject.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-white">
                            ✓
                          </span>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div>
                        <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                          {selectedProject.name}
                        </h2>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={selectedProject.owner?.profileImage}
                            alt={selectedProject.owner?.username}
                            className="w-10 h-10 rounded-full border-3 border-white/50 shadow-lg"
                          />
                          <div>
                            <p className="text-lg font-semibold text-blue-100">
                              {selectedProject.owner?.username}
                            </p>
                            <p className="text-sm text-blue-200 opacity-80">
                              Project Owner • {selectedProject.owner?.email}
                            </p>
                          </div>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                            <span className="text-sm font-bold">
                              👥 {selectedProject.user?.length || 0} Members
                            </span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                            <span className="text-sm font-bold">
                              📋 {selectedProject.tasks?.length || 0} Tasks
                            </span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                            <span className="text-sm font-bold">
                              💬 {selectedProject.messages?.length || 0}{" "}
                              Messages
                            </span>
                          </div>
                          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                            <span className="text-sm font-bold">
                              📝 {selectedProject.requests?.length || 0}{" "}
                              Requests
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-md border border-white/20 shadow-xl group"
                  >
                    <svg
                      className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
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
              </div>
            </div>

            {/* Enhanced Modal Content */}
            <div className="p-8 max-h-[calc(95vh-280px)] overflow-y-auto bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/20">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Project Overview */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Project Description & Details */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <h3 className="text-2xl font-bold flex items-center gap-3 relative z-10">
                        <span className="text-3xl">📋</span>
                        Project Overview
                      </h3>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Description */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="text-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white">
                            📄
                          </span>
                          <span>Description</span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-sm bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                          {selectedProject.description ||
                            "No description provided for this project. This project is currently in development phase."}
                        </p>
                      </div>

                      {/* Technical Stack */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="text-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl text-white">
                            🛠️
                          </span>
                          <span>Technologies Used</span>
                        </h4>
                        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm">
                          {selectedProject.technologies ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedProject.technologies
                                .split(",")
                                .map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                                  >
                                    {tech.trim()}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <span className="text-4xl mb-3 block">⚙️</span>
                              <p className="text-gray-500">
                                No technologies specified
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Technologies will be listed here once added
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Timeline */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl text-white">
                            ⏰
                          </span>
                          <span>Project Timeline</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {formatDate(selectedProject.createdAt)}
                            </div>
                            <div className="text-sm text-green-800 font-semibold">
                              Project Created
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Initial project setup
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {formatDate(selectedProject.updatedAt)}
                            </div>
                            <div className="text-sm text-blue-800 font-semibold">
                              Last Updated
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Recent activity
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* GitHub Integration */}
                      {selectedProject.github && (
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-100">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-2xl bg-gradient-to-r from-gray-700 to-slate-800 p-2 rounded-xl text-white">
                              🐙
                            </span>
                            <span>GitHub Integration</span>
                          </h4>
                          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Default Branch
                                </p>
                                <p className="text-sm text-gray-600">
                                  {selectedProject.github.defaultBranch ||
                                    "main"}
                                </p>
                              </div>
                              <div className="bg-gradient-to-r from-gray-700 to-slate-800 text-white px-4 py-2 rounded-lg shadow-md">
                                <span className="text-sm font-semibold">
                                  Connected
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Live Demo Link */}
                      {selectedProject.liveDemoLink && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-2xl bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl text-white">
                              🌐
                            </span>
                            <span>Live Demo</span>
                          </h4>
                          <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm">
                            <a
                              href={selectedProject.liveDemoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              View Live Demo
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Team & Analytics */}
                <div className="space-y-8">
                  {/* Team Members */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                        <span className="text-2xl">👥</span>
                        Team Members
                      </h3>
                      <p className="text-green-100 text-sm mt-1">
                        {selectedProject.user?.length || 0} active members
                      </p>
                    </div>

                    <div className="p-6">
                      {selectedProject.user &&
                      selectedProject.user.length > 0 ? (
                        <div className="space-y-4">
                          {selectedProject.user.map((member, idx) => (
                            <div key={idx} className="group relative">
                              {/* Member Card */}
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                                <div className="flex items-center gap-4">
                                  {/* Avatar with Ring */}
                                  <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-0.5">
                                      <img
                                        src={
                                          member.profileImage ||
                                          `https://api.dicebear.com/5.x/initials/svg?seed=${member.username}`
                                        }
                                        alt={member.username}
                                        className="w-full h-full rounded-full object-cover border-2 border-white"
                                      />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                                      <span className="text-xs text-white font-bold">
                                        •
                                      </span>
                                    </div>
                                  </div>

                                  {/* Member Info */}
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-800 text-sm">
                                      {member.username}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {member.email}
                                    </div>
                                    <div className="text-xs text-green-600 font-semibold mt-1">
                                      {idx === 0
                                        ? "👑 Project Owner"
                                        : "🔧 Team Member"}
                                    </div>
                                  </div>

                                  {/* Status Indicator */}
                                  <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👤</span>
                          </div>
                          <p className="text-gray-500 font-semibold">
                            No team members
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Invite members to start collaborating
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Analytics */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                        <span className="text-2xl">📊</span>
                        Analytics
                      </h3>
                      <p className="text-purple-100 text-sm mt-1">
                        Project insights
                      </p>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          {
                            label: "Tasks",
                            value: selectedProject.tasks?.length || 0,
                            icon: "📋",
                            color: "from-blue-500 to-cyan-600",
                          },
                          {
                            label: "Messages",
                            value: selectedProject.messages?.length || 0,
                            icon: "💬",
                            color: "from-green-500 to-emerald-600",
                          },
                          {
                            label: "Requests",
                            value: selectedProject.requests?.length || 0,
                            icon: "📝",
                            color: "from-orange-500 to-red-600",
                          },
                          {
                            label: "Members",
                            value: selectedProject.user?.length || 0,
                            icon: "👥",
                            color: "from-purple-500 to-pink-600",
                          },
                        ].map((stat, idx) => (
                          <div key={idx} className="group relative">
                            <div
                              className={`bg-gradient-to-r ${stat.color} p-4 rounded-2xl text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                            >
                              <div className="text-2xl mb-2">{stat.icon}</div>
                              <div className="text-2xl font-bold mb-1">
                                {stat.value}
                              </div>
                              <div className="text-xs opacity-90 font-medium">
                                {stat.label}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Progress Visualization */}
                      <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm">
                          Project Activity
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">
                              Completion Rate
                            </span>
                            <span className="font-bold text-indigo-600">
                              {selectedProject.tasks?.length > 0
                                ? "0%"
                                : "New Project"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: "5%" }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            Project just started - Ready for development!
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-gradient-to-r from-slate-700 to-gray-800 text-white p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                        <span className="text-2xl">⚡</span>
                        Quick Actions
                      </h3>
                    </div>

                    <div className="p-6 space-y-3">
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Project
                      </button>
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add Member
                      </button>
                      <button
                        onClick={() => deleteProject(selectedProject._id)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Archive Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;
