

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
    formState: { isSubmitting }
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
  const [formData, setFormData] = useState({
    description: "",
    technologies: "",
    liveDemoLink: "",
    repoName: "",
    owner: "",
    accessToken: "",
    defaultBranch: "main"
  });

  // Update form data on blur to avoid constant re-renders
  const updateFormData = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Calculate progress based on local state (only updates on blur)
  const completedFields = useMemo(() => {
    const fields = [];
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value.trim()) {
        fields.push(key);
      }
    });
    return new Set(fields);
  }, [formData]);

  const progressPercentage = useMemo(() => {
    return Math.round((completedFields.size / 7) * 100);
  }, [completedFields.size]);

  // Check if required fields are filled
  const requiredFieldsFilled = useMemo(() => {
    return formData.description && formData.description.trim() && 
           formData.technologies && formData.technologies.trim();
  }, [formData.description, formData.technologies]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleFieldFocus = useCallback((name) => {
    setFocusedField(name);
  }, []);

  const handleFieldBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const onSubmit = async (data) => {
    // Validate required fields
    if (!data.description || !data.description.trim()) {
      toast.error("Description is required!");
      return;
    }
    if (!data.technologies || !data.technologies.trim()) {
      toast.error("Technologies field is required!");
      return;
    }

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
        
        const projectData = {
          description: p.description || "",
          technologies: p.technologies || "",
          liveDemoLink: p.liveDemoLink || "",
          repoName: p.github?.repoName || "",
          owner: p.github?.owner || "",
          accessToken: p.github?.accessToken || "",
          defaultBranch: p.github?.defaultBranch || "main"
        };

        reset(projectData);
        setFormData(projectData); // Update local state too
      } catch (err) {
        setError("Failed to load project data.");
      }
    };

    fetchsingleProject();
  }, [projectId, token, loading, reset]);

 

  // Simple InputField component that doesn't cause re-renders
  const InputField = React.memo(({
    label,
    name,
    placeholder,
    type = "text",
    icon: Icon,
    required = false,
    multiline = false
  }) => {
    const isFocused = focusedField === name;
    const isCompleted = formData[name] && formData[name].trim() !== '';
    const Component = multiline ? "textarea" : "input";

    return (
      <div className="relative">
        <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
          isFocused ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className={isCompleted ? 'text-emerald-400' : ''} />}
            {label}
            {required && <span className="text-pink-400">*</span>}
            {isCompleted && (
              <Check size={16} className="text-emerald-400" />
            )}
          </div>
        </label>

        <div className="relative">
          <Component
            {...register(name, { 
              required,
              onBlur: (e) => updateFormData(name, e.target.value)
            })}
            onFocus={() => setFocusedField(name)}
            onBlur={(e) => {
              setFocusedField(null);
              updateFormData(name, e.target.value);
            }}
            type={type}
            placeholder={placeholder}
            rows={multiline ? 4 : undefined}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl 
              text-white placeholder-slate-500 transition-all duration-200 outline-none
              hover:bg-slate-800/70 focus:bg-slate-800/80
              ${isFocused 
                ? 'border-cyan-400 shadow-sm shadow-cyan-400/20' 
                : isCompleted 
                  ? 'border-emerald-400/70 shadow-sm shadow-emerald-400/10' 
                  : 'border-slate-600/50'
              }
              ${multiline ? 'resize-none' : ''}
            `}
          />
          
          {/* Completion indicator */}
          {isCompleted && !isFocused && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  });

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-800/50 border border-slate-600/50 
              text-slate-300 hover:text-white hover:border-cyan-400/50 transition-colors duration-200">
            <ChevronLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 
                bg-clip-text text-transparent">
              Update Project
            </h1>
            <p className="text-slate-400 mt-1">Enhance your project details with style</p>
          </div>

          <Sparkles className="ml-auto text-cyan-400" size={24} />
        </div>

        {/* Enhanced Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Form Completion</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-cyan-400 font-medium">
                {completedFields.size}/7 fields
              </span>
              <span className="text-sm text-cyan-400 font-medium">
                {progressPercentage}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-500 ease-out rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 0 && (
                <div className="absolute inset-0 bg-white/20 opacity-50 animate-pulse rounded-full"></div>
              )}
            </div>
          </div>
          {progressPercentage === 100 && (
            <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
              <Check size={14} />
              All fields completed! Ready to update.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-colors duration-200">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="text-cyan-400" size={20} />
                  Project Details
                  <span className="text-xs text-pink-400 bg-pink-400/10 px-2 py-1 rounded-full ml-2">Required</span>
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
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-colors duration-200">
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
              className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl 
                border border-slate-600/50 hover:bg-slate-600/50 hover:text-white 
                transition-colors duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !requiredFieldsFilled}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 
                flex items-center gap-2 ${
                requiredFieldsFilled 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400' 
                  : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : !requiredFieldsFilled ? (
                <>
                  <span className="text-pink-400">⚠</span>
                  Fill Required Fields
                </>
              ) : (
                <>
                  Update Project
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectUpdateForm;
