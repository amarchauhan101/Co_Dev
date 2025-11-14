import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  Calendar,
  ChevronRight,
  Code,
  ExternalLink,
  Star,
  Clock,
  Filter,
  Grid3X3,
  List,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Getprojects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [hoveredCard, setHoveredCard] = useState(null);
    const {user } = useAuth();
    const token = user?.userWithToken?.token;

    useEffect(() => {
        const fetchData = async () => {
            console.log("my project token",token);
            try {
                const res = await axios.get("http://localhost:8000/api/v1/getallproject", {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                });
                console.log(res.data);
                setProjects(res.data.newproject);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects. Please try again later.");
                setLoading(false);
            }
        };
        if (token) {
            fetchData();
        }
    }, [token]);

    const filteredProjects = projects.filter(
        (project) =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Optimized ProjectCard component
    const ProjectCard = ({ project, index }) => {
        return (
            <div
                className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50"
                onMouseEnter={() => setHoveredCard(project._id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                    animationDelay: `${index * 100}ms`,
                }}
            >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300 flex items-center gap-2 truncate">
                                <Code size={20} className="text-purple-400 flex-shrink-0" />
                                <span className="truncate">{project.name}</span>
                            </h3>
                            <p className="text-slate-300 text-sm line-clamp-3 group-hover:text-slate-200 transition-colors duration-300">
                                {project.description || "No description available for this amazing project."}
                            </p>
                        </div>

                        <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg">
                                <Star size={12} className="text-yellow-400" />
                                <span>New</span>
                            </div>
                        </div>
                    </div>

                    {/* Creator info */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-medium text-white">
                            {project.owner?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-300">
                                Created by {project.owner?.username || 'Unknown'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Calendar size={10} />
                                <span>{formatDate(project.createdAt)}</span>
                            </div>
                        </div>
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

                    {/* Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Users size={14} className="text-purple-400" />
                            <span className="text-slate-300 font-medium">
                                {project.user?.length || 0} members
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} className="text-green-400" />
                            <span className="text-slate-300">Active</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-3">
                        <Link
                            to={`/project/${project._id}`}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-400/25 flex items-center justify-center gap-2 group"
                        >
                            Explore Project
                            <ChevronRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform duration-300"
                            />
                        </Link>

                        {project.liveUrl && (
                            <button
                                onClick={() => window.open(project.liveUrl, "_blank")}
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
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                        Discover Projects
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Explore incredible projects from our global community of creators and innovators
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Sparkles className="text-purple-400" size={20} />
                        <span className="text-slate-500 text-sm">
                            {projects.length} amazing projects to explore
                        </span>
                        <Sparkles className="text-pink-400" size={20} />
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
                            placeholder="Search projects by name or technology..."
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
                        className={`grid gap-6 ${
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
                        <p className="text-slate-500">Try adjusting your search criteria to discover amazing projects</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Getprojects;

//     const updateproject = async(projectId)=>{
//         try{
//             // const user = JSON.parse(localStorage.getItem("user"));
//             // const token = user?.userWithToken?.token;
//             const res = await axios.put("http://localhost:8000/api/v1/updateproject/:",{
//                 headers: {
//                     authorization: `Bearer ${token}`,
//                 },
//             });
//             console.log("res in update project=>",res);
//         }
//         catch(err){
//             console.log("Error in updateproject=>",err);
//         }
//     }

//     const handleAddUser = async (projectId) => {
//         // const token = localStorage.getItem('token');
//         try {
//             await axios.post(
//                 `http://localhost:8000/api/v1/projects/${projectId}/adduser`,
//                 { username: newUser },
//                 {
//                     headers: {
//                         authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             setProjects((prevProjects) =>
//                 prevProjects.map((project) =>
//                     project._id === projectId
//                         ? { ...project, users: project.users + 1 }
//                         : project
//                 )
//             );
//             setNewUser("");
//             setSelectedProject(null);
//         } catch (err) {
//             console.error("Error adding user:", err);
//         }
//     };

//     if (loading) {
//         return <div><Loader/></div>;
//     }

//     if (error) {
//         return <div className="text-red-500 h-screen w-full flex items-center justify-center">{error}</div>;
//     }  
  

//     return (
       
//         <div className="px-4 py-4 max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold text-white  text-center mb-12">
//           My Projects
//         </h1>
  
//         {projects.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {projects.map((project) => (
//               <div
//                 key={project._id}
//                 className="card relative overflow-hidden bg-gradient-to-br from-[#0a192f] to-[#0f3460] text-zinc-100 rounded-2xl p-6 w-full h-[340px] shadow-[0_0_25px_5px_rgba(0,55,128,0.6)] hover:shadow-2xl transition-all ease-in-out duration-500"
//               >
//                 <div className="content h-full flex flex-col justify-between">
//                   <div className="top flex items-start justify-between">
//                     <Link to={`/getproject/${project._id}`}>
//                       <div className="text-xl flex items-center gap-2 font-semibold hover:underline">
//                         <MdAssignment/>{project.name}
//                       </div>
//                       <p className="mt-4 text-sm text-gray-300">
//                         <span className="text-white font-bold font-mono">Users in project </span>: {project.user.length}
//                       </p>
//                     </Link>
//                     <GoPencil
//                       className="h-6 w-6 text-white hover:text-blue-300 cursor-pointer"
//                       onClick={() => navigate(`/updateproject/${project._id}`)}
//                     />
//                   </div>
  
//                   {/* <Tilt
//                     options={defaultOptions}
//                     className="mt-6 flex p-10 justify-center"
//                   >
//                     <Link
//                       to={`/getproject/${project._id}`}
//                       className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-200 transition"
//                     >
//                       Enter into project
//                     </Link>
//                   </Tilt> */}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center text-gray-600 mt-10">
//             No projects found.
//           </div>
//         )}
  
//         {/* User Modal */}
//         {/* {selectedProject && (
//           <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
//             <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm w-full">
//               <h2 className="text-xl font-bold mb-4">Add User to Project</h2>
//               <select
//                 className="w-full px-4 py-2 border rounded-lg mb-4"
//                 value={newUser}
//                 onChange={(e) => setNewUser(e.target.value)}
//               >
//                 <option value="">Select a User</option>
//                 {users.map((user) => (
//                   <option key={user._id} value={user._id}>
//                     {user.username}
//                   </option>
//                 ))}
//               </select>
//               <div className="flex space-x-4">
//                 <button
//                   className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                   onClick={() => handleAddUser(selectedProject)}
//                 >
//                   Add User
//                 </button>
//                 <button
//                   className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
//                   onClick={() => setSelectedProject(null)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )} */}
//       </div>
//     );
// }

// export default Getprojects;
