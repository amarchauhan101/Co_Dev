// import React, { useState } from 'react';
// import { FaBell, FaYoutube, FaLinkedin, FaTwitter, FaGithub, FaCode, FaServer, FaDatabase, FaPalette } from 'react-icons/fa';
// import { AiFillInstagram } from 'react-icons/ai';
// import { BsGithub } from 'react-icons/bs';
// import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
// import { Graph } from './Graph';

// const ProfileDev = ({profile}) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   // Mock user data
// //   const profile = {
// //     profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
// //     username: 'Alex Morgan',
// //     email: 'alex.morgan@dev.com',
// //     profile: {
// //       bio: 'Senior Full-Stack Developer with 8+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud architecture.',
// //       education: 'M.S. Computer Science, Stanford University',
// //       experience: 'Lead Developer @ TechCorp (2018-Present)',
// //       skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'AWS', 'Docker', 'MongoDB'],
// //       social: {
// //         linkedin: 'https://linkedin.com/in/alexmorgan',
// //         github: 'https://github.com/alexmorgan',
// //         twitter: 'https://twitter.com/alexmorgan_dev',
// //       },
// //       projects: [
// //         {
// //           name: 'Project Nexus',
// //           description: 'A distributed task management system for enterprise teams',
// //           technologies: 'React, Node.js, MongoDB, Redis',
// //           githubLink: 'https://github.com/alexmorgan/nexus',
// //           liveDemoLink: 'https://nexus-demo.com',
// //         },
// //         {
// //           name: 'CodeCollab',
// //           description: 'Real-time collaborative code editor with video chat',
// //           technologies: 'WebSockets, React, Express, WebRTC',
// //           githubLink: 'https://github.com/alexmorgan/codecollab',
// //         },
// //         {
// //           name: 'CloudDeploy',
// //           description: 'Automated cloud deployment pipeline for microservices',
// //           technologies: 'AWS, Kubernetes, Terraform, GitHub Actions',
// //           githubLink: 'https://github.com/alexmorgan/clouddeploy',
// //         }
// //       ],
// //       requests: [
// //         {
// //           _id: '1',
// //           project: {
// //             name: 'Fintech Dashboard',
// //             description: 'Real-time financial analytics dashboard for investment firms'
// //           },
// //           sender: {
// //             username: 'Sarah Johnson'
// //           }
// //         },
// //         {
// //           _id: '2',
// //           project: {
// //             name: 'HealthTech API',
// //             description: 'Secure API for healthcare data exchange'
// //           },
// //           sender: {
// //             username: 'Michael Chen'
// //           }
// //         }
// //       ],
// //       stats: {
// //         reliability: 94,
// //         responseTime: '2.1 hours',
// //         taskCompletion: 89,
// //         weeklyLogins: [12, 15, 13, 17, 14, 16, 18],
// //         skillDistribution: [
// //           { name: 'Frontend', value: 40 },
// //           { name: 'Backend', value: 35 },
// //           { name: 'Database', value: 15 },
// //           { name: 'DevOps', value: 10 }
// //         ],
// //         weeklyActivity: [
// //           { day: 'Mon', commits: 12, prs: 3 },
// //           { day: 'Tue', commits: 8, prs: 2 },
// //           { day: 'Wed', commits: 15, prs: 4 },
// //           { day: 'Thu', commits: 10, prs: 3 },
// //           { day: 'Fri', commits: 18, prs: 5 },
// //           { day: 'Sat', commits: 5, prs: 1 },
// //           { day: 'Sun', commits: 2, prs: 0 }
// //         ],
// //         experienceTimeline: [
// //           { year: '2016', position: 'Junior Developer', company: 'StartUp Inc' },
// //           { year: '2018', position: 'Full Stack Dev', company: 'WebSolutions' },
// //           { year: '2020', position: 'Senior Developer', company: 'TechCorp' },
// //           { year: '2022', position: 'Tech Lead', company: 'TechCorp' },
// //         ]
// //       }
// //     }
// //   };

// //   const profile = profile.profile;

// //   // Handle form submission
// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     setIsEditing(false);
// //   };

// //   // Handle notification actions
// //   const handleRespond = (id, action) => {
// //     console.log(`Responded to ${id} with ${action}`);
// //     setShowModal(false);
// //   };

