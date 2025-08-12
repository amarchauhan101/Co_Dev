// src/pages/ProjectLiveSessionWrapper.jsx
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import ProjectLiveSession from "../components/ProjectLiveSession";
import { initializeSocket } from "../config/socket";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const ProjectLiveSessionWrapper = () => {
  const { projectId } = useParams();                 //  ← URL param
  const {user} = useAuth();
  const users = user?.userWithToken;                 //  ← User data from context
  const token = users?.token;                     //  ← Token from user data

  // Initialise Socket.IO once
  useEffect(() => {
    initializeSocket(projectId, users?.token);
  }, [projectId, users?.token]);

  return <ProjectLiveSession projectId={projectId} />;
};

export default ProjectLiveSessionWrapper;
