import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loader from './Loader';
import { GoPencil } from "react-icons/go";
import { Link } from 'react-router-dom';
import { MdAssignment } from "react-icons/md";
import { useAuth } from '../../context/AuthContext';

function Getprojects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newUser, setNewUser] = useState("");
    const {user } = useAuth();
    const token = user?.userWithToken?.token;


    useEffect(() => {
        const fetchData = async () => {
            // const user = JSON.parse(localStorage.getItem("user"));
            // const token = user?.userWithToken?.token;
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
        fetchData();
    }, []);

    const updateproject = async(projectId)=>{
        try{
            // const user = JSON.parse(localStorage.getItem("user"));
            // const token = user?.userWithToken?.token;
            const res = await axios.put("http://localhost:8000/api/v1/updateproject/:",{
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });
            console.log("res in update project=>",res);
        }
        catch(err){
            console.log("Error in updateproject=>",err);
        }
    }

    const handleAddUser = async (projectId) => {
        // const token = localStorage.getItem('token');
        try {
            await axios.post(
                `http://localhost:8000/api/v1/projects/${projectId}/adduser`,
                { username: newUser },
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project._id === projectId
                        ? { ...project, users: project.users + 1 }
                        : project
                )
            );
            setNewUser("");
            setSelectedProject(null);
        } catch (err) {
            console.error("Error adding user:", err);
        }
    };

    if (loading) {
        return <div><Loader/></div>;
    }

    if (error) {
        return <div className="text-red-500 h-screen w-full flex items-center justify-center">{error}</div>;
    }   

    return (
        // <div className="p-4 max-w-6xl mx-auto">
        //     <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">All Projects</h1>

        //     {projects.length > 0 ? (
        //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        //             {projects.map((project) => (
        //                 <div key={project._id} className="p-6 border rounded-lg shadow-lg bg-gradient-to-r from-green-400 to-blue-500 text-white">
        //                     <h3 className="text-lg font-semibold">{project.name}</h3>
        //                     <p className="mt-2">Users: {project.user.length}</p>
        //                     {/* <button
        //                         className="mt-4 w-full px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-200"
        //                         onClick={() => setSelectedProject(project._id)}
        //                     >
        //                         Add User
        //                     </button> */}
        //                 </div>
        //             ))}
        //         </div>
        //     ) : (
        //         <div className="text-center text-gray-600">No projects found.</div>
        //     )}

        // </div>
        <div className="px-4 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white  text-center mb-12">
          My Projects
        </h1>
  
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
                className="card relative overflow-hidden bg-gradient-to-br from-[#0a192f] to-[#0f3460] text-zinc-100 rounded-2xl p-6 w-full h-[340px] shadow-[0_0_25px_5px_rgba(0,55,128,0.6)] hover:shadow-2xl transition-all ease-in-out duration-500"
              >
                <div className="content h-full flex flex-col justify-between">
                  <div className="top flex items-start justify-between">
                    <Link to={`/getproject/${project._id}`}>
                      <div className="text-xl flex items-center gap-2 font-semibold hover:underline">
                        <MdAssignment/>{project.name}
                      </div>
                      <p className="mt-4 text-sm text-gray-300">
                        <span className="text-white font-bold font-mono">Users in project </span>: {project.user.length}
                      </p>
                    </Link>
                    <GoPencil
                      className="h-6 w-6 text-white hover:text-blue-300 cursor-pointer"
                      onClick={() => navigate(`/updateproject/${project._id}`)}
                    />
                  </div>
  
                  {/* <Tilt
                    options={defaultOptions}
                    className="mt-6 flex p-10 justify-center"
                  >
                    <Link
                      to={`/getproject/${project._id}`}
                      className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-200 transition"
                    >
                      Enter into project
                    </Link>
                  </Tilt> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 mt-10">
            No projects found.
          </div>
        )}
  
        {/* User Modal */}
        {/* {selectedProject && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Add User to Project</h2>
              <select
                className="w-full px-4 py-2 border rounded-lg mb-4"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              >
                <option value="">Select a User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <div className="flex space-x-4">
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => handleAddUser(selectedProject)}
                >
                  Add User
                </button>
                <button
                  className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  onClick={() => setSelectedProject(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    );
}

export default Getprojects;
