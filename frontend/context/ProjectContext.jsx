import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();
export const useProject = () => useContext(ProjectContext);
export const ProjectProvider = ({ children }) => {
  const [Projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  // const user = useSelector((state) => state.userauth?.user?.userWithToken);
  const { user } = useAuth();
  const token = user?.userWithToken?.token;
  console.log("user in project context", user);

   const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/getproject",
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      console.log("res.data.newproject", response.data.newproject);
      setProjects(response.data.newproject);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  };

  const addProject = (newproject) => {
    setProjects((prevProjects) => [...prevProjects, newproject]);
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return (
    <ProjectContext.Provider value={{ Projects, addProject, fetchProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};
