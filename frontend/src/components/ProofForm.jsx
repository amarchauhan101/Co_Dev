import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { IoClose, IoCloudUpload, IoDocument, IoCheckmarkCircle, IoRefresh } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

const ProofForm = ({ taskId, onSuccess, getAllTask, projectId }) => {
  const [note, setNote] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const users = user?.userWithToken;
  const token = users?.token;

  useEffect(() => {}, []);

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/zip" || file.name.endsWith('.zip')) {
        setZipFile(file);
      } else {
        alert("Please upload only .zip files");
      }
    }
  };

  // File input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setZipFile(file);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zipFile) return alert("Please upload a .zip file");

    try {
      setLoading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append("file", zipFile);
      formData.append("upload_preset", "task_proof_files");
      formData.append("folder", "taskProofs");

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dslgrbcs5/raw/upload",
        formData
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const fileUrl = uploadRes.data.secure_url;

      await axios.post(
        `http://localhost:8000/api/v1/task/${taskId}/proof`,
        { note, zipFile: fileUrl },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setIsSubmitted(true);
      setTimeout(() => {
        setNote("");
        setZipFile(null);
        setUploadProgress(0);
        setIsSubmitted(false);
        if (getAllTask) {
          getAllTask(projectId);
        }
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Error uploading proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl text-white overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Header with gradient border */}
        <div className="relative p-6 sm:p-8 border-b border-slate-700/50">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <IoCloudUpload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Submit Task Proof
              </h2>
              <p className="text-sm text-slate-400 mt-1">Upload your work and provide details</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Success state */}
          {isSubmitted && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-center">
                <IoCheckmarkCircle className="w-16 h-16 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                <p className="text-emerald-100">Your proof has been submitted successfully</p>
              </div>
            </div>
          )}

          {/* Description Input */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
              <IoDocument className="w-4 h-4 text-emerald-400" />
              <span>Work Description</span>
            </label>
            <div className="relative">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what you accomplished, challenges faced, and key learnings..."
                className="w-full p-4 rounded-2xl bg-slate-800/50 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none transition-all duration-300 placeholder-slate-400 min-h-[120px]"
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                {note.length}/500
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
              <IoCloudUpload className="w-4 h-4 text-emerald-400" />
              <span>Project Files (.zip)</span>
            </label>
            
            <div
              className={`relative p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                dragActive
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : zipFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('zipFile').click()}
            >
              <input
                id="zipFile"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              
              {zipFile ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IoDocument className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">{zipFile.name}</h3>
                  <p className="text-sm text-slate-400 mb-2">{formatFileSize(zipFile.size)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZipFile(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-600 transition-colors">
                    <IoCloudUpload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    {dragActive ? 'Drop your file here' : 'Upload your .zip file'}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-slate-500">
                    Max file size: 50MB • Only .zip files accepted
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Uploading...</span>
                <span className="text-emerald-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Submit Proof</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setNote("");
                setZipFile(null);
                setUploadProgress(0);
              }}
              className="px-6 py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:bg-slate-800/30"
            >
              <IoRefresh className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Bottom gradient border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
      </form>
    </div>
  );
};

export default ProofForm;
