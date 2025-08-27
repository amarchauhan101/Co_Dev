// import axios from "axios";
// import React, { useCallback, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import { FaYoutube } from "react-icons/fa6";
// import { FaAward, FaBell, FaCertificate, FaCode, FaFacebookF } from "react-icons/fa";
// import { AiFillInstagram } from "react-icons/ai";
// import { FaLinkedin } from "react-icons/fa";
// import { FaTwitter } from "react-icons/fa";
// import Loader from "./Loader";
// import ProfileDev from "./ProfileDev";
// import {
//   getInterestIcon,
//   getSkillIcon,
//   getSocialIcon,
// } from "../utils/iconMapper";
// import { Graph } from "./Graph";
// import ProjectsSection from "./ProjectSection";
// import { getDeveloperProfile } from "../utils/devProfileApi";
// import { useAuth } from "../../context/AuthContext";
// import { IoSchool } from "react-icons/io5";

// function DeveloperProfile() {
//   const { user } = useAuth();
//   const userWithToken = user?.userWithToken;
//   const token = userWithToken?.token;
//   const { id } = useParams();
//   console.log("id in dev profile", id);
//   const [userData, setuserData] = useState([]);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [loading, setloading] = useState(true);
//   const [isScrolling, setIsScrolling] = useState(false);
//   console.log("user =>", user);
//   const getOptimizedClasses = useCallback(
//     (baseClasses, animationClasses = "") => {
//       return baseClasses; // Remove all animations for optimal performance
//     },
//     []
//   );

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//     console.log("inside useeffect");
//     const getdevprofile = async () => {
//       try {
//         console.log("inside try");
//         const res = await getDeveloperProfile(id, token);
//         console.log("below res");
//         console.log("res of dev", res);
//         setuserData(res);
//         setloading(false);
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     getdevprofile();
//   }, [id]);
//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="min-h-screen font-fira bg-gray-900 text-gray-200 py-8 px-4 flex flex-col items-center">
//       {/* Header */}
//       <div className="w-full flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-100">Your Profile</h1>
//         <div className="relative">
//           <FaBell
//             className="w-6 h-6 text-gray-200 cursor-pointer"
//             onClick={() => setShowModal(true)}
//           />
//           {userData?.profile?.requests?.length > 0 && (
//             <span className="absolute top-[-4px] right-[-6px] bg-red-500 text-white text-xs rounded-full px-1">
//               {userData?.profile.requests.length}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Profile Card */}
//       <div className="w-full  bg-gray-900 rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-white min-h-[calc(100vh-4rem)]">
//         {/* Profile Info */}
//         {/* <div className="col-span-2 flex flex-col gap-10 font-[Poppins] text-slate-100 px-4 sm:px-6 md:px-10 xl:px-16">

//           <div className="flex flex-col md:flex-row items-center md:items-start gap-8  p-6 md:p-10    backdrop-blur-md">

//             <div className="relative">
//               <img
//                 src={userData?.profileImage}
//                 alt="Profile"
//                 className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-emerald-400 shadow-xl hover:scale-105 transition-transform duration-300"
//               />
//               {userData?.profile?.isactive && (
//                 <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full ring-2 ring-emerald-400 animate-ping"></span>
//               )}
//             </div>

