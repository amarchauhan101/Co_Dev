import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Loader from "./Loader";
import {
  FaBell,
  FaCode,
  FaDatabase,
  FaServer,
  FaEdit,
  FaSave,
  FaTimes,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCertificate,
  FaAward,
  FaChartLine,
  FaChartArea,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { FaYoutube } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { BsGithub } from "react-icons/bs";
import { FaLinkedin, FaPalette } from "react-icons/fa6";
import "./ProfileStyles.css";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebookF } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Graph } from "./Graph";
import { BarChart, Cell, PieChart, ResponsiveContainer } from "recharts";
import { Bar, Pie } from "react-chartjs-2";
import ProfileDev from "./ProfileDev";
import ProjectsSection from "./ProjectSection";
import { IoSchool } from "react-icons/io5";
import {
  getSocialIcon,
  getInterestIcon,
  getSkillIcon,
} from "../utils/iconMapper";
import { useAuth } from "../../context/AuthContext";

// Memoized components to prevent unnecessary re-renders
const MemoizedProfileDev = React.memo(ProfileDev);
const MemoizedGraph = React.memo(Graph);
const MemoizedProjectsSection = React.memo(ProjectsSection);

function Profile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isScrolling, setIsScrolling] = useState(false);
  const { user } = useAuth();
  const token = user?.userWithToken?.token;
  const scrollTimeoutRef = useRef();
  
  const { register, handleSubmit, reset } = useForm();

  // Move all memoized values and callbacks to the top - before any early returns
  const profile = userData?.profile;
  const social = profile?.social || {};

  // Memoized chart data to prevent unnecessary recalculations
  const reliabilityData = useMemo(() => {
    const score = profile?.reliabilityScore ?? 0;
    return {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          label: "Reliability",
          data: [score, 100 - score],
          backgroundColor: ["#10B981", "#374151"],
        },
      ],
    };
  }, [profile?.reliabilityScore]);

  const skillsData = useMemo(() => 
    profile?.skills?.map((skill) => ({
      name: skill,
      value: 1,
    })) || []
  , [profile?.skills]);

  // Simple scroll handler - removed complex optimizations for better performance
  const handleScrollOptimization = useCallback(() => {
    // Minimal scroll handling
  }, []);

  // Optimized CSS classes with minimal animations for better performance
  const getOptimizedClasses = useCallback((baseClasses, animationClasses = '') => {
    return baseClasses; // Remove all animations for optimal performance
  }, []);

  console.log("user in profile", user);

  // Single scroll listener with proper cleanup - no dependency on isScrolling state
  useEffect(() => {
    window.addEventListener('scroll', handleScrollOptimization, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScrollOptimization);
      // Clean up on unmount
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      document.body.classList.remove('scrolling');
    };
  }, [handleScrollOptimization]); // Only depends on the callback, not on isScrolling state

  const sociallink = {
    youtube: <FaYoutube className="text-red-500" />,
    twitter: <FaTwitter className="text-blue-400" />,
    instagram: <RiInstagramFill className="text-pink-500" />,
    github: <BsGithub className="text-zinc-600" />,
    linkedin: <FaLinkedin className="text-blue-700" />,
  };

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const SKILL_COLORS = {
    Frontend: "#6366F1",
    Backend: "#10B981",
    Database: "#F59E0B",
    DevOps: "#EF4444",
  };

  // Skill icons
  const SkillIcon = ({ name }) => {
    const icons = {
      Frontend: <FaCode className="text-indigo-500" />,
      Backend: <FaServer className="text-emerald-500" />,
      Database: <FaDatabase className="text-amber-500" />,
      DevOps: <FaPalette className="text-red-500" />,
    };
    return icons[name] || <FaCode />;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/getprofile", {
          headers: { authorization: `Bearer ${token}` },
        });
        console.log("res=>", res.data);
        const user = res.data.userdata;
        console.log("user profile", user);

        reset({
          ...user,
          profile: {
            ...user.profile,
            skills: user.profile?.skills?.join(", ") || "",
            social: user.profile?.social || {},
          },
        });

        setUserData(user);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.put(
        "http://localhost:8000/api/v1/updateprofile",
        data,
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUserData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            bio: data.bio || profile?.bio,
            skills: data.skills.split(",").map((s) => s.trim()),
            experience: data.experience || profile?.experience,
            education: data.education || profile?.education,
            social: {
              linkedin: data.social.linkedin || profile?.social?.linkedin,
              github: data.social.github || profile?.social?.github,
              instagram: data.social.instagram || profile?.social?.instagram,
              twitter: data.social.twitter || profile?.social?.twitter,
              youtube: data.social.youtube || profile?.social?.youtube,
            },
          },
        }));
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    if (isEditing && userData?.profile) {
      reset({
        bio: userData.profile.bio || "",
        skills: userData.profile.skills?.join(", ") || "",
        experience: userData.profile.experience || "",
        education: userData.profile.education || "",
        social: {
          linkedin: userData.profile.social?.linkedin || "",
          github: userData.profile.social?.github || "",
          instagram: userData.profile.social?.instagram || "",
          twitter: userData.profile.social?.twitter || "",
          youtube: userData.profile.social?.youtube || "",
        },
      });
    }
  }, [isEditing, userData, reset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Optimized Background Elements - Always present but with reduced opacity during scroll */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-200"
        style={{ opacity: isScrolling ? 0.3 : 1 }}
      >
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={getOptimizedClasses(
            "text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4",
            "animate-fade-in"
          )}>
            Your Profile
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Showcase your expertise and connect with opportunities
          </p>
        </div>

        {/* Profile Hero Section */}
        <div className={getOptimizedClasses(
          "glass-card rounded-3xl shadow-2xl mb-8 overflow-hidden",
          "glass-card-hover animate-fade-in"
        )}>
          {/* Cover Background */}
          <div className={getOptimizedClasses(
            "h-48 sm:h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 relative",
            "animate-gradient"
          )}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 right-6">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={getOptimizedClasses(
                  "bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 text-white shadow-lg transform hover:scale-105",
                  "btn-glow transition-all duration-300 hover:shadow-xl animate-pulse-glow"
                )}
              >
                {isEditing ? <FaTimes size={20} /> : <FaEdit size={20} />}
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 sm:px-8 lg:px-12 pb-8">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-32">
                <div className={getOptimizedClasses(
                  "relative group",
                  "animate-fade-in"
                )}>
                  <div className={getOptimizedClasses(
                    "w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-purple-400 to-cyan-400 p-1 shadow-2xl",
                    "animate-float"
                  )}>
                    <img
                      src={
                        userData?.profileImage ||
                        "https://via.placeholder.com/160"
                      }
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover bg-white hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {profile?.isactive && (
                    <div className={getOptimizedClasses(
                      "absolute bottom-2 right-2 w-6 h-6 bg-green-400 border-4 border-white rounded-full shadow-lg",
                      "animate-pulse-glow"
                    )}></div>
                  )}
                </div>

                
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3 sm:mb-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {userData?.username}
                  </h2>
                  <p className="text-lg text-gray-300">{userData?.email}</p>
                  <p className="text-gray-400 max-w-2xl leading-relaxed">
                    {profile?.bio ||
                      "🚀 Passionate developer creating amazing digital experiences"}
                  </p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {profile?.githubCommits || 0}
                      </div>
                      <div className="text-sm text-gray-400">Commits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {profile?.reliabilityScore || 0}%
                      </div>
                      <div className="text-sm text-gray-400">Reliability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-400">
                        {profile?.skills?.length || 0}
                      </div>
                      <div className="text-sm text-gray-400">Skills</div>
                    </div>
                  </div>
                </div>
            </div>  

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-8 mb-8">
              {["overview", "skills", "experience", "social"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-full font-medium ${
                    isScrolling ? 'transition-none' : 'transition-all duration-300 transform hover:scale-105'
                  } ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Sections */}
            <div className="min-h-[400px]">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Education */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-colors duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <IoSchool className="text-white text-xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Education</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {profile?.education || "🎓 Add your educational background"}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-colors duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <FaCertificate className="text-white text-xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Experience</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {profile?.experience || "💼 Share your professional journey"}
                      </p>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <FaAward className="text-yellow-400" />
                      Interests & Achievements
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile?.interests?.length ? (
                        profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-full text-pink-300 text-sm hover:scale-105 transition-transform duration-200"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">
                          🎯 Add your interests and achievements
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <FaCode className="text-cyan-400" />
                      Technical Skills
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profile?.skills?.length ? (
                        profile.skills.map((skill, index) => {
                          const SkillIcon = getSkillIcon(skill);
                          return (
                            <div
                              key={index}
                              className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-xl p-4"
                            >
                              <div className="flex items-center gap-3">
                                <SkillIcon className="text-2xl text-cyan-400" />
                                <span className="font-medium text-white">{skill}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-12">
                          <FaCode className="text-6xl text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">🛠️ Add your technical skills</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === "experience" && (
                <div className={getOptimizedClasses("space-y-6", "animate-fade-in")}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6">Professional Journey</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-bold text-white">Experience Level</h4>
                          <p className="text-gray-300">
                            {profile?.experienceLevel || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-3 h-3 bg-purple-400 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-bold text-white">Last Active</h4>
                          <p className="text-gray-300">
                            {profile?.activeat ? new Date(profile.activeat).toLocaleDateString() : "Not available"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Tab */}
              {activeTab === "social" && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-2xl font-bold text-white mb-6">Connect With Me</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(profile?.social || {}).map(([platform, url]) => {
                        if (!url) return null;
                        const Icon = getSocialIcon(platform);
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-purple-600 hover:to-cyan-600 border border-gray-600 hover:border-purple-400 rounded-xl p-4 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="text-2xl text-gray-400 hover:text-white transition-colors duration-200" />
                              <span className="font-medium text-white capitalize">
                                {platform}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                      {Object.keys(profile?.social || {}).length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <div className="text-6xl mb-4">🌐</div>
                          <p className="text-gray-400 text-lg">Add your social profiles</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Edit Profile
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500/20 hover:bg-red-500/30 rounded-full p-2 text-red-400 hover:text-red-300 transition-all duration-300"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register("bio")}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-all duration-300"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Skills
                    </label>
                    <input
                      {...register("skills")}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-all duration-300"
                      placeholder="React, Node.js, Python..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Experience
                    </label>
                    <input
                      {...register("experience")}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none transition-all duration-300"
                      placeholder="Your experience level..."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Education
                    </label>
                    <input
                      {...register("education")}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all duration-300"
                      placeholder="Your educational background..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Social Links
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "linkedin",
                      "github",
                      "instagram",
                      "twitter",
                      "youtube",
                    ].map((platform) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-400 mb-1 capitalize">
                          {platform}
                        </label>
                        <input
                          {...register(`social.${platform}`)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-all duration-300"
                          placeholder={`Your ${platform} URL`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <FaSave />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="space-y-8 mt-8">
          {/* Developer Analytics - Full Width on Desktop */}
          <div className="w-full">
            <div className={getOptimizedClasses(
              "bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8",
              "hover:shadow-3xl transition-all duration-500"
            )}>
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl shadow-lg">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  🚀 Developer Analytics
                </h3>
              </div>
              <div style={{ opacity: isScrolling ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
                <MemoizedProfileDev profile={profile} />
              </div>
            </div>
          </div>

          {/* Activity Graph - Full Width on Desktop */}
          <div className="w-full">
            <div className={getOptimizedClasses(
              "bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-6 lg:p-8",
              "hover:shadow-3xl transition-all duration-500"
            )}>
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl shadow-lg">
                  <FaChartArea className="text-white text-xl" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  📊 Activity Overview
                </h3>
              </div>
              <div style={{ opacity: isScrolling ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
                <MemoizedGraph profile={profile} variant="enhanced" />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              Featured Projects
            </h3>
            <div style={{ opacity: isScrolling ? 0.7 : 1, transition: 'opacity 0.2s ease' }}>
              <MemoizedProjectsSection profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple reusable input (optional)
const Input = ({ label, register, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        {...register}
        className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-gray-200"
      />
    ) : (
      <input
        type={type}
        {...register}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-gray-200"
      />
    )}
  </div>
);

export default Profile;
