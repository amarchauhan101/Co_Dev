import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Getmyproject from "../components/Getmyproject";
import Createproject from "./Createproject";
import Getprojects from "./Getprojects";
import UserGuide from "./UserGuide";
import { CgProfile } from "react-icons/cg";

import { Link } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { updateUser } from "../../new/authslice";
import { FaBell } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useProject } from "../../context/ProjectContext";
import { useAuth } from "../../context/AuthContext";

// Define comprehensive guide steps that follow content flow
const guideSteps = [
  {
    selector: "#welcome-header",
    title: "Welcome to Your Dashboard! 👋",
    content: "This is your personal project dashboard where you'll manage all your collaborative work and track your progress. Let's explore all the amazing features available to you!",
    position: "bottom-center"
  },
  {
    selector: "#main-menu-button", 
    title: "Navigation Hub 🚀",
    content: "Your gateway to all app features! Click here to access your profile, browse projects, discover developers, check the leaderboard, and more. This menu adapts to your screen size for the best experience.",
    position: "bottom-right"
  },
  {
    selector: "#profile-link",
    title: "Your Profile Center 👤", 
    content: "Access your personal dashboard, update your information, manage settings, and customize your developer profile. This is where you showcase your skills and connect with others.",
    position: "bottom-left"
  },
  {
    selector: "#create-project-section .flex.items-center.gap-4",
    title: "Project Creation Hub ✨",
    content: "Start your next big idea here! This is where innovation begins. Create collaborative projects, set up teams, and bring your vision to life with powerful project management tools.",
    position: "top-center"
  },
  {
    selector: "#create-project-tools",
    title: "Project Creation Tools 🛠️",
    content: "Use these intuitive tools to set up your project. Define your goals, select technologies, invite team members, and configure your workspace - all in one place!",
    position: "top-center"
  },
  {
    selector: "#my-projects-section .flex.items-center.gap-4", 
    title: "Your Project Universe 🌟",
    content: "All your created and joined projects live here. This is your project command center where you can manage, track progress, and collaborate with team members across all your initiatives.",
    position: "top-center"
  },
  {
    selector: "#my-projects-dashboard",
    title: "Project Management Dashboard 📊",
    content: "Your personal project overview displays active projects, recent activity, team updates, and progress metrics. Stay organized and keep track of all your collaborative work.",
    position: "top-center"
  },
  {
    selector: "#all-projects-section .flex.items-center.gap-4",
    title: "Discover & Collaborate 🌍", 
    content: "Explore incredible projects from our global community of creators and innovators. Find new opportunities to contribute, learn from others, and expand your network!",
    position: "top-center"
  },
  {
    selector: "#community-projects-browser",
    title: "Community Projects 🤝",
    content: "Browse through community projects, filter by technology or interests, and join exciting collaborations. This is where you'll discover your next contribution opportunity!",
    position: "top-center"
  },
];

