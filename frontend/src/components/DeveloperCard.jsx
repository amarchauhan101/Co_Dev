// import axios from "axios";
// import React, { useEffect, useState, useRef } from "react";
// import {
//   FaGithub,
//   FaLinkedin,
//   FaTwitter,
//   FaYoutube,
//   FaInstagram,
//   FaFacebook,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import Loader from "./Loader";
// import { Tilt } from "react-tilt";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";
// import { useAuth } from "../../context/AuthContext";

// function DeveloperCard({ dev, devkey }) {
// const [projects, setProjects] = useState([]);
// const [loading, setLoading] = useState(true);
// const [isModalOpen, setIsModalOpen] = useState(false);
// const [openAbove, setOpenAbove] = useState(false);
// const buttonRef = useRef(null);
// const modalRef = useRef(null);
// const [selectedProject, setSelectedProject] = useState(null);

// const { user } = useAuth();
// const userWithToken = user?.userWithToken;
// const token = userWithToken?.token;
// useEffect(() => {
//   console.log("user in dev", user);
// }, [user]);

// // const modalRef = useRef();

// const defaultOptions = {
//   reverse: false,
//   max: 25,
//   perspective: 1200,
//   scale: 1.07,
//   speed: 800,
//   transition: true,
//   axis: null,
//   reset: true,
//   easing: "cubic-bezier(.17,.67,.83,.67)",
//   glare: true,
//   "max-glare": 0.3,
// };

// useEffect(() => {
//   if (isModalOpen && buttonRef.current && modalRef.current) {
//     const buttonRect = buttonRef.current.getBoundingClientRect();
//     const modalHeight = modalRef.current.offsetHeight;

//     const spaceBelow = window.innerHeight - buttonRect.bottom;
//     const spaceAbove = buttonRect.top;

//     // if there's not enough space below but enough above, open above
//     if (spaceBelow < modalHeight && spaceAbove > modalHeight) {
//       setOpenAbove(true);
//     } else {
//       setOpenAbove(false);
//     }
//   }
// }, [isModalOpen]);

// useEffect(() => {
//   const handleClickOutside = (event) => {
//     if (modalRef.current && !modalRef.current.contains(event.target)) {
//       setIsModalOpen(false);
//     }
//   };
//   if (isModalOpen) {
//     document.addEventListener("mousedown", handleClickOutside);
//   } else {
//     document.removeEventListener("mousedown", handleClickOutside);
//   }

//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, [isModalOpen]);

// useEffect(() => {
//   const fetchData = async () => {
//     // const users = localStorage.getItem("user");
//     // const token = users?.userWithToken?.token;
//   try {
//     const res = await axios.get("http://localhost:8000/api/v1/getprofile", {
//       headers: { authorization: `Bearer ${token}` },
//     });
//     console.log("project in dev=>", res.data.userdata.profile?.projects);
//     setProjects(res.data.userdata.profile?.projects);
//     setLoading(false);
//   } catch (err) {
//     console.error("Failed to load projects:", err);
//     setLoading(false);
//   }
// };
// fetchData();
// }, []);

// const handleAddToProject = async (projectId) => {
//   const result = await Swal.fire({
//     title: "Are you sure?",
//     text: "You won't be able to revert this!",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#7C3AED", // violet
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Yes, send request!",
//   });

//   if (result.isConfirmed) {
//     try {
//       const res = await axios.post(
//         `http://localhost:8000/api/v1/request`,
//         { receiverId: dev._id, projectId },
//         {
//           headers: { authorization: `Bearer ${token}` },
//         }
//       );

//       Swal.fire({
//         title: "Sent!",
//         text: "Your request has been sent.",
//         icon: "success",
//         confirmButtonColor: "#7C3AED",
//       });

//       setIsModalOpen(false);
//     } catch (err) {
//       console.error(
//         "Error adding developer to project:",
//         err.response?.data?.msg || err.message
//       );
//       toast.error(err.response?.data?.msg || "Something went wrong.");
//     }
//   }
// };

//   return (
//     <div
//       options={defaultOptions}
//       className="bg-[#0f172a] bg-gradient-to-br  from-[#0a192f] to-[#0f3460] shadow-[0_0_25px_5px_rgba(0,55,128,0.6)]   text-zinc-100 rounded-2xl p-4 sm:p-6 w-64 sm:w-full max-w-md mx-auto hover:shadow-xl transition-all ease-in-out duration-500"
//     >
//       {/* Top Section: Image + Info */}
//       <div
//         key={devkey}
//         className="flex  inset-0  flex-col sm:flex-row items-center sm:items-start gap-4 relative"
//       >
//         {/* Avatar */}
//         <Link to={`/getdevprofile/${dev._id}`} className="relative shrink-0">
//           <img
//             src={dev?.profile?.avatar || dev?.profileImage}
//             alt="Avatar"
//             className="w-20 h-20 sm:w-16 sm:h-16 rounded-full border-2 border-cyan-500 object-cover"
//           />

