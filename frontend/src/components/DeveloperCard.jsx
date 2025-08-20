import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  MapPin,
  Award,
  Calendar,
  Star,
  Plus,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
  Users,
  Code,
  Briefcase,
  Clock,
  Zap,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const DeveloperCard = ({ dev, devkey }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Your existing useAuth and token logic
  const { user } = useAuth();
  const userWithToken = user?.userWithToken;
  const token = userWithToken?.token;

  const defaultOptions = {
    reverse: false,
    max: 25,
    perspective: 1200,
    scale: 1.07,
    speed: 800,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.17,.67,.83,.67)",
    glare: true,
    "max-glare": 0.3,
  };

  // Enhanced modal positioning
  useEffect(() => {
    if (isModalOpen && buttonRef.current && modalRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const modalHeight = modalRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // More intelligent positioning
      if (spaceBelow < modalHeight + 20 && spaceAbove > modalHeight + 20) {
        setOpenAbove(true);
      } else {
        setOpenAbove(false);
      }
    }
  }, [isModalOpen]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Your existing fetch projects logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/getprofile", {
          headers: { authorization: `Bearer ${token}` },
        });
        console.log("project in dev=>", res.data.userdata.profile?.projects);
        setProjects(res.data.userdata.profile?.projects);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToProject = async (projectId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED", // violet
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, send request!",
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.post(
          `http://localhost:8000/api/v1/request`,
          { receiverId: dev._id, projectId },
          {
            headers: { authorization: `Bearer ${token}` },
          }
        );

        console.log("res in handleadd project", res.data);

        Swal.fire({
          title: "Sent!",
          text: "Your request has been sent.",
          icon: "success",
          confirmButtonColor: "#7C3AED",
        });

        setIsModalOpen(false);
      } catch (err) {
        console.error(
          "Error adding developer to project:",
          err.response?.data?.msg || err.message
        );
        toast.error(err.response?.data?.msg || "Something went wrong.");
      }
    }
  };

  // Check if user is active (within last 10 minutes)
  const isActive = () => {
    if (!dev?.profile?.activeat) return false;
    const lastActive = new Date(dev.profile.activeat);
    const now = new Date();
    const diffInMinutes = (now - lastActive) / 60000;
    return diffInMinutes <= 10;
  };

  // Calculate average response time in a readable format
  const getAverageResponseTime = () => {
    if (!dev?.profile?.responseTimes?.length) return "N/A";
    const avg =
      dev.profile.responseTimes.reduce((a, b) => a + b, 0) /
      dev.profile.responseTimes.length;
    if (avg < 60000) return `${Math.round(avg / 1000)}s`;
    if (avg < 3600000) return `${Math.round(avg / 60000)}m`;
    return `${Math.round(avg / 3600000)}h`;
  };

  // Get reliability score color with enhanced styling
  const getReliabilityColor = (score) => {
    if (score >= 80)
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    if (score >= 60)
      return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };

  // Social media icons mapping
  const socialIcons = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
    facebook: Facebook,
  };
  console.log("project in dev=>", projects);

  return (
    <div
      className={`
        relative group overflow-hidden
        bg-gradient-to-br from-slate-800/95 via-slate-900/90 to-black/95
        backdrop-blur-2xl border-2 border-transparent
        bg-clip-padding
        before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br 
        before:from-cyan-400/20 before:via-blue-500/20 before:to-purple-500/20 
        before:p-[2px] before:rounded-3xl 
        before:content-['']
        rounded-3xl 
        p-4 sm:p-6 md:p-8 lg:p-10
        w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 
        mx-auto my-4 sm:my-6
        shadow-[0_8px_32px_rgba(6,182,212,0.12),0_0_0_1px_rgba(6,182,212,0.05)]
        hover:shadow-[0_20px_60px_rgba(6,182,212,0.25),0_0_0_1px_rgba(6,182,212,0.1)]
        transition-all duration-700 ease-out
        hover:scale-[1.02] sm:hover:scale-[1.03] hover:-translate-y-2
        ${isHovered ? "transform-gpu" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-16 -right-16 w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute -bottom-16 -left-16 w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 lg:w-40 h-24 sm:h-32 lg:h-40 bg-gradient-to-br from-indigo-400/5 to-cyan-400/5 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Premium Floating Elements */}
      <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 flex gap-1.5 sm:gap-2">
        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
        <div
          className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full animate-ping opacity-75"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-400 rounded-full animate-ping opacity-75"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Top Section: Enhanced Image + Info */}
      <div
        key={devkey}
        className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8 relative mb-6 sm:mb-8 lg:mb-10"
      >
        {/* Premium Avatar with Multiple Effects */}
        <div className="relative shrink-0 mb-2 lg:mb-0">
          {/* Outer glow ring */}
          <div className="absolute -inset-2 sm:-inset-3 lg:-inset-4 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Main animated ring */}
          <div
            className={`
            absolute inset-0 rounded-full 
            bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400
            transition-all duration-700
            ${
              isHovered
                ? "animate-spin scale-110 opacity-100"
                : "scale-105 opacity-80"
            }
          `}
            style={{ padding: "3px" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900"></div>
          </div>

          <img
            src={dev?.profile?.avatar || dev?.profileImage}
            alt="Avatar"
            className="relative w-20 sm:w-24 lg:w-28 xl:w-32 h-20 sm:h-24 lg:h-28 xl:h-32 rounded-full object-cover z-10 border-2 border-slate-700/50"
          />

          {/* Enhanced Active Status */}
          {isActive() && (
            <div className="absolute -bottom-1 -right-1 z-20">
              <div className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 sm:border-3 border-slate-900 flex items-center justify-center shadow-lg shadow-emerald-400/50">
                <div className="w-1.5 sm:w-2 lg:w-2.5 h-1.5 sm:h-2 lg:h-2.5 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></div>
            </div>
          )}

          {/* Premium Reliability Score Badge */}
          {typeof dev?.profile?.reliabilityScore == "number" && (
            <div
              className={`
              absolute -top-2 sm:-top-3 lg:-top-4 -right-6 sm:-right-8 lg:-right-10 
              px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 
              rounded-full text-xs sm:text-sm font-bold
              ${getReliabilityColor(dev.profile.reliabilityScore)}
              border backdrop-blur-sm
              flex items-center gap-1 sm:gap-1.5 lg:gap-2 shadow-lg
            `}
            >
              <Zap className="w-2.5 sm:w-3 lg:w-3.5 h-2.5 sm:h-3 lg:h-3.5" />
              <span>{dev.profile.reliabilityScore}</span>
            </div>
          )}
        </div>

        {/* Enhanced Info Section */}
        <div className="flex-1 text-center lg:text-left w-full px-2 sm:px-0">
          <div className="relative mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent break-words leading-tight">
              {dev.username}
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 rounded-full"></div>
          </div>

          {dev.email && (
            <p className="text-sm sm:text-base lg:text-lg text-slate-400 break-words mb-4 sm:mb-5 lg:mb-6 flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
              <Mail className="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5 shrink-0" />
              <span className="truncate">{dev.email}</span>
            </p>
          )}

          {dev?.profile?.bio && (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5 sm:mb-6 lg:mb-8 bg-slate-800/30 rounded-xl p-3 sm:p-4 lg:p-5 border border-slate-700/30 backdrop-blur-sm shadow-inner">
              {dev.profile.bio}
            </p>
          )}

          {/* Premium Stats Grid */}
          {(dev?.profile?.experience || dev?.profile?.education) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 text-xs sm:text-sm">
              {dev?.profile?.experience && (
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-slate-600/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                  <div className="text-cyan-400 font-semibold flex items-center gap-2 sm:gap-3 mb-2">
                    <Award className="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Experience</span>
                  </div>
                  <div className="text-slate-200 font-medium">
                    {dev.profile.experience}
                  </div>
                </div>
              )}

              {dev?.profile?.education && (
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-slate-600/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                  <div className="text-blue-400 font-semibold flex items-center gap-2 sm:gap-3 mb-2">
                    <Briefcase className="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Education</span>
                  </div>
                  <div className="text-slate-200 font-medium">
                    {dev.profile.education}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      {(dev?.profile?.responseTimes?.length > 0 ||
        dev?.profile?.weeklyLogins?.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
          {dev?.profile?.responseTimes?.length > 0 && (
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 border border-blue-400/20 backdrop-blur-sm hover:scale-105 hover:from-blue-500/20 hover:via-cyan-500/20 hover:to-blue-600/20 transition-all duration-300 group">
              <div className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
              </div>
              <div className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-1">
                {getAverageResponseTime()}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm font-medium">
                Avg Response
              </div>
            </div>
          )}

          {dev?.profile?.weeklyLogins?.length > 0 && (
            <div className="text-center p-4 sm:p-5 lg:p-6 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-600/10 border border-emerald-400/20 backdrop-blur-sm hover:scale-105 hover:from-emerald-500/20 hover:via-green-500/20 hover:to-emerald-600/20 transition-all duration-300 group">
              <div className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
              </div>
              <div className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-1">
                {dev.profile.weeklyLogins.length}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm font-medium">
                Weekly Logins
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Skills Section */}
      {dev?.profile?.skills?.length > 0 && (
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h3 className="font-bold mb-4 sm:mb-5 lg:mb-6 text-base sm:text-lg lg:text-xl text-white flex items-center gap-3 sm:gap-4">
            <div className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
              <Code className="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5 text-white" />
            </div>
            <span>Technical Skills</span>
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            {dev.profile.skills.map((skill, i) => (
              <span
                key={i}
                className={`
                  px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 
                  rounded-full text-xs sm:text-sm lg:text-base font-semibold
                  bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15
                  border border-cyan-400/25 text-cyan-100
                  hover:from-cyan-500/25 hover:via-blue-500/25 hover:to-purple-500/25
                  hover:border-cyan-300/40 hover:scale-105 sm:hover:scale-110
                  transition-all duration-300 cursor-pointer
                  backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20
                  transform hover:-translate-y-1
                `}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Premium Social Media Section */}
      {dev?.profile?.social &&
        Object.keys(dev.profile.social).some(
          (key) => dev.profile.social[key]
        ) && (
          <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
            <h4 className="text-slate-400 text-sm sm:text-base lg:text-lg font-medium mb-4 sm:mb-5 lg:mb-6">
              Connect With Me
            </h4>
            <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-5 justify-center">
              {Object.entries(dev.profile.social).map(([platform, url]) => {
                const IconComponent = socialIcons[platform];
                if (!IconComponent || !url) return null;

                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={`
                    group relative p-3 sm:p-4 lg:p-5 rounded-xl lg:rounded-2xl 
                    bg-gradient-to-r from-slate-700/40 to-slate-800/40
                    border border-slate-600/30 text-slate-400
                    hover:from-cyan-500/20 hover:to-blue-500/20
                    hover:border-cyan-300/40 hover:scale-110 hover:text-cyan-300
                    transition-all duration-300 backdrop-blur-sm
                    shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1
                  `}
                  >
                    <IconComponent className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 rounded-xl lg:rounded-2xl transition-all duration-300"></div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

      {/* Premium CTA Button */}
      <div className="relative mt-4 sm:mt-6 lg:mt-8">
        <button
          ref={buttonRef}
          onClick={() => setIsModalOpen(!isModalOpen)}
          className={`
            w-full py-4 sm:py-5 lg:py-6 px-6 sm:px-8 lg:px-10 
            rounded-2xl lg:rounded-3xl font-bold text-white
            bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
            hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600
            shadow-[0_8px_30px_rgba(6,182,212,0.3)]
            hover:shadow-[0_12px_40px_rgba(6,182,212,0.4)]
            hover:scale-[1.02] hover:-translate-y-1
            transition-all duration-300
            flex items-center justify-center gap-3 sm:gap-4
            relative overflow-hidden group
            border border-cyan-400/20 text-base sm:text-lg lg:text-xl
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Users className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10 font-semibold">Collaborate Now</span>
          <Plus className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Premium Enhanced Modal */}
        {/* {isModalOpen && (
          <>
            <div 
              className="fixed inset-0  backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            <div
              ref={modalRef}
              className={`          
                absolute z-50 lg:w-80 w-60 max-h-96 overflow-y-auto
                bg-gradient-to-br from-slate-800/98 via-slate-900/95 to-black/98
                backdrop-blur-2xl border-2 border-cyan-400/20
                rounded-3xl shadow-[0_20px_60px_rgba(6,182,212,0.3)]
                ${openAbove ? "bottom-full mb-4" : "mt-4"} 
                left-1/2 transform -translate-x-1/2
                animate-in slide-in-from-bottom-4 duration-300
              `}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    Choose Project
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 text-sm">Loading projects...</p>
                  </div>
                ) : projects?.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="group bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/30 rounded-2xl p-4 hover:from-slate-700/60 hover:to-slate-800/60 hover:border-cyan-400/30 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm mb-1">{project.name}</h3>
                            <p className="text-slate-400 text-xs">Click to add developer</p>
                          </div>
                          <button
                            onClick={() => handleAddToProject(project._id)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold text-sm hover:scale-105 shadow-lg"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium">No projects available</p>
                    <p className="text-slate-500 text-sm mt-1">Create a project to get started</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )} */}
        {isModalOpen && (
          <>
            {/* Background overlay */}
            <div
              className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal container */}
            <div
              ref={modalRef}
              className={`
        fixed z-50
        w-[95%] sm:w-[90%] md:w-96 lg:w-[26rem] xl:w-[28rem]
        max-h-[85vh] overflow-y-auto
        bg-gradient-to-br from-slate-800/98 via-slate-900/95 to-black/98
        backdrop-blur-2xl border-2 border-cyan-400/20
        rounded-3xl shadow-[0_20px_60px_rgba(6,182,212,0.3)]
        left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
        animate-in slide-in-from-bottom-4 duration-300
      `}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3 sm:gap-4">
                    <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                      <Plus className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
                    </div>
                    <span>Choose Project</span>
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 sm:p-3 lg:p-4 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7" />
                  </button>
                </div>

                {/* Loading state */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
                    <div className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4 sm:mb-6"></div>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
                      Loading projects...
                    </p>
                  </div>
                ) : projects?.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="group bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/30 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 hover:from-slate-700/60 hover:to-slate-800/60 hover:border-cyan-400/30 transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                              {project.name}
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm">
                              Click to add developer
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToProject(project._id)}
                            className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl lg:rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold text-sm sm:text-base hover:scale-105 shadow-lg w-full sm:w-auto"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16 lg:py-20">
                    <div className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-slate-700/50 rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Briefcase className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium text-base sm:text-lg lg:text-xl mb-2">
                      No projects available
                    </p>
                    <p className="text-slate-500 text-sm sm:text-base">
                      Create a project to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
        
        /* Custom animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
          }
        }
        
        /* Additional responsive improvements */
        @media (max-width: 640px) {
          .mobile-padding {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        /* Enhanced focus states for accessibility */
        button:focus-visible {
          outline: 2px solid rgba(6, 182, 212, 0.5);
          outline-offset: 2px;
        }
        
        /* Improved touch targets for mobile */
        @media (max-width: 768px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
    //  <div className="min-h-screen bg-slate-900 p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
    //   <div
    //     className={`
    //       relative group overflow-hidden
    //       bg-gradient-to-br from-slate-800/95 via-slate-900/90 to-black/95
    //       backdrop-blur-2xl border-2 border-transparent
    //       bg-clip-padding
    //       before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br
    //       before:from-cyan-400/20 before:via-blue-500/20 before:to-purple-500/20
    //       before:p-[2px] before:rounded-3xl
    //       before:content-['']
    //       rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto
    //       shadow-[0_8px_32px_rgba(6,182,212,0.12),0_0_0_1px_rgba(6,182,212,0.05)]
    //       hover:shadow-[0_20px_60px_rgba(6,182,212,0.25),0_0_0_1px_rgba(6,182,212,0.1)]
    //       transition-all duration-700 ease-out
    //       hover:scale-[1.02] md:hover:scale-[1.03] hover:-translate-y-1 md:hover:-translate-y-2
    //       ${isHovered ? 'transform-gpu' : ''}
    //     `}
    //     onMouseEnter={() => setIsHovered(true)}
    //     onMouseLeave={() => setIsHovered(false)}
    //   >
    //     {/* Enhanced Animated Background Elements */}
    //     <div className="absolute inset-0 overflow-hidden rounded-3xl">
    //       <div className="absolute -top-8 sm:-top-16 -right-8 sm:-right-16 w-20 sm:w-40 h-20 sm:h-40 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-pulse"></div>
    //       <div className="absolute -bottom-8 sm:-bottom-16 -left-8 sm:-left-16 w-20 sm:w-40 h-20 sm:h-40 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
    //       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-indigo-400/5 to-cyan-400/5 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
    //     </div>

    //     {/* Premium Floating Elements */}
    //     <div className="absolute top-3 sm:top-6 right-3 sm:right-6 flex gap-1 sm:gap-2">
    //       <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
    //       <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full animate-ping opacity-75" style={{animationDelay: '0.5s'}}></div>
    //       <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-purple-400 rounded-full animate-ping opacity-75" style={{animationDelay: '1s'}}></div>
    //     </div>

    //     {/* Top Section: Enhanced Image + Info */}
    //     <div key={devkey} className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 relative mb-6 sm:mb-8">
    //       {/* Premium Avatar with Multiple Effects */}
    //       <div className="relative shrink-0">
    //         {/* Outer glow ring */}
    //         <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>

    //         {/* Main animated ring */}
    //         <div className={`
    //           absolute inset-0 rounded-full
    //           bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400
    //           transition-all duration-700
    //           ${isHovered ? 'animate-spin scale-110 opacity-100' : 'scale-105 opacity-80'}
    //         `} style={{padding: '3px'}}>
    //           <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900"></div>
    //         </div>

    //         <img
    //           src={dev?.profile?.avatar || dev?.profileImage}
    //           alt="Avatar"
    //           className="relative w-20 sm:w-24 md:w-28 lg:w-20 xl:w-24 h-20 sm:h-24 md:h-28 lg:h-20 xl:h-24 rounded-full object-cover z-10 border-2 border-slate-700/50"
    //         />

    //         {/* Enhanced Active Status */}
    //         {isActive() && (
    //           <div className="absolute -bottom-1 -right-1 z-20">
    //             <div className="w-4 sm:w-6 h-4 sm:h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 sm:border-3 border-slate-900 flex items-center justify-center shadow-lg shadow-emerald-400/50">
    //               <div className="w-1 sm:w-2 h-1 sm:h-2 bg-white rounded-full animate-pulse"></div>
    //             </div>
    //             <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></div>
    //           </div>
    //         )}

    //         {/* Premium Reliability Score Badge */}
    //         {typeof dev?.profile?.reliabilityScore=="number" && (
    //           <div className={`
    //             absolute -top-2 sm:-top-3 -right-6 sm:-right-8 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold
    //             ${getReliabilityColor(dev.profile.reliabilityScore)}
    //             border backdrop-blur-sm
    //             flex items-center gap-1 sm:gap-1.5 shadow-lg
    //           `}>
    //             <Zap className="w-2 sm:w-3 h-2 sm:h-3" />
    //             <span className="text-xs">{dev.profile.reliabilityScore}</span>
    //           </div>
    //         )}
    //       </div>

    //       {/* Enhanced Info Section */}
    //       <div className="flex-1 text-center lg:text-left w-full">
    //         <div className="relative">
    //           <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent break-words mb-2 leading-tight">
    //             {dev.username}
    //           </h2>
    //           <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 rounded-full"></div>
    //         </div>

    //         {dev.email && (
    //           <p className="text-xs sm:text-sm text-slate-400 break-words mb-2 sm:mb-3 flex items-center gap-2 justify-center lg:justify-start">
    //             <Mail className="w-3 h-3 shrink-0" />
    //             <span className="truncate">{dev.email}</span>
    //           </p>
    //         )}

    //         {dev?.profile?.bio && (
    //           <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3 sm:mb-4 bg-slate-800/30 rounded-lg p-2 sm:p-3 border border-slate-700/30">
    //             {dev.profile.bio}
    //           </p>
    //         )}

    //         {/* Premium Stats Grid */}
    //         {(dev?.profile?.experience || dev?.profile?.education) && (
    //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 text-xs">
    //             {dev?.profile?.experience && (
    //               <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-2 sm:p-3 border border-slate-600/30 backdrop-blur-sm">
    //                 <div className="text-cyan-400 font-semibold flex items-center gap-1 sm:gap-2 mb-1">
    //                   <Award className="w-2 sm:w-3 h-2 sm:h-3" />
    //                   <span className="text-xs">Experience</span>
    //                 </div>
    //                 <div className="text-slate-200 font-medium text-xs sm:text-sm">{dev.profile.experience}</div>
    //               </div>
    //             )}

    //             {dev?.profile?.education && (
    //               <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-2 sm:p-3 border border-slate-600/30 backdrop-blur-sm">
    //                 <div className="text-blue-400 font-semibold flex items-center gap-1 sm:gap-2 mb-1">
    //                   <Briefcase className="w-2 sm:w-3 h-2 sm:h-3" />
    //                   <span className="text-xs">Education</span>
    //                 </div>
    //                 <div className="text-slate-200 font-medium text-xs sm:text-sm">{dev.profile.education}</div>
    //               </div>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     </div>

    //     {/* Enhanced Performance Metrics */}
    //     {(dev?.profile?.responseTimes?.length > 0 || dev?.profile?.weeklyLogins?.length > 0) && (
    //       <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
    //         {dev?.profile?.responseTimes?.length > 0 && (
    //           <div className="text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 border border-blue-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
    //             <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
    //               <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
    //             </div>
    //             <div className="text-white font-bold text-sm sm:text-lg">{getAverageResponseTime()}</div>
    //             <div className="text-slate-400 text-xs font-medium">Avg Response</div>
    //           </div>
    //         )}

    //         {dev?.profile?.weeklyLogins?.length > 0 && (
    //           <div className="text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-600/10 border border-emerald-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
    //             <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
    //               <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
    //             </div>
    //             <div className="text-white font-bold text-sm sm:text-lg">{dev.profile.weeklyLogins.length}</div>
    //             <div className="text-slate-400 text-xs font-medium">Weekly Logins</div>
    //           </div>
    //         )}
    //       </div>
    //     )}

    //     {/* Premium Skills Section */}
    //     {dev?.profile?.skills?.length > 0 && (
    //       <div className="mb-6 sm:mb-8">
    //         <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base text-white flex items-center gap-2 sm:gap-3">
    //           <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
    //             <Code className="w-2 sm:w-3 h-2 sm:h-3 text-white" />
    //           </div>
    //           <span>Technical Skills</span>
    //         </h3>
    //         <div className="flex flex-wrap gap-1 sm:gap-2">
    //           {dev.profile.skills.map((skill, i) => (
    //             <span
    //               key={i}
    //               className={`
    //                 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-semibold
    //                 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15
    //                 border border-cyan-400/25 text-cyan-100
    //                 hover:from-cyan-500/25 hover:via-blue-500/25 hover:to-purple-500/25
    //                 hover:border-cyan-300/40 hover:scale-105 sm:hover:scale-110
    //                 transition-all duration-300 cursor-pointer
    //                 backdrop-blur-sm shadow-lg
    //               `}
    //             >
    //               {skill}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //     )}

    //     {/* Premium Social Media Section */}
    //     {dev?.profile?.social && Object.keys(dev.profile.social).some(key => dev.profile.social[key]) && (
    //       <div className="mb-6 sm:mb-8 text-center">
    //         <h4 className="text-slate-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">Connect With Me</h4>
    //         <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
    //           {Object.entries(dev.profile.social).map(([platform, url]) => {
    //             const IconComponent = socialIcons[platform];
    //             if (!IconComponent || !url) return null;

    //             return (
    //               <a
    //                 key={platform}
    //                 href={url}
    //                 target="_blank"
    //                 rel="noreferrer"
    //                 className={`
    //                   group relative p-2 sm:p-3 rounded-xl
    //                   bg-gradient-to-r from-slate-700/40 to-slate-800/40
    //                   border border-slate-600/30 text-slate-400
    //                   hover:from-cyan-500/20 hover:to-blue-500/20
    //                   hover:border-cyan-300/40 hover:scale-105 sm:hover:scale-110 hover:text-cyan-300
    //                   transition-all duration-300 backdrop-blur-sm
    //                   shadow-lg hover:shadow-cyan-500/20
    //                 `}
    //               >
    //                 <IconComponent className="w-4 sm:w-5 h-4 sm:h-5" />
    //                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 rounded-xl transition-all duration-300"></div>
    //               </a>
    //             );
    //           })}
    //         </div>
    //       </div>
    //     )}

    //     {/* Premium CTA Button */}
    //     <div className="relative">
    //       <button
    //         ref={buttonRef}
    //         onClick={() => setIsModalOpen(!isModalOpen)}
    //         className={`
    //           w-full py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-bold text-white
    //           bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
    //           hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600
    //           shadow-[0_8px_30px_rgba(6,182,212,0.3)]
    //           hover:shadow-[0_12px_40px_rgba(6,182,212,0.4)]
    //           hover:scale-[1.02] hover:-translate-y-1
    //           transition-all duration-300
    //           flex items-center justify-center gap-2 sm:gap-3
    //           relative overflow-hidden group
    //           border border-cyan-400/20
    //         `}
    //       >
    //         <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    //         <Users className="w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
    //         <span className="relative z-10 text-sm sm:text-lg">Collaborate Now</span>
    //         <Plus className="w-4 sm:w-5 h-4 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
    //       </button>

    //       {/* Premium Enhanced Modal */}
    //       {isModalOpen && (
    //         <>
    //           <div
    //             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
    //             onClick={() => setIsModalOpen(false)}
    //           ></div>

    //           <div
    //             ref={modalRef}
    //             className={`
    //               absolute z-50 w-72 sm:w-80 max-h-80 sm:max-h-96 overflow-y-auto
    //               bg-gradient-to-br from-slate-800/98 via-slate-900/95 to-black/98
    //               backdrop-blur-2xl border-2 border-cyan-400/20
    //               rounded-3xl shadow-[0_20px_60px_rgba(6,182,212,0.3)]
    //               ${openAbove ? "bottom-full mb-4" : "mt-4"}
    //               left-1/2 transform -translate-x-1/2
    //               animate-in slide-in-from-bottom-4 duration-300
    //             `}
    //           >
    //             <div className="p-4 sm:p-6">
    //               <div className="flex items-center justify-between mb-4 sm:mb-6">
    //                 <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
    //                   <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
    //                     <Plus className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
    //                   </div>
    //                   <span>Choose Project</span>
    //                 </h2>
    //                 <button
    //                   onClick={() => setIsModalOpen(false)}
    //                   className="p-1.5 sm:p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
    //                 >
    //                   <X className="w-4 sm:w-5 h-4 sm:h-5" />
    //                 </button>
    //               </div>

    //               {loading ? (
    //                 <div className="flex flex-col items-center justify-center py-8 sm:py-12">
    //                   <div className="w-8 sm:w-12 h-8 sm:h-12 border-2 sm:border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-3 sm:mb-4"></div>
    //                   <p className="text-slate-400 text-xs sm:text-sm">Loading projects...</p>
    //                 </div>
    //               ) : projects?.length > 0 ? (
    //                 <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar">
    //                   {projects.map((project) => (
    //                     <div
    //                       key={project._id}
    //                       className="group bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/30 rounded-2xl p-3 sm:p-4 hover:from-slate-700/60 hover:to-slate-800/60 hover:border-cyan-400/30 transition-all duration-300"
    //                     >
    //                       <div className="flex justify-between items-center gap-3">
    //                         <div className="flex-1 min-w-0">
    //                           <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 truncate">{project.name}</h3>
    //                           <p className="text-slate-400 text-xs">Click to add developer</p>
    //                         </div>
    //                         <button
    //                           onClick={() => handleAddToProject(project._id)}
    //                           className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold text-xs sm:text-sm hover:scale-105 shadow-lg shrink-0"
    //                         >
    //                           Add
    //                         </button>
    //                       </div>
    //                     </div>
    //                   ))}
    //                 </div>
    //               ) : (
    //                 <div className="text-center py-8 sm:py-12">
    //                   <div className="w-12 sm:w-16 h-12 sm:h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
    //                     <Briefcase className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400" />
    //                   </div>
    //                   <p className="text-slate-400 font-medium text-sm">No projects available</p>
    //                   <p className="text-slate-500 text-xs sm:text-sm mt-1">Create a project to get started</p>
    //                 </div>
    //               )}
    //             </div>
    //           </div>
    //         </>
    //       )}
    //     </div>

    //     <style jsx>{`
    //       .custom-scrollbar::-webkit-scrollbar {
    //         width: 4px;
    //       }
    //       .custom-scrollbar::-webkit-scrollbar-track {
    //         background: rgba(71, 85, 105, 0.1);
    //         border-radius: 2px;
    //       }
    //       .custom-scrollbar::-webkit-scrollbar-thumb {
    //         background: rgba(6, 182, 212, 0.3);
    //         border-radius: 2px;
    //       }
    //       .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    //         background: rgba(6, 182, 212, 0.5);
    //       }
    //     `}</style>
    //   </div>
    // </div>
  );
};

export default DeveloperCard;
