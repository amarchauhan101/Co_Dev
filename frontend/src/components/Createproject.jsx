import React, { useEffect, useState } from "react";
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
        "http://localhost:8000/api/v1/create",
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
    const res = await axios.get("http://localhost:8000/api/v1/getproject", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log("res in getcreatedproject", res);
    if (res.status) {
      console.log("Project fetched successfully");
    }
  };

  return (
    <div className="p-10">
      <div
        onClick={() => setIsModalOpen(true)}
        className="p-2 bg-primary text-md font-semibold rounded-xl gap-2 border-[2px] border-zinc-200 cursor-pointer w-fit flex items-center"
      >
        <MdCreateNewFolder className="h-10 w-10 text-lime-500" />
        Create Project
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-lg p-4"
          >
            {/* Dialog */}
            <motion.div
              key="dialog"
              initial={{ y: 40, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-white via-violet-50 to-slate-50 shadow-2xl ring-1 ring-slate-200/60"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="font-extrabold text-lg text-violet-600 tracking-wide">
                  Create&nbsp;Project
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <span className="sr-only">Close</span>✕
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createprojecthandler();
                }}
                className="px-6 py-6 space-y-6"
              >
                {/* Project name */}
                <div>
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-slate-600 mb-1"
                  >
                    Project&nbsp;Name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Next‑gen AI dashboard"
                    className="
                      w-full px-3 py-2
                    
                      border-2
                      rounded-lg
                      outline-none
                      border-slate-300
                      focus:border-violet-500
                      focus:ring-2 focus:ring-violet-500 focus:ring-offset-1
                      text-sm placeholder-slate-400
                      transition duration-150 ease-in-out
                      text-slate-700
                    "
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-200/60 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300/70 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Createproject;