//           {/* Show green circle only if active in last 10 minutes */}
//           {(() => {
//             const lastActive = new Date(dev?.profile?.activeat);
//             const now = new Date();
//             const diffInMinutes = (now - lastActive) / 60000;

//             return diffInMinutes <= 10 ? (
//               <span
//                 className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full animate-pulse"
//                 title="Active"
//               ></span>
//             ) : null;
//           })()}
//         </Link>

//         {/* Info */}
//         <div className="flex-1 text-center sm:text-left w-full">
//           <h2 className="text-lg sm:text-xl font-semibold text-cyan-400 break-words">
//             {dev.username}
//           </h2>
//           <p className="text-sm text-zinc-400 break-words">{dev.email}</p>
//           {dev?.profile?.bio && (
//             <p className="mt-2 text-zinc-300 text-sm">{dev.profile.bio}</p>
//           )}

//           <div className="mt-2 text-zinc-300 text-sm space-y-1">
//             <p>
//               <span className="font-semibold">Experience:</span>{" "}
//               {dev?.profile?.experience || "N/A"}
//             </p>
//             <p>
//               <span className="font-semibold">Education:</span>{" "}
//               {dev?.profile?.education || "N/A"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Skills */}
//       <div className="mt-4">
//         <h3 className="font-semibold mb-1 text-sm sm:text-base text-cyan-300">
//           Skills:
//         </h3>
//         <div className="flex flex-wrap gap-2">
//           {dev?.profile?.skills?.length > 0 ? (
//             dev.profile.skills.map((skill, i) => (
//               <span
//                 key={i}
//                 className="bg-cyan-800 text-cyan-100 px-2 py-1 rounded-full text-xs sm:text-sm"
//               >
//                 {skill}
//               </span>
//             ))
//           ) : (
//             <span className="text-sm text-zinc-500">No skills listed</span>
//           )}
//         </div>
//       </div>

//       {/* Social Media Icons */}
//       <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start text-cyan-400 text-lg">
//         {dev?.profile?.social?.github && (
//           <a
//             href={dev.profile.social.github}
//             target="_blank"
//             rel="noreferrer"
//             className="hover:scale-125 transition-transform duration-300"
//           >
//             <FaGithub />
//           </a>
//         )}
//         {dev?.profile?.social?.linkedin && (
//           <a
//             href={dev.profile.social.linkedin}
//             target="_blank"
//             rel="noreferrer"
//             className="hover:scale-125 transition-transform duration-300"
//           >
//             <FaLinkedin />
//           </a>
//         )}
//         {dev?.profile?.social?.twitter && (
//           <a
//             href={dev.profile.social.twitter}
//             target="_blank"
//             rel="noreferrer"
//             className="hover:scale-125 transition-transform duration-300"
//           >
//             <FaTwitter />
//           </a>
//         )}
//         {dev?.profile?.social?.youtube && (
//           <a
//             href={dev.profile.social.youtube}
//             target="_blank"
//             rel="noreferrer"
//             className="hover:scale-125 transition-transform duration-300"
//           >
//             <FaYoutube />
//           </a>
//         )}
//         {dev?.profile?.social?.instagram && (
//           <a
//             href={dev.profile.social.instagram}
//             target="_blank"
//             rel="noreferrer"
//             className="hover:scale-125 transition-transform duration-300"
//           >
//             <FaInstagram />
//           </a>
//         )}
//         {dev?.profile?.social?.facebook && (
//           <a
//             href={dev.profile.social.facebook}
//             target="_blank"
//             rel="noreferrer"
//             className="hover:scale-125 transition-transform duration-300"
//           >
//             <FaFacebook />
//           </a>
//         )}
//       </div>

//       {/* Project Modal Trigger */}
//       {/* <div className="mt-6 z-[999] flex justify-center sm:justify-end relative">
//         <button
//           onClick={() => setIsModalOpen(!isModalOpen)}
//           className="px-4 py-2 text-sm sm:text-base hover:scale-95 hover:text-white bg-emerald-400 hover:bg-emerald-600 text-zinc-900 rounded-full shadow-md ease-in-out transition duration-300"
//         >
//           Add to your project
//         </button>

