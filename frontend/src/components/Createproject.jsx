import React, { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoCreateSharp } from "react-icons/io5";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdCreateNewFolder } from "react-icons/md";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "../../context/ProjectContext";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

function Createproject() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();
  // const user = useSelector((state) => state.userauth?.user?.userWithToken);
  const {user } = useAuth();
  const token = user?.userWithToken?.token;
  console.log("token in createproject", token);
  console.log("user in createproject", user);
  const { Projects, addProject, fetchProjects } = useProject();
  console.log("Project in context in createproject", Projects);
  console.log("addproject", addProject);
  console.log("fetchedProject", fetchProjects);

  const createprojecthandler = async () => {
    try {
      // Handle project creation logic here
      console.log("Project Name:", projectName);
      // const users = localStorage.getItem("user");
      // const token = users?.userWithToken?.token;
      // console.log("token:", token);
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/create`,
        { name: projectName },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("below axios in createproject");
      console.log("res in create project", res);
      if (res.status) {
        Swal.fire({
          title: "Are you sure ?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, create it!",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Created!",
              text: "Your Project has been created.",
              icon: "success",
            });
          }
        });
        // navigate("/getproject");
      }
      addProject(res.data.project);
      setProjectName("");
      console.log("res in create porject=>", res);
      setIsModalOpen(false);
    } catch (err) {
      console.log("Error=>", err);
    }
  };

  const getcreatedproject = async () => {
    const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/getproject`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log("res in getcreatedproject", res);
    if (res.status) {
      console.log("Project fetched successfully");
    }
  };

  // Optimized handlers with useCallback
  const handleOpenModal = useCallback(() => {
    console.log("Button clicked, opening modal");
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <div className="relative">
        {/* Optimized Create Project Button */}
        <div
          onClick={handleOpenModal}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-purple-400/50"
        >
          {/* Simplified Background Animation */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          {/* Content */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <MdCreateNewFolder className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">Create New Project</div>
              <div className="text-sm text-purple-100">Start building something amazing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Modal - Using Portal */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 p-4"
            onClick={handleCloseModal}
          >
            {/* Simplified Dialog */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl border border-purple-500/30 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <MdCreateNewFolder className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Create New Project
                    </h2>
                    <p className="text-sm text-purple-300">Transform your vision into reality</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>

              {/* Optimized Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createprojecthandler();
                }}
                className="p-6 space-y-6"
              >
                {/* Project Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-semibold text-purple-200"
                  >
                    Project Name
                  </label>
                  <div className="relative">
                    <input
                      id="project-name"
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. AI-Powered Dashboard, Social Media App..."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white placeholder-slate-400 transition-colors duration-200 font-medium"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Choose a descriptive name that reflects your project's purpose
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 px-4 bg-slate-700/50 text-slate-300 rounded-xl font-semibold hover:bg-slate-600/50 hover:text-white transition-colors duration-200 border border-slate-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!projectName.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🚀 Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default Createproject;
