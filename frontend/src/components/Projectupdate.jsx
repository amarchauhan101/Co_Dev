// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import Loader from "./Loader";
// import { useSelector } from "react-redux";
// import { useAuth } from "../../context/AuthContext";

// function ProjectUpdateForm() {
//   const { projectId } = useParams();
//   const navigate = useNavigate();
//   const { register, handleSubmit, reset } = useForm();
//   // const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const {user,loading} = useAuth();
//   const users = user?.userWithToken;
//   const token = users?.token;

//   useEffect(() => {
//     const fetchProject = async () => {
//       try {
//         if(loading)return;
//         const res = await axios.get(
//           `http://localhost:8000/api/v1/getproject/${projectId}`,
//           { headers: { authorization: `Bearer ${token}` } }
//         );
//         console.log("res in update=>",res.data);
//         const p = res.data.projectdetail;
//         console.log("p=>",p);

//         reset({
//           description: p.description,
//           technologies: p.technologies,
//           liveDemoLink: p.liveDemoLink,
//           repoName: p.github?.repoName || "",
//           owner: p.github?.owner || "",
//           accessToken: p.github?.accessToken || "",
//           defaultBranch: p.github?.defaultBranch || "main",
//         });

//         // setLoading(false);
//       } catch (err) {
//         setError("Failed to fetch project data.",err);
//         console.log("err in fetched project data",err);
//         // setLoading(false);
//       }
//     };
//     fetchProject();
//   }, [projectId, reset, token,loading]);
//   if(loading){
//     return <Loader/>
//   }

//   const onSubmit = async (data) => {
//     try {
      
//       await axios.put(
//         `http://localhost:8000/api/v1/updateproject/${projectId}`,
//         data,
//         { headers: { authorization: `Bearer ${token}` } }
//       );
//       toast.success("Project updated successfully!");
//       navigate(-1);
//     } catch (err) {
//       toast.error("Failed to update project.");
//     }
//   };

//   if (loading) return <Loader />;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div className="bg-gradient-to-br h-screen flex items-center justify-center from-[#171717] to-[#64ffda] p-[2px] rounded-[22px]">
//       <div className="bg-[#171717] w-2/3 rounded-[20px]">
//         <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 px-8 pb-4 pt-8">
//           <p className="text-center text-[#64ffda] text-xl mb-4 font-medium">
//             Update Project Details
//           </p>

//           <textarea
//             required
//             placeholder="Project description"
//             {...register("description")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <textarea
//             required
//             placeholder="Technologies used"
//             {...register("technologies")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <input
//             type="text"
//             placeholder="Live Demo Link"
//             {...register("liveDemoLink")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <hr className="my-2 border-gray-700" />
//           <p className="text-[#64ffda] font-medium">GitHub Integration (optional)</p>

//           <input
//             type="text"
//             placeholder="GitHub Repo Name"
//             {...register("repoName")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <input
//             type="text"
//             placeholder="GitHub Owner Username"
//             {...register("owner")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <input
//             type="text"
//             placeholder="GitHub Access Token"
//             {...register("accessToken")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <input
//             type="text"
//             placeholder="Default Branch (e.g., main)"
//             {...register("defaultBranch")}
//             className="bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
//           />

//           <div className="flex justify-between mt-4">
//             <button
//               type="button"
//               onClick={() => navigate(-1)}
//               className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Update
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ProjectUpdateForm;


// import React, { useState, useEffect } from "react";
// import { ChevronLeft, Github, Globe, Code, Sparkles, Check, ArrowRight } from "lucide-react";

// function ProjectUpdateForm() {
//   const [formData, setFormData] = useState({
//     description: "",
//     technologies: "",
//     liveDemoLink: "",
//     repoName: "",
//     owner: "",
//     accessToken: "",
//     defaultBranch: "main"
//   });
  
//   const [focusedField, setFocusedField] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [step, setStep] = useState(1);
//   const [completedFields, setCompletedFields] = useState(new Set());

//   // Simulate loading initial data
//   useEffect(() => {
//     setTimeout(() => {
//       setFormData({
//         description: "A modern web application built with React and Node.js featuring real-time collaboration...",
//         technologies: "React, Node.js, MongoDB, Socket.io, Tailwind CSS",
//         liveDemoLink: "https://myproject-demo.com",
//         repoName: "awesome-project",
//         owner: "myusername",
//         accessToken: "",
//         defaultBranch: "main"
//       });
//     }, 1000);
//   }, []);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (value.trim()) {
//       setCompletedFields(prev => new Set([...prev, field]));
//     } else {
//       setCompletedFields(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(field);
//         return newSet;
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     setIsSubmitting(false);
    
//     // Success animation would trigger here
//     alert("Project updated successfully!");
//   };

//   const InputField = ({ 
//     label, 
//     field, 
//     type = "text", 
//     placeholder, 
//     required = false, 
//     multiline = false,
//     icon: Icon 
//   }) => {
//     const isCompleted = completedFields.has(field);
//     const isFocused = focusedField === field;
    
//     const Component = multiline ? "textarea" : "input";
    