//         {isModalOpen && (
//           <div
//             ref={modalRef}
//             className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-[999]"
//           >
//             <div className="p-4 z-50">
//               <h2 className="text-lg font-semibold mb-2 text-cyan-300">
//                 Select a Project
//               </h2>
//               {loading ? (
//                 <Loader />
//               ) : projects.length > 0 ? (
//                 <ul className="space-y-3 z-[999]">
//                   {projects.map((project) => (
//                     <li
//                       key={project._id}
//                       className="bg-zinc-700 z-[999] rounded-md p-2 flex justify-between items-center"
//                     >
//                       <span className="text-sm text-zinc-100 font-medium">
//                         {project.name}
//                       </span>
//                       <button
//                         onClick={() => handleAddToProject(project._id)}
//                         className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                       >
//                         Add
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-zinc-400">No projects available.</p>
//               )}
//               <div className="flex justify-end mt-3">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-3 py-1 text-sm bg-zinc-600 text-white rounded hover:bg-zinc-500"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div> */}

//       <div className="mt-6 z-50 flex justify-center sm:justify-end relative">
//         <button
//           ref={buttonRef}
//           onClick={() => setIsModalOpen(!isModalOpen)}
//           className="px-4 py-2 text-sm sm:text-base hover:scale-95 hover:text-white bg-emerald-400 hover:bg-emerald-600 text-zinc-900 rounded-full shadow-md ease-in-out transition duration-300"
//         >
//           Add to your project
//         </button>