// //   // Chart colors
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
//   const SKILL_COLORS = {
//     Frontend: '#6366F1',
//     Backend: '#10B981',
//     Database: '#F59E0B',
//     DevOps: '#EF4444'
//   };

// //   // Skill icons
//   const SkillIcon = ({ name }) => {
//     const icons = {
//       Frontend: <FaCode className="text-indigo-500" />,
//       Backend: <FaServer className="text-emerald-500" />,
//       Database: <FaDatabase className="text-amber-500" />,
//       DevOps: <FaPalette className="text-red-500" />
//     };
//     return icons[name] || <FaCode />;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 py-8 px-4 flex flex-col items-center">
//       {/* Header */}
//       <div className="w-full max-w-6xl flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
//           Developer Profile
//         </h1>
//         <div className="relative">
//           <button
//             onClick={() => setShowModal(true)}
//             className="relative p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
//           >
//             <FaBell className="w-6 h-6 text-blue-400" />
//             {profile.requests.length > 0 && (
//               <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                 {profile.requests.length}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Profile Card */}
//         <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-xl p-6">
//           <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//             <div className="relative">
//               <img
//                 src={profile.profileImage}
//                 alt="Profile"
//                 className="w-32 h-32 rounded-xl border-4 border-blue-500/50 object-cover shadow-lg"
//               />
//               <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
//                 PRO
//               </div>
//             </div>
//             <div className="flex-1 text-center md:text-left">
//               <h2 className="text-2xl font-bold text-white">
//                 {profile.username}
//               </h2>
//               <p className="text-blue-400">{profile.email}</p>
//               <p className="mt-3 text-gray-300">
//                 {profile.bio}
//               </p>

//               <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
//                 {profile.skills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-blue-300"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="bg-gray-900/50 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-blue-400 mb-2">Education</h3>
//               <p className="text-gray-300">{profile.education}</p>
//             </div>
//             <div className="bg-gray-900/50 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold text-blue-400 mb-2">Experience</h3>
//               <p className="text-gray-300">{profile.experience}</p>
//             </div>
//           </div>

//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
//             <div className="flex gap-4">
//               {profile.social.linkedin && (
//                 <a
//                   href={profile.social.linkedin}
//                   className="p-3 bg-gray-700 rounded-lg hover:bg-blue-600 transition-colors"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <FaLinkedin className="text-2xl text-white" />
//                 </a>
//               )}
//               {profile.social.github && (
//                 <a
//                   href={profile.social.github}
//                   className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <FaGithub className="text-2xl text-white" />
//                 </a>
//               )}
//               {profile.social.twitter && (
//                 <a
//                   href={profile.social.twitter}
//                   className="p-3 bg-gray-700 rounded-lg hover:bg-blue-400 transition-colors"
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   <FaTwitter className="text-2xl text-white" />
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Stats Card */}

//       </div>

//       {/* Activity Charts */}
//       <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//         {/* Weekly Activity */}
//         <div className="bg-gray-800 rounded-xl shadow-xl p-6">
//           <h3 className="text-lg font-bold text-white mb-4">Weekly Activity</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={profile.weeklyLogins}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="day" stroke="#9CA3AF" />
//                 <YAxis stroke="#9CA3AF" />
//                 <Tooltip
//                   contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
//                   itemStyle={{ color: 'white' }}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="commits"
//                   name="Commits"
//                   stackId="1"
//                   stroke="#6366F1"
//                   fill="url(#colorCommits)"
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="prs"
//                   name="PRs"
//                   stackId="1"
//                   stroke="#10B981"
//                   fill="url(#colorPRs)"
//                 />
//                 <defs>
//                   <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
//                     <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
//                   </linearGradient>
//                   <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
//                     <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
//                   </linearGradient>
//                 </defs>
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Skill Distribution */}
//         <div className="bg-gray-800 rounded-xl shadow-xl p-6">
//           <h3 className="text-lg font-bold text-white mb-4">Experience Timeline</h3>
//           <div className="space-y-4">
//             {/* {profile.experience.map((exp, index) => (
//               <div key={index} className="flex">
//                 <div className="flex flex-col items-center mr-4">
//                   <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
//                     {exp.year}
//                   </div>
//                   {index < profile.experience.length - 1 && (
//                     <div className="h-full w-1 bg-gradient-to-b from-blue-500 to-emerald-500"></div>
//                   )}
//                 </div>
//                 <div className="pb-6">
//                   <h4 className="text-white font-semibold">{exp.position}</h4>
//                   <p className="text-gray-400">{exp.company}</p>
//                 </div>
//               </div>
//             ))} */}