//     return (
//       <div className="relative group">
//         <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
//           isFocused ? 'text-cyan-400' : 'text-slate-300'
//         }`}>
//           <div className="flex items-center gap-2">
//             {Icon && <Icon size={16} />}
//             {label}
//             {required && <span className="text-pink-400">*</span>}
//             {isCompleted && (
//               <Check size={16} className="text-emerald-400 animate-scale-in" />
//             )}
//           </div>
//         </label>
        
//         <div className="relative">
//           <Component
//             type={type}
//             value={formData[field]}
//             onChange={(e) => handleInputChange(field, e.target.value)}
//             onFocus={() => setFocusedField(field)}
//             onBlur={() => setFocusedField(null)}
//             placeholder={placeholder}
//             rows={multiline ? 4 : undefined}
//             className={`w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border rounded-xl 
//               text-white placeholder-slate-500 transition-all duration-300 outline-none
//               hover:bg-slate-800/70 focus:bg-slate-800/80
//               ${isFocused 
//                 ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 scale-[1.02]' 
//                 : isCompleted 
//                   ? 'border-emerald-400/50' 
//                   : 'border-slate-600/50'
//               }
//               ${multiline ? 'resize-none' : ''}
//             `}
//           />
          
//           {/* Animated border glow */}
//           <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
//             ${isFocused ? 'opacity-100' : 'opacity-0'}
//             bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-xl -z-10
//           `} />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
//       </div>

//       {/* Floating particles */}
//       <div className="absolute inset-0 pointer-events-none">
//         {[...Array(20)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 3}s`,
//               animationDuration: `${3 + Math.random() * 2}s`
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <button className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 
//             text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all duration-300
//             hover:scale-110 hover:shadow-lg hover:shadow-cyan-400/20">
//             <ChevronLeft size={20} />
//           </button>
          
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 
//               bg-clip-text text-transparent animate-gradient">
//               Update Project
//             </h1>
//             <p className="text-slate-400 mt-1">Enhance your project details with style</p>
//           </div>
          
//           <div className="ml-auto">
//             <Sparkles className="text-cyan-400 animate-pulse" size={24} />
//           </div>
//         </div>

//         {/* Progress indicator */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm text-slate-400">Progress</span>
//             <span className="text-sm text-cyan-400 font-medium">
//               {Math.round((completedFields.size / 7) * 100)}% Complete
//             </span>
//           </div>
//           <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
//             <div 
//               className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-700 ease-out rounded-full"
//               style={{ width: `${(completedFields.size / 7) * 100}%` }}
//             />
//           </div>
//         </div>

//         {/* Main Form */}
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Left Column - Project Details */}
//             <div className="space-y-6">
//               <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30
//                 hover:border-slate-500/50 transition-all duration-300">
//                 <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//                   <Code className="text-cyan-400" size={20} />
//                   Project Details
//                 </h3>
                
//                 <div className="space-y-4">
//                   <InputField
//                     label="Description"
//                     field="description"
//                     placeholder="Describe your amazing project..."
//                     required
//                     multiline
//                     icon={Code}
//                   />
                  
//                   <InputField
//                     label="Technologies"
//                     field="technologies"
//                     placeholder="React, Node.js, MongoDB..."
//                     required
//                     multiline
//                   />
                  
//                   <InputField
//                     label="Live Demo URL"
//                     field="liveDemoLink"
//                     placeholder="https://your-project-demo.com"
//                     icon={Globe}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - GitHub Integration */}
//             <div className="space-y-6">
//               <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30
//                 hover:border-slate-500/50 transition-all duration-300">
//                 <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//                   <Github className="text-purple-400" size={20} />
//                   GitHub Integration
//                   <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full ml-2">
//                     Optional
//                   </span>
//                 </h3>
                
//                 <div className="space-y-4">
//                   <InputField
//                     label="Repository Name"
//                     field="repoName"
//                     placeholder="awesome-project"
//                     icon={Github}
//                   />
                  
//                   <InputField
//                     label="Owner Username"
//                     field="owner"
//                     placeholder="your-github-username"
//                   />
                  
//                   <InputField
//                     label="Access Token"
//                     field="accessToken"
//                     type="password"
//                     placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
//                   />
                  
//                   <InputField
//                     label="Default Branch"
//                     field="defaultBranch"
//                     placeholder="main"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex items-center justify-between pt-6">
//             <button
//               type="button"
//               className="px-6 py-3 bg-slate-700/50 backdrop-blur-sm text-slate-300 rounded-xl 
//                 border border-slate-600/50 hover:bg-slate-600/50 hover:text-white 
//                 transition-all duration-300 hover:scale-105 hover:shadow-lg"
//             >
//               Cancel
//             </button>
            
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl 
//                 font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl 
//                 hover:shadow-cyan-400/25 disabled:opacity-50 disabled:cursor-not-allowed
//                 flex items-center gap-2 group"
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   Updating...
//                 </>
//               ) : (
//                 <>
//                   Update Project
//                   <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
        
//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
//           50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
//         }
        