function Home() {
  const { user, loading, refreshUser } = useAuth();
  console.log("user in home=>", user);
  console.log("user in home=>", user.userWithToken.token);
  const token = user.userWithToken.token;
  const [menuopen, setmenuopen] = useState(false);
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [elementsReady, setElementsReady] = useState(false);
  const [userData, setUserData] = useState();
  const checkInterval = useRef(null);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const { reset } = useForm();
  const { Projects, addProject, fetchProjects } = useProject();

  const handleRespond = async (requestId, response) => {
    try {
      console.log("inside handlerespond");
      console.log("requestid", requestId);
      console.log("ressponse=>", response);
      const res = await axios.post(
        "http://localhost:8000/api/v1/request/respond",
        { requestId, response },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        toast.success(`Request ${response}`);
        setUserData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            requests: prev.profile.requests.filter((r) => r._id !== requestId),
          },
        }));
        if (userData.profile.requests.length === 1) setShowModal(false);
        console.log("Response handled successfully:", res.data);
        fetchProjects();
      }
    } catch (err) {
      toast.error(`Failed to ${response} request`);
    }
  };

  console.log("userdata after respond=>", userData);
  // Check if all required elements exist in the DOM
  useEffect(() => {
    if (!user || user.userWithToken.hascompletedGuideline !== false) return;

    const checkElements = () => {
      const allExist = guideSteps.every((step) => {
        const element = document.querySelector(step.selector);
        // Check if element exists and is actually visible (not just in DOM)
        return element && 
               element.offsetParent !== null && 
               element.getBoundingClientRect().width > 0 &&
               element.getBoundingClientRect().height > 0;
      });

      if (allExist) {
        clearInterval(checkInterval.current);
        setElementsReady(true);
        console.log("UserGuide: All elements are ready and visible");
      } else {
        const missingElements = guideSteps
          .filter(step => !document.querySelector(step.selector))
          .map(step => step.selector);
        if (missingElements.length > 0) {
          console.log("UserGuide: Missing elements:", missingElements);
        }
      }
    };

    // Initial check with longer delay to ensure DOM is fully ready
    const initialTimer = setTimeout(() => {
      checkElements();
      
      // If not all elements are ready, start polling with longer intervals
      if (!elementsReady) {
        checkInterval.current = setInterval(checkElements, 300);
        
        // Stop polling after 10 seconds to avoid infinite loops
        setTimeout(() => {
          if (checkInterval.current) {
            clearInterval(checkInterval.current);
            console.log("UserGuide: Stopped polling for elements after timeout");
          }
        }, 10000);
      }
    }, 1000); // Increased initial delay

    return () => {
      clearTimeout(initialTimer);
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [user, elementsReady]);

  // Start guide once elements are ready
  useEffect(() => {
    console.log("user in home=>", user);
    if (
      elementsReady &&
      user &&
      user.userWithToken.hascompletedGuideline == false
    ) {
      setIsGuideActive(true);
    }
  }, [elementsReady, user, user?.userWithToken.hascompletedGuideline]);

  const handleGuideComplete = async () => {
    if (isUpdating || !user) return;

    setIsUpdating(true);
    try {
      // Update guide completion status
      const res = await axios.put(
        `http://localhost:8000/api/v1/updateguide`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("res in handlecompled=>", res.data.data);
      
      // Refresh user data from server using AuthContext
      const refreshedUser = await refreshUser();
      if (refreshedUser) {
        console.log("User data refreshed successfully after guide completion");
      }
      
      // Also refresh projects
      fetchProjects();
      
    } catch (error) {
      console.error(
        "Update failed:",
        error.response?.data?.message || error.message
      );
    } finally {
      setIsGuideActive(false);
      setIsUpdating(false);
    }
  };

  console.log("userdate in the home=>", userData);
  useEffect(() => {
    const fetchProfile = async () => {
      console.log("userINfetchedprofile=>", token);
      try {
        const res = await axios.get("http://localhost:8000/api/v1/getprofile", {
          headers: { authorization: `Bearer ${token}` },
        });
        console.log("res in home=>", res.data);
        const users = res.data.userdata;
        console.log("user in side home is ", users);

        reset({
          ...users,
          profile: {
            ...users.profile,
            skills: users.profile?.skills?.join(", ") || "",
            social: users.profile?.social || {},
          },
        });

        setUserData(users);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        // setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  console.log("userdata in home=>", userData);

  return (
    <>
      {isGuideActive && userData.hascompletedGuideline==false && (
        <UserGuide
          steps={guideSteps}
          onComplete={handleGuideComplete}
          isLoading={isUpdating}
        />
      )}

      <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100 relative">
        <header className="w-full h-16 sm:h-20 flex items-center justify-between px-3 sm:px-6 bg-slate-900/80 shadow-md fixed top-0 left-0 right-0 z-50 border-b border-purple-500/20">
          <div className="flex items-center gap-2 sm:gap-6">
            <div
              id="main-menu-button"
              className="p-1.5 sm:p-2 rounded-full hover:bg-purple-500/20"
            >
              {!menuopen ? (
                <RiMenu2Line
                  onClick={() => setmenuopen(true)}
                  className="h-6 w-6 sm:h-7 sm:w-7 cursor-pointer text-purple-400 hover:text-purple-300"
                />
              ) : (
                <RxCross2
                  onClick={() => setmenuopen(false)}
                  className="h-6 w-6 sm:h-7 sm:w-7 cursor-pointer text-purple-400 hover:text-purple-300"
                />
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h1
                id="welcome-header"
                className="text-sm sm:text-xl lg:text-2xl font-bold text-white truncate max-w-[150px] sm:max-w-none"
              >
                Welcome back, {userData?.username}
              </h1>
            </div>
          </div>

          <div className="rightheader flex items-center gap-3 sm:gap-6">
            <div className="relative">
              <FaBell
                className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 cursor-pointer hover:text-purple-300"
                onClick={() => {
                  setShowModal(true);
                  console.log("modal is clickerd=>", showModal);
                }}
              />
              {userData?.profile?.requests?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold shadow-lg">
                  {userData?.profile.requests.length}
                </span>
              )}
            </div>

            <Link
              id="profile-link"
              to="/getprofile"
              className="cursor-pointer hover:opacity-80 block p-1.5 sm:p-2 rounded-full hover:bg-purple-500/20"
            >
              <CgProfile className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 hover:text-purple-300" />
            </Link>
          </div>
        </header>

        {menuopen && (
          <>
            {/* Mobile overlay for better contrast */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setmenuopen(false)}
            />

            {/* Sidebar */}
            <div
              className={`
        fixed top-20 left-0 h-full 
        glass-morhphism shadow-md border-r border-purple-500/30
        z-40 menu-slide-in
        transform transition-transform duration-300
        w-full sm:w-64 lg:w-80
      `}
            >
              <div className="p-8 space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-shimmer mb-2">
                    Navigation
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
                </div>

                <div className="space-y-4">
                  {[
                    { to: "/getprofile", label: "Profile", icon: "👤" },
                    { to: "/getproject", label: "My Projects", icon: "📁" },
                    { to: "/getallusers", label: "Developers", icon: "👥" },
                    { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
                    { to: "/login", label: "Logout", icon: "🚪" },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to={item.to}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 hover:transform hover:translate-x-2"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start pt-4 sm:pt-10 justify-center backdrop-blur-md bg-black/70 px-2 sm:px-4">
            <div className="glass-morphism shadow-2xl rounded-2xl sm:rounded-3xl w-full max-w-3xl p-4 sm:p-6 lg:p-8 relative neon-glow max-h-[90vh] overflow-y-auto">
              <button
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white rounded-full p-2 sm:p-3 shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-90"
                onClick={() => setShowModal(false)}
              >
                <RxCross2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>

              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-shimmer mb-3 sm:mb-4">
                  Project Collaboration Requests
                </h2>
                <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
              </div>

              {userData?.profile?.requests?.length > 0 ? (
                <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin pr-2 sm:pr-4">
                  {userData.profile.requests.map((request, index) => (
                    <div
                      key={index}
                      className="glass-morphism-light rounded-xl sm:rounded-2xl p-4 sm:p-6 hover-lift border border-purple-500/30 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />

                      <div className="relative z-[60]">
                        <div className="flex flex-col gap-3 mb-4">
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            {request.project?.name || "Untitled Project"}
                          </h3>
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full w-fit">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                            <span className="text-xs sm:text-sm text-purple-300">
                              from{" "}
                              <span className="font-semibold">
                                {request.sender?.username}
                              </span>
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                          {request.project?.description ||
                            "No description provided."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <button
                            onClick={() =>
                              handleRespond(request._id, "rejected")
                            }
                            className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 text-sm sm:text-base"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              ❌ Decline Request
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              handleRespond(request._id, "accepted")
                            }
                            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-green-500/50 text-sm sm:text-base"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              ✨ Accept & Collaborate
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-4">📭</div>
                  <p className="text-lg sm:text-xl text-gray-400">
                    No pending requests at the moment.
                  </p>
                  <p className="text-sm sm:text-base text-gray-500 mt-2">
                    New collaboration opportunities will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <main
          className={`pt-20 sm:pt-28 px-3 sm:px-6 pb-8 sm:pb-12 transition-all duration-500 ${
            menuopen ? "ml-64 sm:ml-72 lg:ml-80" : ""
          }`}
        >
          <div className="space-y-8 sm:space-y-12 w-full mx-auto">
            <section className="text-center mb-8 sm:mb-16">
              <div className="hero-gradient p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                    Build the Future
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto px-4">
                    Collaborate, create, and bring your ideas to life with our
                    powerful project management platform.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="create-project-section"
              className="bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-purple-500/30 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl">
                    <span className="text-xl sm:text-2xl">🚀</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-shimmer">
                    Launch Your Next Big Idea
                  </h2>
                </div>
                <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                  Transform your vision into reality. Start building
                  something amazing today.
                </p>
                <div id="create-project-tools">
                  <Createproject />
                </div>
              </div>
            </section>

           
              
            <section
              id="my-projects-section"
              className="bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-purple-500/30 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl">
                    <span className="text-xl sm:text-2xl">💼</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-shimmer">
                    Your Creative Universe
                  </h2>
                </div>
                <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                  Manage and track all your projects in one beautiful,
                  intuitive space.
                </p>
                <div id="my-projects-dashboard">
                  <Getmyproject/>
                </div>
              </div>
            </section>          

           
            <section
              id="all-projects-section"
              className="bg-slate-800 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-purple-500/30 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl sm:rounded-2xl">
                    <span className="text-xl sm:text-2xl">🌍</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-shimmer">
                    Discover & Collaborate
                  </h2>
                </div>
                <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                  Explore incredible projects from our global community of
                  creators and innovators.
                </p>
                <div id="community-projects-browser">
                  <Getprojects />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;