//             <div className="flex-1 text-center md:text-left space-y-2">
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 tracking-wide">
//                 {userData?.username}
//               </h2>
//               <p className="text-sm text-gray-400">{userData?.email}</p>
//               <p className="italic text-gray-300">
//                 {userData?.profile?.bio || "No bio available"}
//               </p>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
//                 <p>
//                   <span className="font-semibold text-emerald-400">
//                     ⚙ Experience:
//                   </span>{" "}
//                   {userData?.profile?.experienceLevel || "Not specified"}
//                 </p>
//                 <p>
//                   <span className="font-semibold text-emerald-400">
//                     🐱‍💻 GitHub Commits:
//                   </span>{" "}
//                   {userData?.profile?.githubCommits ?? 0}
//                 </p>
//                 <p className="sm:col-span-2">
//                   <span className="font-semibold text-emerald-400">
//                     🟢 Active At:
//                   </span>{" "}
//                   {new Date(userData?.profile?.activeat).toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
//               <div>
//                 <h4 className="text-lg font-semibold text-emerald-300 mb-1">
//                   🎓 Education
//                 </h4>
//                 <p className="text-sm text-gray-300">
//                   {userData?.profile?.education || "Not specified"}
//                 </p>
//               </div>
//               <div>
//                 <h4 className="text-lg font-semibold text-emerald-300 mb-1">
//                   💼 Experience
//                 </h4>
//                 <p className="text-sm text-gray-300">
//                   {userData?.profile?.experience || "Not specified"}
//                 </p>
//               </div>
//             </div>

//             <div>
//               <h4 className="text-lg font-semibold text-emerald-300 mb-2">
//                 🛠 Skills
//               </h4>
//               <div className="flex flex-wrap gap-3">
//                 {userData?.profile?.skills?.length ? (
//                   userData?.profile.skills.map((skill, index) => {
//                     const SkillIcon = getSkillIcon(skill);
//                     return (
//                       <span
//                         key={index}
//                         className="flex items-center gap-2 px-3 py-1 text-xs bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-full shadow hover:scale-105 transition"
//                       >
//                         <SkillIcon className="text-sm" />
//                         {skill}
//                       </span>
//                     );
//                   })
//                 ) : (
//                   <p className="text-sm text-gray-400">Not specified</p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <h4 className="text-lg font-semibold text-blue-300 mb-2">
//                 🎯 Interests
//               </h4>
//               <div className="flex flex-wrap gap-2">
//                 {userData?.profile?.interests?.length ? (
//                   userData?.profile.interests.map((interest, index) => (
//                     <span
//                       key={index}
//                       className="px-3 py-1 text-xs bg-blue-700 text-white rounded-full shadow hover:bg-blue-500 transition"
//                     >
//                       {interest}
//                     </span>
//                   ))
//                 ) : (
//                   <p className="text-sm text-gray-400">Not specified</p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <h4 className="text-lg font-semibold text-white mb-2">
//                 🌐 Social Profiles
//               </h4>
//               <div className="flex flex-wrap gap-3">
//                 {Object.entries(userData?.profile?.social || {}).map(
//                   ([key, value]) => {
//                     const Icon = getSocialIcon(key);
//                     return (
//                       <a
//                         key={key}
//                         href={value}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-800 hover:bg-emerald-600 rounded-full capitalize text-white transition"
//                       >
//                         <Icon className="text-sm" />
//                         {key}
//                       </a>
//                     );
//                   }
//                 )}
//               </div>
//             </div>
//           </>
//         </div> */}
//         <div
//           className={getOptimizedClasses(
//             "glass-card rounded-3xl shadow-2xl mb-8 overflow-hidden",
//             "glass-card-hover animate-fade-in"
//           )}
//         >
//           {/* Cover Background */}
//           <div
//             className={getOptimizedClasses(
//               "h-48 sm:h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 relative",
//               "animate-gradient"
//             )}
//           >
//             <div className="absolute inset-0 bg-black/20"></div>
//           </div>