//         @keyframes scale-in {
//           0% { transform: scale(0) rotate(-180deg); opacity: 0; }
//           100% { transform: scale(1) rotate(0deg); opacity: 1; }
//         }
        
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
        
//         .animate-float {
//           animation: float var(--duration, 3s) ease-in-out infinite;
//         }
        
//         .animate-scale-in {
//           animation: scale-in 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default ProjectUpdateForm;

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";
import { Code, Github, ChevronLeft, ArrowRight, Check, Globe, Sparkles } from "lucide-react";
import { useProject } from "../../context/ProjectContext";

function ProjectUpdateForm() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const token = user?.userWithToken?.token;
  const {projects,fetchProjects} = useProject();
  console.log("new project=>",projects);
  console.log("fetched project=>",fetchProjects);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, dirtyFields }
  } = useForm({
    defaultValues: {
      description: "",
      technologies: "",
      liveDemoLink: "",
      repoName: "",
      owner: "",
      accessToken: "",
      defaultBranch: "main"
    }
  }); 

  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);

  const completedFields = new Set(Object.keys(dirtyFields));
   const onSubmit = async (data) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/updateproject/${projectId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Project updated successfully!");
      await fetchProjects();
      navigate(-1);
      
    } catch (err) {
      toast.error("Failed to update project.");
    }
  };

  useEffect(() => {
    const fetchsingleProject = async () => {
      if (loading) return;

      try {
        const res = await axios.get(`http://localhost:8000/api/v1/getproject/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const p = res.data.projectdetail;

        reset({
          description: p.description || "",
          technologies: p.technologies || "",
          liveDemoLink: p.liveDemoLink || "",
          repoName: p.github?.repoName || "",
          owner: p.github?.owner || "",
          accessToken: p.github?.accessToken || "",
          defaultBranch: p.github?.defaultBranch || "main"
        });
      } catch (err) {
        setError("Failed to load project data.");
      }
    };

    fetchsingleProject();
  }, [projectId, token, loading, reset]);

 

  const InputField = ({
    label,
    name,
    placeholder,
    type = "text",
    icon: Icon,
    required = false,
    multiline = false
  }) => {
    const isFocused = focusedField === name;
    const isCompleted = completedFields.has(name);
    const Component = multiline ? "textarea" : "input";

    return (
      <div className="relative group">
        <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${isFocused ? 'text-cyan-400' : 'text-slate-300'}`}>
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} />}
            {label}
            {required && <span className="text-pink-400">*</span>}
            {isCompleted && (
              <Check size={16} className="text-emerald-400 animate-scale-in" />
            )}
          </div>
        </label>

        <div className="relative">
          <Component
            {...register(name, { required })}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            type={type}
            placeholder={placeholder}
            rows={multiline ? 4 : undefined}
            className={`w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border rounded-xl 
              text-white placeholder-slate-500 transition-all duration-300 outline-none
              hover:bg-slate-800/70 focus:bg-slate-800/80
              ${isFocused 
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/20 scale-[1.02]' 
                : isCompleted 
                  ? 'border-emerald-400/50' 
                  : 'border-slate-600/50'
              }
              ${multiline ? 'resize-none' : ''}
            `}
          />

          {/* Animated border glow */}
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
            ${isFocused ? 'opacity-100' : 'opacity-0'}
            bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 blur-xl -z-10
          `} />
        </div>
      </div>
    );
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 
              text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all duration-300
              hover:scale-110 hover:shadow-lg hover:shadow-cyan-400/20">
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 
                bg-clip-text text-transparent animate-gradient">
              Update Project
            </h1>
            <p className="text-slate-400 mt-1">Enhance your project details with style</p>
          </div>

          <Sparkles className="ml-auto text-cyan-400 animate-pulse" size={24} />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm text-cyan-400 font-medium">
              {Math.round((completedFields.size / 7) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${(completedFields.size / 7) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="text-cyan-400" size={20} />
                  Project Details
                </h3>
                <div className="space-y-4">
                  <InputField name="description" label="Description" required multiline placeholder="Describe your project..." icon={Code} />
                  <InputField name="technologies" label="Technologies" required multiline placeholder="React, Node.js, MongoDB..." />
                  <InputField name="liveDemoLink" label="Live Demo Link" placeholder="https://demo.com" icon={Globe} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Github className="text-purple-400" size={20} />
                  GitHub Integration
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full ml-2">Optional</span>
                </h3>
                <div className="space-y-4">
                  <InputField name="repoName" label="Repository Name" placeholder="awesome-project" icon={Github} />
                  <InputField name="owner" label="Owner Username" placeholder="your-username" />
                  <InputField name="accessToken" label="Access Token" type="password" placeholder="ghp_xxxxxx" />
                  <InputField name="defaultBranch" label="Default Branch" placeholder="main" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-700/50 backdrop-blur-sm text-slate-300 rounded-xl 
                border border-slate-600/50 hover:bg-slate-600/50 hover:text-white 
                transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl 
                font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl 
                hover:shadow-cyan-400/25 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update Project
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes scale-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-float {
          animation: float var(--duration, 3s) ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ProjectUpdateForm;