//           </div>
//         </div>
//       </div>
//     <Graph profile={profile} />
//       {/* Projects */}
//       <div className="w-full max-w-6xl mt-6">
//         <div className="bg-gray-800 rounded-xl shadow-xl p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold text-white">Projects</h2>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//               New Project
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {profile.projects.map((project, index) => (
//               <div
//                 key={index}
//                 className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500/50 transition-all hover:shadow-lg"
//               >
//                 <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
//                 <p className="text-gray-300 text-sm mb-4">{project.description}</p>
//                 <p className="text-xs text-gray-400 mb-4">
//                   <span className="font-medium text-gray-300">Technologies:</span> {project.technologies}
//                 </p>
//                 <div className="flex gap-3">
//                   {project.githubLink && (
//                     <a
//                       href={project.githubLink}
//                       className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       <FaGithub />
//                       GitHub
//                     </a>
//                   )}
//                   {project.liveDemoLink && (
//                     <a
//                       href={project.liveDemoLink}
//                       className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                       </svg>
//                       Live Demo
//                     </a>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Notification Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
//           <div className="bg-gray-800 rounded-xl w-full max-w-lg mx-4 p-6 relative">
//             <button
//               className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
//               onClick={() => setShowModal(false)}
//             >
//               ×
//             </button>
//             <h2 className="text-xl font-bold text-white mb-4">
//               Project Requests
//             </h2>
//             {profile.requests.length > 0 ? (
//               <div className="space-y-4">
//                 {profile.requests.map((request, index) => (
//                   <div key={index} className="bg-gray-900 p-4 rounded-lg">
//                     <p className="text-white font-semibold">
//                       {request.project.name}
//                     </p>
//                     <p className="text-gray-300 text-sm mt-1">
//                       {request.project.description}
//                     </p>
//                     <p className="text-gray-400 text-sm mt-2">
//                       From: {request.sender.username}
//                     </p>
//                     <div className="flex gap-3 mt-3">
//                       <button
//                         onClick={() => handleRespond(request._id, "accepted")}
//                         className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                         </svg>
//                         Accept
//                       </button>
//                       <button
//                         onClick={() => handleRespond(request._id, "rejected")}
//                         className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                         Reject
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-400 py-8 text-center">No requests found.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfileDev;

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { FaCode, FaServer, FaDatabase } from "react-icons/fa";
import { FaPalette } from "react-icons/fa6";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

// Format milliseconds to "X min Y sec"

const SKILL_COLORS = {
  HTML: "#F97316",
  CSS: "#3B82F6",
  JS: "#FACC15",
  Frontend: "#6366F1",
  Backend: "#10B981",
  Database: "#F59E0B",
  DevOps: "#EF4444",
};

const SkillIcon = ({ name }) => {
  const icons = {
    Frontend: <FaCode className="text-indigo-500" />,
    Backend: <FaServer className="text-emerald-500" />,
    Database: <FaDatabase className="text-amber-500" />,
    DevOps: <FaPalette className="text-red-500" />,
    HTML: <FaCode className="text-orange-400" />,
    CSS: <FaCode className="text-blue-400" />,
    JS: <FaCode className="text-yellow-400" />,
  };
  return icons[name] || <FaCode />;
};

const ProfileDev = ({ profile }) => {
  const reliabilityScore = profile?.reliabilityScore ?? 0;
  const responseTime = profile?.responseTimes?.[0] ?? "N/A";
  const taskCompletion = Array.isArray(profile?.taskCompletionRates)
    ? Math.round(
        (profile.taskCompletionRates.reduce((a, b) => a + b, 0) /
          profile.taskCompletionRates.length) *
          100
      )
    : 0;

  const skillsData = (profile?.skills || []).map((skill) => ({
    name: skill,
    value: 1,
  }));

  const formatResponseTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const responseTimes = profile?.responseTimes || [];

  const current = responseTimes.at(-1) || 0;
  const previous = responseTimes.length > 1 ? responseTimes.at(-2) : null;

  const change = previous !== null ? previous - current : null;
  const changePercent =
    previous !== null ? ((Math.abs(change) / previous) * 100).toFixed(1) : null;

  const improved = change > 0;

  return (
    // <div className="bg-gray-800 rounded-xl shadow-xl p-6">
    //   <h2 className="text-xl font-bold text-white mb-6">Developer Analytics</h2>

    //   <div className="space-y-5">
    //     {/* Reliability Score */}
    //     <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700">
    //       <h3 className="text-sm font-semibold text-blue-400 mb-2">
    //         RELIABILITY SCORE
    //       </h3>
    //       <div className="flex items-end justify-between">
    //         <span className="text-3xl font-bold text-white">
    //           {reliabilityScore}%
    //         </span>
    //         <div className="w-16 h-16">
    //           <ResponsiveContainer width="100%" height="100%">
    //             <PieChart>
    //               <Pie
    //                 data={[
    //                   { name: "Completed", value: reliabilityScore },
    //                   { name: "Remaining", value: 100 - reliabilityScore },
    //                 ]}
    //                 cx="50%"
    //                 cy="50%"
    //                 innerRadius={20}
    //                 outerRadius={30}
    //                 dataKey="value"
    //                 paddingAngle={2}
    //               >
    //                 <Cell fill="#10B981" />
    //                 <Cell fill="#374151" />
    //               </Pie>
    //             </PieChart>
    //           </ResponsiveContainer>
    //         </div>
    //       </div>
    //       <p className="text-xs text-green-400 mt-2">
    //         Based on project delivery and peer reviews
    //       </p>
    //     </div>

    //     {/* Average Response Time */}
    //     <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700">
    //       <h3 className="text-sm font-semibold text-blue-400 mb-2">
    //         AVG. RESPONSE TIME
    //       </h3>
    //       <div className="flex items-center justify-between">
    //         <span className="text-3xl font-bold text-white">
    //           {responseTime}
    //         </span>
    //         <div className="text-green-500 text-sm bg-green-900/30 px-2 py-1 rounded">
    //           <span>▼ 12%</span>
    //         </div>
    //       </div>
    //       <p className="text-xs text-green-400 mt-2">
    //         Time to respond to messages and PRs
    //       </p>
    //     </div>

    //     {/* Task Completion Rate */}
    //     <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700">
    //       <h3 className="text-sm font-semibold text-blue-400 mb-2">
    //         TASK COMPLETION RATE
    //       </h3>
    //       <div className="flex items-center">
    //         <span className="text-3xl font-bold text-white">
    //           {taskCompletion}%
    //         </span>
    //         <div className="ml-4 flex-1">
    //           <div className="w-full bg-gray-700 rounded-full h-2.5">
    //             <div
    //               className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full"
    //               style={{ width: `${taskCompletion}%` }}
    //             ></div>
    //           </div>
    //         </div>
    //       </div>
    //       <p className="text-xs text-gray-400 mt-2">Tasks completed on time</p>
    //     </div>

    //     {/* Skill Distribution */}
    //     <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700">
    //       <h3 className="text-sm font-semibold text-blue-400 mb-2">
    //         SKILL DISTRIBUTION
    //       </h3>

    //       {/* Bar Chart with horizontal scroll */}
    //       <div className="mt-3 overflow-x-auto">
    //         <div
    //           style={{ width: `${skillsData.length * 60}px`, minWidth: "100%" }}
    //         >
    //           <ResponsiveContainer width="100%" height={120}>
    //             <BarChart data={skillsData}>
    //               <XAxis
    //                 dataKey="name"
    //                 tick={{ fill: "#ccc", fontSize: 10 }}
    //                 axisLine={false}
    //                 tickLine={false}
    //               />

    //               <Bar dataKey="value">
    //                 {skillsData.map((entry, index) => (
    //                   <Cell
    //                     key={`cell-${index}`}
    //                     fill={SKILL_COLORS[entry.name] || "#8884d8"}
    //                   />
    //                 ))}
    //               </Bar>
    //             </BarChart>
    //           </ResponsiveContainer>
    //         </div>
    //       </div>

    //       {/* Icon Grid Scrollable */}
    //       {/* <div className="mt-4 overflow-x-auto">
    //         <div className="flex gap-4 min-w-max">
    //           {skillsData.map((skill, index) => (
    //             <div key={index} className="flex flex-col items-center">
    //               <div className="p-2 rounded-lg bg-gray-700">
    //                 <SkillIcon name={skill.name} />
    //               </div>
    //               <span className="text-xs mt-1 text-gray-300">
    //                 {skill.name}
    //               </span>
    //             </div>
    //           ))}
    //         </div>
    //       </div> */}
    //     </div>
    //   </div>
    // </div>
    <div className="bg-[#1E1B26] rounded-2xl shadow-2xl p-8 font-['Poppins'] text-white">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
        🚀 Developer Analytics
      </h2>

      <div className="space-y-6">
        {/* RELIABILITY SCORE */}
        <div className="bg-[#2A2238]/80 backdrop-blur-md rounded-xl p-5 border border-[#3A2F4F] shadow-lg hover:shadow-orange-400/30 transition">
          <h3 className="text-sm font-semibold text-orange-300 mb-2">
            🛡️ RELIABILITY SCORE
          </h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-white">
              {reliabilityScore}%
            </span>
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: reliabilityScore },
                      { name: "Remaining", value: 100 - reliabilityScore },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    dataKey="value"
                  >
                    <Cell fill="#F97316" />
                    <Cell fill="#1F2937" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-orange-200 mt-2 italic">
            Based on project delivery and peer reviews
          </p>
        </div>

        {/* RESPONSE TIME */}
        {/* <div className="bg-[#2A2238]/80 backdrop-blur-md rounded-xl p-5 border border-[#3A2F4F] shadow-lg hover:shadow-green-500/30 transition">
          <h3 className="text-sm font-semibold text-green-300 mb-2">
            ⚡ AVG. RESPONSE TIME
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold">{responseTime}</span>
            <div className="text-green-400 text-xs bg-green-800/20 px-3 py-1 rounded-full">
              ▼ 12%
            </div>
          </div>
          <p className="text-xs text-green-200 mt-2 italic">
            Average time to respond to PRs and messages
          </p>
        </div> */}
        <div className="bg-[#2A2238]/80 backdrop-blur-md rounded-xl p-5 border border-[#3A2F4F] shadow-lg hover:shadow-green-500/30 transition">
          <h3 className="text-sm font-semibold text-green-300 mb-2">
            ⚡ AVG. RESPONSE TIME
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-white">
              {formatResponseTime(current)}
            </span>

            {changePercent !== null && (
              <div
                className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                  improved
                    ? "text-green-400 bg-green-800/20"
                    : "text-red-400 bg-red-800/20"
                }`}
              >
                {improved ? <FaArrowDown /> : <FaArrowUp />}
                <span>{changePercent}%</span>
              </div>
            )}
          </div>

          <p className="text-xs text-green-200 mt-2 italic">
            Average time to respond to messages and pull requests
          </p>
        </div>

        {/* TASK COMPLETION */}
        <div className="bg-[#2A2238]/80 backdrop-blur-md rounded-xl p-5 border border-[#3A2F4F] shadow-lg hover:shadow-blue-400/30 transition">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">
            ✅ TASK COMPLETION RATE
          </h3>
          <div className="flex items-center">
            <span className="text-4xl font-bold">{taskCompletion}%</span>
            <div className="ml-4 flex-1">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-sky-400 to-green-400 h-2.5 rounded-full"
                  style={{ width: `${taskCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-2 italic">
            Percentage of completed tasks on time
          </p>
        </div>

        {/* SKILL DISTRIBUTION */}
        <div className="bg-[#2A2238]/80 backdrop-blur-md rounded-xl p-5 border border-[#3A2F4F] shadow-lg hover:shadow-purple-400/30 transition">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">
            🧠 SKILL DISTRIBUTION
          </h3>
          <div className="mt-3 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
            <div
              style={{ width: `${skillsData.length * 60}px`, minWidth: "100%" }}
            >
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={skillsData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#E0E7FF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="value">
                    {skillsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SKILL_COLORS[entry.name] || "#7C3AED"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-purple-200 mt-2 italic">
            Technical expertise across domains
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDev;
