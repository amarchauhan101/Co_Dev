import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import Createproject from "./components/Createproject";
import Getprojects from "./components/Getprojects";
import Getmyproject from "./components/Getmyproject";
import Chat from "./components/Chat";
import Protectedroute from "./components/Protectedroute";
import LocomotiveScroll from "locomotive-scroll";
import Profile from "./components/Profile";
import Projectupdate from "./components/Projectupdate";
import ReactGoogleMap from "./components/ReactGoogleMap";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteMapWithDetails from "./components/RouteMapWithDetails";
import MapWithDestination from "./components/MapWithDestination";
import PollutionApp from "./components/PollutionApp.jsx";
import "leaflet/dist/leaflet.css";
import "./../src/index.css";
import Developers from "./components/Developers.jsx";
import DeveloperProfile from "./components/DeveloperProfile.jsx";
import { useSelector } from "react-redux";
import { useState } from "react";
import Leaderboard from "./components/Leaderboard.jsx";
// import ProjectLiveSession from "./components/ProjectLiveSession.jsx";
import ProjectLiveSessionWrapper from "./components/ProjectLiveSessionWrapper.jsx";
import PrivateRoute from "./protectedRoute/PrivateRoute.jsx";
import VoiceChatTest from "./components/VoiceChatTest.jsx";
import VoiceChatDebug from "./components/VoiceChatDebug.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import ProjectManagement from "./pages/admin/ProjectManagement.jsx";
import TaskManagement from "./pages/admin/TaskManagement.jsx";
import RequestManagement from "./pages/admin/RequestManagement.jsx";
import AdminManagement from "./pages/admin/AdminManagement.jsx";
import CreateSuperAdmin from "./pages/admin/CreateSuperAdmin.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminRegister from "./pages/admin/AdminRegister.jsx";
import Registerwithinvitation from "./pages/admin/Registerwithinvitation.jsx";
// import UserDetails from "./pages/admin/UserDetails.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/Register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="/create" element={<Createproject />} />
        <Route path="/getallproject" element={<Getprojects />} />
        <Route path="/getproject" element={<Getmyproject />} />
        <Route path="/allusers" element={<Getmyproject />} />
        <Route path="/getproject/:projectId" element={<Chat />} />
        <Route path="/getprofile" element={<Profile />} />

        <Route
          path="/project/live/:projectId"
          element={<ProjectLiveSessionWrapper />}
        />

        <Route path="/voice-test" element={<VoiceChatTest />} />
        <Route path="/voice-debug" element={<VoiceChatDebug />} />

        {/* 404 etc. */}

        <Route path="/updateproject/:projectId" element={<Projectupdate />} />
        <Route path="/getallusers" element={<Developers />} />
        <Route path="/getdevprofile/:id" element={<DeveloperProfile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route
          path="/admin/firstsuperadmin"
          element={<CreateSuperAdmin />}
        />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register/:token" element={<Registerwithinvitation />} />
        <Route path="/admin/register" element={<Registerwithinvitation />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/projects" element={<ProjectManagement />} />
        <Route path="/admin/tasks" element={<TaskManagement />} />
        <Route path="/admin/requests" element={<RequestManagement />} />
        <Route path="/admin/admins" element={<AdminManagement />} />
        {/* <Route path="/admin/users/:userId" element={<UserDetails />} /> */}
      </Routes>
    </>
  );
}
//new

export default App;