//           {/* Profile Info */}
//           <div className="px-6 sm:px-8 lg:px-12 pb-8">
//             <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
//               <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-32">
//                 <div
//                   className={getOptimizedClasses(
//                     "relative group",
//                     "animate-fade-in"
//                   )}
//                 >
//                   <div
//                     className={getOptimizedClasses(
//                       "w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-purple-400 to-cyan-400 p-1 shadow-2xl",
//                       "animate-float"
//                     )}
//                   >
//                     <img
//                       src={
//                         userData?.profile?.profileImage ||
//                         "https://via.placeholder.com/160"
//                       }
//                       alt="Profile"
//                       className="w-full h-full rounded-full object-cover bg-white hover:scale-105 transition-transform duration-300"
//                     />
//                   </div>
//                   {userData?.profile?.isactive && (
//                     <div
//                       className={getOptimizedClasses(
//                         "absolute bottom-2 right-2 w-6 h-6 bg-green-400 border-4 border-white rounded-full shadow-lg",
//                         "animate-pulse-glow"
//                       )}
//                     ></div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex-1 text-center sm:text-left space-y-3 sm:mb-4">
//                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
//                   {userData?.username}
//                 </h2>
//                 <p className="text-lg text-gray-300">{userData?.email}</p>
//                 <p className="text-gray-400 max-w-2xl leading-relaxed">
//                   {userData?.profile?.bio ||
//                     "🚀 Passionate developer creating amazing digital experiences"}
//                 </p>

//                 {/* Stats Row */}
//                 <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-4">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-cyan-400">
//                       {userData?.profile?.githubCommits || 0}
//                     </div>
//                     <div className="text-sm text-gray-400">Commits</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-purple-400">
//                       {userData?.profile?.reliabilityScore || 0}%
//                     </div>
//                     <div className="text-sm text-gray-400">Reliability</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-pink-400">
//                       {userData?.profile?.skills?.length || 0}
//                     </div>
//                     <div className="text-sm text-gray-400">Skills</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Navigation Tabs */}
//             <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-8 mb-8">
//               {["overview", "skills", "experience", "social"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-6 py-3 rounded-full font-medium ${
//                     isScrolling
//                       ? "transition-none"
//                       : "transition-all duration-300 transform hover:scale-105"
//                   } ${
//                     activeTab === tab
//                       ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
//                       : "bg-white/10 text-gray-300 hover:bg-white/20"
//                   }`}
//                 >
//                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 </button>
//               ))}
//             </div>

//             {/* Content Sections */}
//             <div className="min-h-[400px]">
//               {activeTab === "overview" && (
//                 <div className="space-y-8">
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     {/* Education */}
//                     <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-colors duration-200">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
//                           <IoSchool className="text-white text-xl" />
//                         </div>
//                         <h3 className="text-xl font-bold text-white">
//                           Education
//                         </h3>
//                       </div>
//                       <p className="text-gray-300 leading-relaxed">
//                         {userData?.profile?.education ||
//                           "🎓 Add your educational background"}
//                       </p>
//                     </div>