//         {/* Modal */}
//         {isModalOpen && (
//           <div
//             ref={modalRef}
//             className={`scroll absolute right-0 z-[999] w-64 max-h-80 overflow-y-auto  bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg ${
//               openAbove ? "bottom-full mb-2" : "mt-2"
//             }`}
//           >
//             <div className="p-4">
//               <h2 className="text-lg font-semibold mb-2 text-cyan-300">
//                 Select a Project
//               </h2>
//               {loading ? (
//                 <Loader />
//               ) : projects.length > 0 ? (
//                 <ul className="space-y-3">
//                   {projects.map((project) => (
//                     <li
//                       key={project._id}
//                       className="bg-zinc-700 rounded-md p-2 flex justify-between items-center"
//                     >
//                       <span className="text-sm text-zinc-100 font-medium">
//                         {project.name}
//                       </span>
//                       <button
//                         onClick={() => handleAddToProject(project._id)}
//                         className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                       >
//                         Add
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-zinc-400">No projects available.</p>
//               )}
//               <div className="flex justify-end mt-3">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-3 py-1 text-sm bg-zinc-600 text-white rounded hover:bg-zinc-500"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default DeveloperCard;

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
        rounded-3xl p-8 w-64 sm:w-full max-w-md mx-auto
        shadow-[0_8px_32px_rgba(6,182,212,0.12),0_0_0_1px_rgba(6,182,212,0.05)]
        hover:shadow-[0_20px_60px_rgba(6,182,212,0.25),0_0_0_1px_rgba(6,182,212,0.1)]
        transition-all duration-700 ease-out
        hover:scale-[1.03] hover:-translate-y-2
        ${isHovered ? "transform-gpu" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-indigo-400/5 to-cyan-400/5 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Premium Floating Elements */}
      <div className="absolute top-6 right-6 flex gap-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
        <div
          className="w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Top Section: Enhanced Image + Info */}
      <div
        key={devkey}
        className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative mb-8"
      >
        {/* Premium Avatar with Multiple Effects */}
        <div className="relative shrink-0">
          {/* Outer glow ring */}
          <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>

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
            className="relative w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover z-10 border-2 border-slate-700/50"
          />

          {/* Enhanced Active Status */}
          {isActive() && (
            <div className="absolute -bottom-1 -right-1 z-20">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-3 border-slate-900 flex items-center justify-center shadow-lg shadow-emerald-400/50">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></div>
            </div>
          )}

          {/* Premium Reliability Score Badge */}
          {typeof dev?.profile?.reliabilityScore == "number" && (
            <div
              className={`
              absolute -top-3 -right-8 px-3 py-1.5 rounded-full text-xs font-bold
              ${getReliabilityColor(dev.profile.reliabilityScore)}
              border backdrop-blur-sm
              flex items-center gap-1.5 shadow-lg
            `}
            >
              <Zap className="w-3 h-3" />
              <span>{dev.profile.reliabilityScore}</span>
            </div>
          )}
        </div>

        {/* Enhanced Info Section */}
        <div className="flex-1 text-center sm:text-left w-full">
          <div className="relative">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent break-words mb-2 leading-tight">
              {dev.username}
            </h2>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 rounded-full"></div>
          </div>

          {dev.email && (
            <p className="text-sm text-slate-400 break-words mb-3 flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-3 h-3" />
              {dev.email}
            </p>
          )}

          {dev?.profile?.bio && (
            <p className="text-slate-300 text-sm leading-relaxed mb-4 bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              {dev.profile.bio}
            </p>
          )}

          {/* Premium Stats Grid */}
          {(dev?.profile?.experience || dev?.profile?.education) && (
            <div className="grid grid-cols-1 gap-3 text-xs">
              {dev?.profile?.experience && (
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-3 border border-slate-600/30 backdrop-blur-sm">
                  <div className="text-cyan-400 font-semibold flex items-center gap-2 mb-1">
                    <Award className="w-3 h-3" />
                    Experience
                  </div>
                  <div className="text-slate-200 font-medium">
                    {dev.profile.experience}
                  </div>
                </div>
              )}

              {dev?.profile?.education && (
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-3 border border-slate-600/30 backdrop-blur-sm">
                  <div className="text-blue-400 font-semibold flex items-center gap-2 mb-1">
                    <Briefcase className="w-3 h-3" />
                    Education
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
        <div className="grid grid-cols-2 gap-4 mb-8">
          {dev?.profile?.responseTimes?.length > 0 && (
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 border border-blue-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="text-white font-bold text-lg">
                {getAverageResponseTime()}
              </div>
              <div className="text-slate-400 text-xs font-medium">
                Avg Response
              </div>
            </div>
          )}

          {dev?.profile?.weeklyLogins?.length > 0 && (
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-600/10 border border-emerald-400/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-white font-bold text-lg">
                {dev.profile.weeklyLogins.length}
              </div>
              <div className="text-slate-400 text-xs font-medium">
                Weekly Logins
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Skills Section */}
      {dev?.profile?.skills?.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold mb-4 text-base text-white flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
              <Code className="w-3 h-3 text-white" />
            </div>
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {dev.profile.skills.map((skill, i) => (
              <span
                key={i}
                className={`
                  px-4 py-2 rounded-full text-xs font-semibold
                  bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15
                  border border-cyan-400/25 text-cyan-100
                  hover:from-cyan-500/25 hover:via-blue-500/25 hover:to-purple-500/25
                  hover:border-cyan-300/40 hover:scale-110
                  transition-all duration-300 cursor-pointer
                  backdrop-blur-sm shadow-lg
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
          <div className="mb-8 text-center">
            <h4 className="text-slate-400 text-sm font-medium mb-4">
              Connect With Me
            </h4>
            <div className="flex flex-wrap gap-3 justify-center">
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
                    group relative p-3 rounded-xl 
                    bg-gradient-to-r from-slate-700/40 to-slate-800/40
                    border border-slate-600/30 text-slate-400
                    hover:from-cyan-500/20 hover:to-blue-500/20
                    hover:border-cyan-300/40 hover:scale-110 hover:text-cyan-300
                    transition-all duration-300 backdrop-blur-sm
                    shadow-lg hover:shadow-cyan-500/20
                  `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 rounded-xl transition-all duration-300"></div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

      {/* Premium CTA Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsModalOpen(!isModalOpen)}
          className={`
            w-full py-4 px-8 rounded-2xl font-bold text-white
            bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500
            hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600
            shadow-[0_8px_30px_rgba(6,182,212,0.3)]
            hover:shadow-[0_12px_40px_rgba(6,182,212,0.4)]
            hover:scale-[1.02] hover:-translate-y-1
            transition-all duration-300
            flex items-center justify-center gap-3
            relative overflow-hidden group
            border border-cyan-400/20
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10 text-lg">Collaborate Now</span>
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
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
        w-[90%] sm:w-80 
        max-h-[80vh] overflow-y-auto
        bg-gradient-to-br from-slate-800/98 via-slate-900/95 to-black/98
        backdrop-blur-2xl border-2 border-cyan-400/20
        rounded-3xl shadow-[0_20px_60px_rgba(6,182,212,0.3)]
        left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
        animate-in slide-in-from-bottom-4 duration-300
      `}
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
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

                {/* Loading state */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 text-sm">
                      Loading projects...
                    </p>
                  </div>
                ) : projects?.length > 0 ? (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="group bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/30 rounded-2xl p-4 hover:from-slate-700/60 hover:to-slate-800/60 hover:border-cyan-400/30 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm mb-1">
                              {project.name}
                            </h3>
                            <p className="text-slate-400 text-xs">
                              Click to add developer
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddToProject(project._id)}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold text-sm hover:scale-105 shadow-lg w-full sm:w-auto"
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
                    <p className="text-slate-400 font-medium">
                      No projects available
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
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
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
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
