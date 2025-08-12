import React, { useState, useEffect } from "react";
import {
  Edit3,
  Users,
  ExternalLink,
  Github,
  Calendar,
  ChevronRight,
  Plus,
  X,
  Search,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Code,
  Globe,
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
  // const [loading, setLoading] = useState(true);
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
  console.log("user in getprojectt", user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/getproject", {
          headers: { authorization: `Bearer ${token}` },
        });
        setProjects(res.data.newproject);
        // setLoading(false);
      } catch (err) {
        setError("Failed to load projects. Please try again later.");
        console.log("err in getmyproject", err);
        // setLoading(false);
      }
    };
    fetchData();
  }, [token, loading]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/allusers", {
          headers: { authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    getUsers();
  }, [token]);

  const handleAddUser = async (projectId) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/v1/adduser`,
        { userId: newUser, projectId },
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        toast.success("User added successfully");
        const res = await axios.get("http://localhost:8000/api/v1/getproject", {
          headers: { authorization: `Bearer ${token}` },
        });
        setProjects(res.data.newproject);
      }
      setNewUser("");
      setSelectedProject(null);
    } catch (err) {
      console.log("Error in handleAddUser:", err);
      toast.error("Failed to add user");
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

  const ProjectCard = ({ project, index }) => {
    const isHovered = hoveredCard === project._id;

    return (
      <div
        className={`group relative bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden 
          border border-slate-700/50 transition-all duration-500 hover:scale-[1.02]
          hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/10
          ${isHovered ? "transform-gpu" : ""}
        `}
        onMouseEnter={() => setHoveredCard(project._id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          animationDelay: `${index * 150}ms`,
        }}
      >
        {/* Animated background gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div
            className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
            rounded-full blur-2xl transition-all duration-700
            ${isHovered ? "scale-150 opacity-30" : "opacity-20"}
          `}
          />
          <div
            className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 
            rounded-full blur-2xl animate-pulse"
          />
        </div>

        <div className="relative p-6 h-full flex flex-col ">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Link to={`/getproject/${project._id}`} className="flex-1">
              <h3
                className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 
                transition-colors duration-300 flex items-center gap-2 hover:underline"
              >
                <Code size={20} className="text-cyan-400" />
                {project.name}
              </h3>
              <p
                className="text-slate-400 text-sm line-clamp-3 group-hover:text-slate-300 
                transition-colors duration-300"
              >
                {project.description}
              </p>
            </Link>

            <button
              onClick={() => navigate(`/updateproject/${project._id}`)}
              className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm text-slate-400 
                hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-300 
                hover:scale-110 hover:rotate-12"
            >
              <Edit3 size={16} />
            </button>
          </div>

          {/* Technologies */}
          {project.technologies && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {project.technologies
                  .split(",")
                  .slice(0, 3)
                  .map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-800/50 backdrop-blur-sm text-cyan-400 text-xs 
                      rounded-lg border border-slate-600/30 hover:border-cyan-400/50 
                      transition-all duration-300 hover:scale-105"
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

          {/* Stats */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors duration-300">
                <Users size={14} />
                <span className="text-slate-300 font-medium">
                  {project.user.length} members
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors duration-300">
                <MessageSquare size={14} />
                <span className="text-slate-300">
                  {project.messages.length}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors duration-300">
                <CheckSquare size={14} />
                <span className="text-slate-300">
                  {project.task.length} tasks
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar size={12} />
                <span className="text-xs">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Team members */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">Team</span>
              <button
                onClick={() => setSelectedProject(project._id)}
                className="p-1 rounded-lg bg-slate-700/50 backdrop-blur-sm border border-dashed 
                  border-slate-600 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 
                  transition-all duration-300 hover:scale-110"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {project.user.slice(0, 5).map((member, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 
                    flex items-center justify-center text-sm font-medium text-white hover:scale-110 
                    transition-transform duration-300 border-2 border-slate-800 hover:border-cyan-400/50"
                  title={member.username}
                  style={{ marginLeft: idx > 0 ? "-8px" : "0" }}
                >
                  {member.username?.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.user.length > 5 && (
                <div
                  className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center 
                  text-xs text-slate-300 border-2 border-slate-800"
                  style={{ marginLeft: "-8px" }}
                >
                  +{project.user.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <Link
              to={`/getproject/${project._id}`}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-4 
                rounded-xl font-medium transition-all duration-300 hover:scale-105 
                hover:shadow-lg hover:shadow-cyan-400/25 flex items-center justify-center gap-2 group"
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
                className="p-3 bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:text-emerald-400 
                  rounded-xl transition-all duration-300 hover:scale-110 hover:bg-slate-700/50"
                title="Live Demo"
              >
                <Globe size={16} />
              </button>
            )}

            {project.github?.repoName && (
              <button
                onClick={() =>
                  window.open(
                    `https://github.com/${project.github.owner}/${project.github.repoName}`,
                    "_blank"
                  )
                }
                className="p-3 bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:text-white 
                  rounded-xl transition-all duration-300 hover:scale-110 hover:bg-slate-700/50"
                title="GitHub Repository"
              >
                <Github size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-purple-400/5 to-pink-400/5 
            transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    );
  };

  const UserAddModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 
        p-6 max-w-md w-full transform transition-all duration-300 scale-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="text-cyan-400" size={20} />
            <h3 className="text-xl font-bold text-white">Add Team Member</h3>
          </div>
          <button
            onClick={() => setSelectedProject(null)}
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white 
              hover:bg-slate-700/50 transition-all duration-300 hover:scale-110"
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
              className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 
                rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:outline-none 
                transition-all duration-300"
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
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-4 
                rounded-xl font-medium transition-all duration-300 hover:scale-105 
                hover:shadow-lg hover:shadow-cyan-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Member
            </button>
            <button
              onClick={() => setSelectedProject(null)}
              className="flex-1 bg-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-medium 
                hover:bg-slate-600/50 hover:text-white transition-all duration-300"
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
      <div
        className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 
        flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-16 h-16 border-4 border-slate-700 rounded-full animate-spin 
              border-t-cyan-400 border-r-purple-400"
            ></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-slate-700/30 rounded-full 
              animate-ping"
            ></div>
          </div>
          <p className="text-slate-400 animate-pulse">
            Loading your amazing projects...
          </p>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 ">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 
            bg-clip-text text-transparent mb-4 animate-gradient"
          >
            My Projects
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover and manage your incredible projects with style and
            precision
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="text-cyan-400 animate-pulse" size={20} />
            <span className="text-slate-500 text-sm">
              {Projects.length} projects ready to inspire
            </span>
            <Sparkles
              className="text-purple-400 animate-pulse delay-500"
              size={20}
            />
          </div>
        </div>

        {/* Controls */}
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
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 
                rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none 
                transition-all duration-300 hover:bg-slate-800/70"
            />
          </div>

          <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-cyan-500 text-white shadow-lg"
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
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 w-full mx-auto"
            }`}
          >
            {filteredProjects.map((project, index) => (
              <div key={project._id} className="animate-slide-up">
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
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      {selectedProject && <UserAddModal />}

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          0% {
            transform: translateY(50px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-float {
          animation: float var(--duration, 3s) ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default Getmyproject;