//                     {/* Experience */}
//                     <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-colors duration-200">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
//                           <FaCertificate className="text-white text-xl" />
//                         </div>
//                         <h3 className="text-xl font-bold text-white">
//                           Experience
//                         </h3>
//                       </div>
//                       <p className="text-gray-300 leading-relaxed">
//                         {userData?.profile?.experience ||
//                           "💼 Share your professional journey"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Interests */}
//                   <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
//                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
//                       <FaAward className="text-yellow-400" />
//                       Interests & Achievements
//                     </h3>
//                     <div className="flex flex-wrap gap-3">
//                       {userData?.profile?.interests?.length ? (
//                         userData?.profile?.interests.map((interest, index) => (
//                           <span
//                             key={index}
//                             className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-full text-pink-300 text-sm hover:scale-105 transition-transform duration-200"
//                           >
//                             {interest}
//                           </span>
//                         ))
//                       ) : (
//                         <p className="text-gray-400 italic">
//                           🎯 Add your interests and achievements
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Skills Tab */}
//               {activeTab === "skills" && (
//                 <div className="space-y-6">
//                   <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
//                     <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
//                       <FaCode className="text-cyan-400" />
//                       Technical Skills
//                     </h3>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {userData?.profile?.skills?.length ? (
//                         userData?.profile?.skills.map((skill, index) => {
//                           const SkillIcon = getSkillIcon(skill);
//                           return (
//                             <div
//                               key={index}
//                               className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-xl p-4"
//                             >
//                               <div className="flex items-center gap-3">
//                                 <SkillIcon className="text-2xl text-cyan-400" />
//                                 <span className="font-medium text-white">
//                                   {skill}
//                                 </span>
//                               </div>
//                             </div>
//                           );
//                         })
//                       ) : (
//                         <div className="col-span-full text-center py-12">
//                           <FaCode className="text-6xl text-gray-500 mx-auto mb-4" />
//                           <p className="text-gray-400 text-lg">
//                             🛠️ Add your technical skills
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Experience Tab */}
//               {activeTab === "experience" && (
//                 <div
//                   className={getOptimizedClasses(
//                     "space-y-6",
//                     "animate-fade-in"
//                   )}
//                 >
//                   <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
//                     <h3 className="text-2xl font-bold text-white mb-6">
//                       Professional Journey
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
//                         <div className="w-3 h-3 bg-cyan-400 rounded-full mt-2"></div>
//                         <div>
//                           <h4 className="font-bold text-white">
//                             Experience Level
//                           </h4>
//                           <p className="text-gray-300">
//                             {userData?.profile?.experienceLevel ||
//                               "Not specified"}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
//                         <div className="w-3 h-3 bg-purple-400 rounded-full mt-2"></div>
//                         <div>
//                           <h4 className="font-bold text-white">Last Active</h4>
//                           <p className="text-gray-300">
//                             {userData?.profile?.activeat
//                               ? new Date(
//                                   userData.profile.activeat
//                                 ).toLocaleDateString()
//                               : "Not available"}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Social Tab */}
//               {activeTab === "social" && (
//                 <div className="space-y-6">
//                   <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
//                     <h3 className="text-2xl font-bold text-white mb-6">
//                       Connect With Me
//                     </h3>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {Object.entries(userData?.profile?.social || {}).map(
//                         ([platform, url]) => {
//                           if (!url) return null;
//                           const Icon = getSocialIcon(platform);
//                           return (
//                             <a
//                               key={platform}
//                               href={url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-purple-600 hover:to-cyan-600 border border-gray-600 hover:border-purple-400 rounded-xl p-4 transition-colors duration-200"
//                             >
//                               <div className="flex items-center gap-3">
//                                 <Icon className="text-2xl text-gray-400 hover:text-white transition-colors duration-200" />
//                                 <span className="font-medium text-white capitalize">
//                                   {platform}
//                                 </span>
//                               </div>
//                             </a>
//                           );
//                         }
//                       )}
//                       {Object.keys(userData?.profile?.social || {}).length ===
//                         0 && (
//                         <div className="col-span-full text-center py-12">
//                           <div className="text-6xl mb-4">🌐</div>
//                           <p className="text-gray-400 text-lg">
//                             Add your social profiles
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Developer Analytics */}
//         <div className="col-span-1 overflow-auto max-h-[calc(100vh-8rem)]">
//           <ProfileDev profile={userData?.profile} />
//         </div>
//       </div>

//       {/* Notification Modal */}

//       <Graph profile={userData?.profile} />
//       {/* Projects */}
//       <ProjectsSection profile={userData?.profile} />
//     </div>
//   );
// }

// export default DeveloperProfile;

