import React, { useState, useEffect } from "react";
import {
  Edit3,
  Users,
  ExternalLink,
  Calendar,
  ChevronRight,
  Plus,
  X,
  Search,
  Grid3X3,
  List,
  Code,
  UserPlus,
  MessageSquare,
  CheckSquare,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useProject } from "../../context/ProjectContext";
import Loader from "./Loader";

function Getmyproject({ handleRespond }) {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newUser, setNewUser] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);

  const navigate = useNavigate();
  const { Projects } = useProject();
  console.log("Projects in Getmyproject=>", Projects);
  const { user, loading } = useAuth();
  const token = user?.userWithToken?.token;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token || loading) return;

        // Using context projects instead of API call for better performance
        console.log("Using context projects for better performance");
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Failed to load projects. Please try again later.");
      }
    };
    fetchData();
  }, [token, loading]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        if (!token) return;
        const res = await axios.get("http://localhost:8000/api/v1/allusers", {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.allusers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    getUsers();
  }, [token]);

  const handleAddUser = async (projectId) => {
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/v1/project/${projectId}/adduser`,
        { userId: newUser },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success("User added successfully!");
        setSelectedProject(null);
        setNewUser("");
      }
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error("Failed to add user. Please try again.");
    }
  };

  const filteredProjects = Projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Optimized ProjectCard with minimal animations for performance
  const ProjectCard = ({ project, index }) => {
    return (
      <div
        className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50"
        onMouseEnter={() => setHoveredCard(project._id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Simplified background effect for better performance */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Link to={`/getproject/${project._id}`} className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300 flex items-center gap-2 hover:underline truncate">
                <Code size={20} className="text-purple-400 flex-shrink-0" />
                <span className="truncate">{project.name}</span>
              </h3>
              <p className="text-slate-300 text-sm line-clamp-3 group-hover:text-slate-200 transition-colors duration-300">
                {project.description || "No description available"}
              </p>
            </Link>

            <button
              onClick={() => navigate(`/updateproject/${project._id}`)}
              className="ml-4 p-2 rounded-xl bg-slate-700/50 text-slate-400 hover:text-purple-300 hover:bg-slate-600/50 transition-all duration-300 hover:scale-110 flex-shrink-0"
            >
              <Edit3 size={16} />
            </button>
          </div>

          {/* Technologies - Simplified */}
          {project.technologies && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {project.technologies
                  .split(",")
                  .slice(0, 3)
                  .map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-700/50 text-purple-300 text-xs rounded-lg border border-slate-600/30 transition-colors duration-300"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                {project.technologies.split(",").length > 3 && (
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-lg">
                    +{project.technologies.split(",").length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats - Simplified grid layout */}
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Users size={14} className="text-purple-400" />
              <span className="text-slate-300 font-medium">
                {project.user.length} members
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare size={14} className="text-blue-400" />
              <span className="text-slate-300">
                {project.messages.length} messages
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckSquare size={14} className="text-green-400" />
              <span className="text-slate-300">
                {project.task.length} tasks
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={12} className="text-pink-400" />
              <span className="text-xs text-slate-300">{formatDate(project.updatedAt)}</span>
            </div>
          </div>

          {/* Team members - Optimized */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-300 font-medium">Team</span>
              <button
                onClick={() => setSelectedProject(project._id)}
                className="p-1.5 rounded-lg bg-slate-700/50 border border-dashed border-slate-600 hover:border-purple-400 text-slate-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {project.user.slice(0, 5).map((member, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-medium text-white hover:scale-110 transition-transform duration-300 border-2 border-slate-800"
                  title={member.username}
                  style={{ marginLeft: idx > 0 ? "-8px" : "0" }}
                >
                  {member.username?.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.user.length > 5 && (
                <div
                  className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 border-2 border-slate-800"
                  style={{ marginLeft: "-8px" }}
                >
                  +{project.user.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Actions - Simplified */}
          <div className="mt-auto flex gap-3">
            <Link
              to={`/getproject/${project._id}`}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-400/25 flex items-center justify-center gap-2 group"
            >
              Enter Project
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>

            {project.liveDemoLink && (
              <button
                onClick={() => window.open(project.liveDemoLink, "_blank")}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 hover:scale-105"
                title="View Live Demo"
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const UserAddModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="text-purple-400" size={20} />
            <h3 className="text-xl font-bold text-white">Add Team Member</h3>
          </div>
          <button
            onClick={() => setSelectedProject(null)}
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300 hover:scale-110"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select User
            </label>
            <select
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-all duration-300"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleAddUser(selectedProject)}
              disabled={!newUser}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Member
            </button>
            <button
              onClick={() => setSelectedProject(null)}
              className="flex-1 bg-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-medium hover:bg-slate-600/50 hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden font-inter">
      {/* Simplified background elements for better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            My Projects
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover and manage your incredible projects with style and precision
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-slate-500 text-sm">
              {Projects.length} projects ready to inspire
            </span>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none transition-all duration-300 hover:bg-slate-800/70"
            />
          </div>

          <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div
            className={`grid gap-6  ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}
          >
            {filteredProjects.map((project, index) => (
              <div key={project._id}>
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No projects found
            </h3>
            <p className="text-slate-500">Try adjusting your search criteria or create a new project</p>
          </div>
        )}
      </div>

      {/* User Add Modal */}
      {selectedProject && <UserAddModal />}
    </div>
  );
}

export default Getmyproject;