import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaYoutube } from "react-icons/fa6";
import {
  FaAward,
  FaBell,
  FaCertificate,
  FaCode,
  FaFacebookF,
  FaGithub,
  FaStar,
  FaEye,
  FaHeart,
  FaRocket,
  FaTrophy,
  FaMedal,
  FaChevronRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { BiCodeBlock, BiTrendingUp } from "react-icons/bi";
import { MdVerified, MdWorkspaces } from "react-icons/md";
import { HiSparkles, HiLightBulb } from "react-icons/hi";
import Loader from "./Loader";
import ProfileDev from "./ProfileDev";
import {
  getInterestIcon,
  getSkillIcon,
  getSocialIcon,
} from "../utils/iconMapper";
import { Graph } from "./Graph";
import ProjectsSection from "./ProjectSection";
import { getDeveloperProfile } from "../utils/devProfileApi";
import { useAuth } from "../../context/AuthContext";
import { IoSchool, IoLocationSharp } from "react-icons/io5";

function DeveloperProfile() {
  // All hooks at the top - NEVER call hooks conditionally
  const { user } = useAuth();
  const { id } = useParams();
  const [userData, setuserData] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setloading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const userWithToken = user?.userWithToken;
  const token = userWithToken?.token;

  console.log("id in dev profile", id);
  console.log("user =>", user);

  const getOptimizedClasses = useCallback(
    (baseClasses, animationClasses = "") => {
      return baseClasses; // Remove all animations for optimal performance
    },
    []
  );

  // Profile visibility animation
  useEffect(() => {
    const timer = setTimeout(() => setIsProfileVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log("inside useeffect");
    const getdevprofile = async () => {
      try {
        console.log("inside try");
        const res = await getDeveloperProfile(id, token);
        console.log("below res");
        console.log("res of dev", res);
        setuserData(res);
        setloading(false);
      } catch (error) {
        console.error(error);
        setloading(false);
      }
    };
    getdevprofile();
  }, [id, token]);

  // Early return AFTER all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/30 border-b-cyan-500 rounded-full animate-spin animate-reverse mx-auto mt-2 ml-2"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading Profile
          </h3>
          <p className="text-gray-400">Preparing amazing experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating Stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <HiSparkles className="text-yellow-400/30 text-xs" />
          </div>
        ))}
      </div>

      {/* Header with Navigation */}
      <div className="relative z-10 sticky top-0 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <FaRocket className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Developer Profile
                </h1>
                <p className="text-sm text-gray-400">Professional Portfolio</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowModal(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <FaBell className="w-5 h-5 text-gray-200" />
                </button>
                {userData?.profile?.requests?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {userData?.profile.requests.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8">
          {/* Profile Info Section - Full Width */}
          <div className="w-full">
            {/* Hero Profile Card */}
            <div
              className={`relative overflow-hidden rounded-3xl transition-all duration-1000 ${
                isProfileVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Cover Background with Gradient Overlay */}
              <div className="h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-cyan-900/30"></div>

                {/* Floating Elements in Cover */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 bg-cyan-400/20 rounded-full blur-lg animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-pink-400/30 rounded-full blur-md animate-pulse delay-500"></div>
              </div>

              {/* Profile Content Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-b-3xl -mt-20 relative z-10">
                <div className="px-6 sm:px-8 lg:px-12 pt-24 pb-8">
                  {/* Profile Image and Basic Info */}
                  <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 -mt-32 lg:-mt-40">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-tr from-purple-400 to-cyan-400 p-1 shadow-2xl">
                        <img
                          src={
                            userData?.profileImage ||
                            "https://via.placeholder.com/200"
                          }
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover bg-white hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {userData?.profile?.isactive && (
                        <div className="absolute  bottom-2  lg:bottom-4 right-0 lg:right-4 w-8 h-8 bg-green-400 border-4 border-white rounded-full shadow-lg animate-pulse">
                          <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                        </div>
                      )}
                      {/* Verified Badge */}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <MdVerified className="text-white text-sm" />
                      </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-4 lg:mb-8">
                      <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                          {userData?.username}
                        </h1>
                        <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
                          <FaEnvelope className="text-gray-400 text-sm" />
                          <p className="text-lg text-gray-300">
                            {userData?.email}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 max-w-2xl leading-relaxed text-lg">
                        {userData?.profile?.bio ||
                          "🚀 Passionate developer creating amazing digital experiences and innovative solutions"}
                      </p>

                      {/* Enhanced Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-purple-400/50 transition-all duration-200 hover:scale-105">
                          <div className="flex items-center gap-2 mb-1">
                            <FaGithub className="text-purple-400" />
                            <span className="text-sm text-gray-400">
                              Commits
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {userData?.profile?.githubCommits || 0}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-cyan-400/50 transition-all duration-200 hover:scale-105">
                          <div className="flex items-center gap-2 mb-1">
                            <FaTrophy className="text-cyan-400" />
                            <span className="text-sm text-gray-400">
                              Reliability
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {userData?.profile?.reliabilityScore || 0}%
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-pink-400/50 transition-all duration-200 hover:scale-105">
                          <div className="flex items-center gap-2 mb-1">
                            <BiCodeBlock className="text-pink-400" />
                            <span className="text-sm text-gray-400">
                              Skills
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {userData?.profile?.skills?.length || 0}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-yellow-400/50 transition-all duration-200 hover:scale-105">
                          <div className="flex items-center gap-2 mb-1">
                            <FaStar className="text-yellow-400" />
                            <span className="text-sm text-gray-400">
                              Experience
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {userData?.profile?.experienceLevel || "Junior"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Navigation Tabs */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-12 mb-8">
                    {[
                      { id: "overview", label: "Overview", icon: FaEye },
                      { id: "skills", label: "Skills", icon: BiCodeBlock },
                      {
                        id: "experience",
                        label: "Experience",
                        icon: MdWorkspaces,
                      },
                      { id: "social", label: "Connect", icon: FaGlobe },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                            activeTab === tab.id
                              ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-xl shadow-purple-500/25"
                              : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10 hover:border-white/20"
                          }`}
                        >
                          <Icon className="text-lg" />
                          <span className="hidden sm:block">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Enhanced Content Sections */}
                  <div className="min-h-[500px]">
                    {activeTab === "overview" && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Education Card */}
                          <div className="group bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl p-8 border border-blue-400/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <IoSchool className="text-white text-2xl" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  Education
                                </h3>
                                <p className="text-blue-300">
                                  Academic Background
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-lg">
                              {userData?.profile?.education ||
                                "🎓 Add your educational background to showcase your learning journey"}
                            </p>
                          </div>

                          {/* Experience Card */}
                          <div className="group bg-gradient-to-br from-green-500/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl p-8 border border-green-400/20 hover:border-green-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <FaCertificate className="text-white text-2xl" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  Professional Experience
                                </h3>
                                <p className="text-green-300">Career Journey</p>
                              </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-lg">
                              {userData?.profile?.experience ||
                                "💼 Share your professional journey and achievements"}
                            </p>
                          </div>
                        </div>

                        {/* Interests & Achievements */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-3xl p-8 border border-purple-400/20">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                              <FaAward className="text-white text-2xl" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                Interests & Achievements
                              </h3>
                              <p className="text-purple-300">
                                What drives you forward
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {userData?.profile?.interests?.length ? (
                              userData?.profile?.interests.map(
                                (interest, index) => (
                                  <span
                                    key={index}
                                    className="px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-2xl text-pink-300 font-medium hover:scale-105 transition-transform duration-200 hover:shadow-lg hover:shadow-pink-500/25"
                                  >
                                    {interest}
                                  </span>
                                )
                              )
                            ) : (
                              <div className="text-center py-8 w-full">
                                <HiLightBulb className="text-6xl text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg">
                                  🎯 Add your interests and achievements to
                                  inspire others
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills Tab */}
                    {activeTab === "skills" && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-3xl p-8 border border-cyan-400/20">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                              <FaCode className="text-white text-2xl" />
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold text-white">
                                Technical Arsenal
                              </h3>
                              <p className="text-cyan-300">
                                Technologies & Tools I Master
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userData?.profile?.skills?.length ? (
                              userData?.profile?.skills.map((skill, index) => {
                                const SkillIcon = getSkillIcon(skill);
                                return (
                                  <div
                                    key={index}
                                    className="group bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                                  >
                                    <div className="flex flex-col items-center text-center gap-4">
                                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <SkillIcon className="text-2xl text-white" />
                                      </div>
                                      <span className="font-semibold text-white text-lg">
                                        {skill}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="col-span-full text-center py-16">
                                <FaCode className="text-8xl text-gray-400 mx-auto mb-6" />
                                <h4 className="text-2xl font-bold text-white mb-2">
                                  No Skills Added Yet
                                </h4>
                                <p className="text-gray-400 text-lg">
                                  🛠️ Showcase your technical expertise
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Experience Tab */}
                    {activeTab === "experience" && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-3xl p-8 border border-green-400/20">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                              <BiTrendingUp className="text-white text-2xl" />
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold text-white">
                                Professional Timeline
                              </h3>
                              <p className="text-green-300">
                                Career milestones & growth
                              </p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-green-400/30 transition-colors duration-200">
                              <div className="w-4 h-4 bg-green-400 rounded-full mt-2 animate-pulse"></div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-white mb-2">
                                  Experience Level
                                </h4>
                                <p className="text-gray-300 text-lg">
                                  {userData?.profile?.experienceLevel ||
                                    "Not specified"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-400/30 transition-colors duration-200">
                              <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-white mb-2">
                                  Last Active
                                </h4>
                                <p className="text-gray-300 text-lg">
                                  {userData?.profile?.activeat
                                    ? new Date(
                                        userData.profile.activeat
                                      ).toLocaleDateString()
                                    : "Recently active"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Tab */}
                    {activeTab === "social" && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl p-8 border border-pink-400/20">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
                              <FaGlobe className="text-white text-2xl" />
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold text-white">
                                Let's Connect
                              </h3>
                              <p className="text-pink-300">
                                Find me across the digital world
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(
                              userData?.profile?.social || {}
                            ).map(([platform, url]) => {
                              if (!url) return null;
                              const Icon = getSocialIcon(platform);
                              return (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-purple-600/50 hover:to-cyan-600/50 border border-gray-600/50 hover:border-purple-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                      <Icon className="text-2xl text-white" />
                                    </div>
                                    <div>
                                      <span className="font-semibold text-white text-lg capitalize block">
                                        {platform}
                                      </span>
                                      <span className="text-gray-400 text-sm">
                                        Connect with me
                                      </span>
                                    </div>
                                    <FaChevronRight className="text-gray-400 ml-auto group-hover:text-white transition-colors duration-200" />
                                  </div>
                                </a>
                              );
                            })}
                            {Object.keys(userData?.profile?.social || {})
                              .length === 0 && (
                              <div className="col-span-full text-center py-16">
                                <FaGlobe className="text-8xl text-gray-400 mx-auto mb-6" />
                                <h4 className="text-2xl font-bold text-white mb-2">
                                  No Social Links Yet
                                </h4>
                                <p className="text-gray-400 text-lg">
                                  🌐 Add your social profiles to connect with
                                  others
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Analytics Section - Below Profile for All Devices */}
          <div className="w-full">
            <div className="bg-gradient-to-br from-slate-800/60 to-purple-900/60 backdrop-blur-xl border border-slate-600/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <FaRocket className="text-white text-xl" />
                  </div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  📊 Developer Analytics Dashboard
                </h2>
                <p className="text-gray-400 text-lg">Real-time performance insights and comprehensive metrics</p>
              </div>
              <ProfileDev profile={userData?.profile} />
            </div>
          </div>
        </div>

        {/* Analytics Graph Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              📊 Performance Analytics
            </h2>
            <p className="text-gray-400 text-lg">
              Deep dive into development insights and trends
            </p>
          </div>
          <Graph profile={userData?.profile} />
        </div>

        {/* Projects Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
              🚀 Featured Projects
            </h2>
            <p className="text-gray-400 text-lg">
              Showcase of innovative solutions and creative work
            </p>
          </div>
          <ProjectsSection profile={userData?.profile} />
        </div>
      </div>

      {/* Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold text-white">Notifications</h3>
            </div>
            <div className="p-6">
              {userData?.profile?.requests?.length > 0 ? (
                <div className="space-y-3">
                  {userData.profile.requests.map((request, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <p className="text-gray-300">{request}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaBell className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No new notifications</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-700/50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperProfile;
