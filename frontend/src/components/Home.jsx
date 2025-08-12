// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import Getmyproject from "../components/Getmyproject";
// import Createproject from "./Createproject";
// import Getprojects from "./Getprojects";
// import UserGuide from "./UserGuide";
// import { CgProfile } from "react-icons/cg";
// import { Link } from "react-router-dom";
// import { RiMenu2Line } from "react-icons/ri";
// import { RxCross2 } from "react-icons/rx";
// import { updateUser } from "../../new/authslice";
// import { FaBell } from "react-icons/fa";
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { useProject } from "../../context/ProjectContext";
// import { useAuth } from "../../context/AuthContext";

// // Define steps outside component to prevent re-creation on every render
// const guideSteps = [
//   {
//     selector: "#welcome-header",
//     title: "Welcome!",
//     content:
//       "This is your project dashboard where you'll manage all your work.",
//   },
//   {
//     selector: "#profile-link",
//     title: "Your Profile",
//     content: "Access your personal information and settings here.",
//   },
//   {
//     selector: "#create-project-section",
//     title: "Create Projects",
//     content: "Start new projects from scratch using this section.",
//   },
//   {
//     selector: "#my-projects-section",
//     title: "Your Projects",
//     content: "All projects you've created appear here for quick access.",
//   },
//   // {
//   //   selector: '#all-projects-section',
//   //   title: 'Explore',
//   //   content: 'Discover projects created by other users in the community.'
//   // },
//   {
//     selector: "#main-menu-button",
//     title: "Navigation",
//     content: "Access all app features through this menu.",
//   },
// ];

// function Home() {
//   // const { userWithToken } = useSelector((state) => state.userauth?.user || {});

//   // const user = userWithToken;
//   const {user,loading} = useAuth();
//   console.log("user in home=>", user);
//   console.log("user in home=>", user.userWithToken.token);
//   const token = user.userWithToken.token;
//   const [menuopen, setmenuopen] = useState(false);
//   const [isGuideActive, setIsGuideActive] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [elementsReady, setElementsReady] = useState(false);
//   const [userData, setUserData] = useState();
//   const checkInterval = useRef(null);
//   const dispatch = useDispatch();
//   const [showModal, setShowModal] = useState(false);
//   const { reset } = useForm();
//   const { Projects, addProject, fetchProjects } = useProject();

//   const handleRespond = async (requestId, response) => {
//     try {
//       console.log("inside handlerespond");
//       console.log("requestid", requestId);
//       console.log("ressponse=>", response);
//       const res = await axios.post(
//         "http://localhost:8000/api/v1/request/respond",
//         { requestId, response },
//         { headers: { authorization: `Bearer ${token}` } }
//       );

//       if (res.status === 200) {
//         toast.success(`Request ${response}`);
//         setUserData((prev) => ({
//           ...prev,
//           profile: {
//             ...prev.profile,
//             requests: prev.profile.requests.filter((r) => r._id !== requestId),
//           },
//         }));
//         if (userData.profile.requests.length === 1) setShowModal(false);
//         console.log("Response handled successfully:", res.data);
//         fetchProjects();
//       }
//     } catch (err) {
//       toast.error(`Failed to ${response} request`);
//     }
//   };

//   console.log("userdata after respond=>", userData);
//   // Check if all required elements exist in the DOM
//   useEffect(() => {
//     if (!user || user.userWithToken.hascompletedGuideline !== false) return;

//     const checkElements = () => {
//       const allExist = guideSteps.every((step) =>
//         document.querySelector(step.selector)
//       );

//       if (allExist) {
//         clearInterval(checkInterval.current);
//         setElementsReady(true);
//       }
//     };

//     // Initial check
//     checkElements();

//     // If not all elements are ready, start polling
//     if (!elementsReady) {
//       checkInterval.current = setInterval(checkElements, 100);
//     }

//     return () => {
//       if (checkInterval.current) {
//         clearInterval(checkInterval.current);
//       }
//     };
//   }, [user, elementsReady]);

//   // Start guide once elements are ready
//   useEffect(() => {
//     console.log("user in home=>", user);
//     if (elementsReady && user && user.userWithToken.hascompletedGuideline === false) {
//       setIsGuideActive(true);
//     }
//   }, [elementsReady, user]);

//   const handleGuideComplete = async () => {
//     if (isUpdating || !user) return;

//     setIsUpdating(true);
//     try {
//       const res = await axios.put(
//         `http://localhost:8000/api/v1/updateguide`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("res in handlecompled=>", res.data.data);
//       dispatch(updateUser(res?.data?.data));
//     } catch (error) {
//       console.error(
//         "Update failed:",
//         error.response?.data?.message || error.message
//       );
//     } finally {
//       setIsGuideActive(false);
//       setIsUpdating(false);
//     }
//   };

//   useEffect(() => {
//     const fetchProfile = async () => {
//       console.log("userINfetchedprofile=>", token);
//       try {
//         const res = await axios.get("http://localhost:8000/api/v1/getprofile", {
//           headers: { authorization: `Bearer ${token}` },
//         });
//         console.log("res in home=>", res.data);
//         const users = res.data.userdata;
//         console.log("user in side home is ", users);

//         reset({
//           ...users,
//           profile: {
//             ...users.profile,
//             skills: users.profile?.skills?.join(", ") || "",
//             social: users.profile?.social || {},
//           },
//         });

//         setUserData(users);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching profile:", err);
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, []);

//   console.log("userdata in home=>", userData);
//   return (
//     <>
//       <style>{`
//         .tour-highlight {
//           box-shadow: 0 0 0 3px #8B5CF6;
//           border-radius: 8px;
//           transition: all 0.3s ease;
//           z-index: 999;
//           position: relative;
//           animation: pulse 2s infinite;
//         }

//         @keyframes pulse {
//           0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
//           70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
//           100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
//         }
//       `}</style>

//       {isGuideActive && (
//         <UserGuide
//           steps={guideSteps}
//           onComplete={handleGuideComplete}
//           isLoading={isUpdating}
//         />
//       )}

//       <div className="min-h-screen bg-[#1E1E2F] text-gray-200">
//         <header className="w-full h-20 flex items-center justify-between px-6 bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-50">
//           <div className="flex items-center gap-4">
//             <div id="main-menu-button" className="p-1">
//               {!menuopen ? (
//                 <RiMenu2Line
//                   onClick={() => setmenuopen(true)}
//                   className="h-6 w-6 cursor-pointer text-purple-400 hover:text-purple-300 transition-colors"
//                 />
//               ) : (
//                 <RxCross2
//                   onClick={() => setmenuopen(false)}
//                   className="h-6 w-6 cursor-pointer text-purple-400 hover:text-purple-300 transition-colors"
//                 />
//               )}
//             </div>
//             <h1
//               id="welcome-header"
//               className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
//             >
//               Welcome {user?.username}
//             </h1>
//           </div>

//           <div className="rightheader flex items-center gap-4 sm:gap-8">
//             <div className="relative">
//               <FaBell
//                 className="h-6 w-6 text-purple-400 cursor-pointer"
//                 onClick={() => setShowModal(true)}
//               />
//               {userData?.profile?.requests?.length > 0 && (
//                 <span className="absolute top-[-4px] right-[-6px] bg-red-500 text-white text-xs rounded-full px-1">
//                   {userData?.profile.requests.length}
//                 </span>
//               )}
//             </div>
//             <div id="profile-link" className="p-1">
//               <Link
//                 to="/getprofile"
//                 className="cursor-pointer hover:opacity-80 transition-opacity"
//               >
//                 <CgProfile className="h-8 w-8 text-purple-400" />
//               </Link>
//             </div>
//           </div>
//         </header>

//         {menuopen && (
//           <div className="fixed top-20 left-0 w-64 h-full bg-gray-800 shadow-lg z-40 p-6 space-y-4 transition-all duration-300">
//             <p className="text-lg font-semibold text-purple-400">Menu</p>
//             <Link
//               to="/getprofile"
//               className="block hover:text-indigo-400 transition-colors"
//             >
//               Profile
//             </Link>
//             <Link
//               to="/getproject"
//               className="block hover:text-indigo-400 transition-colors"
//             >
//               My Projects
//             </Link>
//             <Link
//               to="/getallusers"
//               className="block hover:text-indigo-400 transition-colors"
//             >
//               Developers
//             </Link>
//             <Link
//               to="/leaderboard"
//               className="block hover:text-indigo-400 transition-colors"
//             >
//               Leaderboard
//             </Link>
//             <Link
//               to="/login"
//               className="block hover:text-indigo-400 transition-colors"
//             >
//               Logout
//             </Link>
//           </div>
//         )}

//         {showModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 px-2 sm:px-4">
//             <div className="bg-[#1E1E2F] border border-gray-700 shadow-2xl rounded-2xl w-full max-w-2xl p-4 sm:p-6 relative">
//               {/* Close Icon Button */}
//               <button
//                 className="absolute -top-4 -right-4 sm:top-4 sm:right-6 bg-gray-800 hover:bg-red-500 text-white rounded-full p-2 shadow-md transition duration-200"
//                 onClick={() => setShowModal(false)}
//               >
//                 <RxCross2 className="w-5 h-5" />
//               </button>

//               {/* Modal Heading */}
//               <h2 className="text-xl sm:text-2xl font-bold text-purple-400 mb-4 sm:mb-6 text-center tracking-wide">
//                 Incoming Project Requests
//               </h2>

//               {/* Request List */}
//               {userData?.profile?.requests?.length > 0 ? (
//                 <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
//                   {userData.profile.requests.map((request, index) => (
//                     <div
//                       key={index}
//                       className="bg-[#2A2A40] border border-gray-600 rounded-xl p-4 sm:p-5 transition-shadow shadow-md hover:shadow-purple-500/20"
//                     >
//                       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
//                         <h3 className="text-base sm:text-lg font-semibold text-white">
//                           {request.project?.name || "Untitled Project"}
//                         </h3>
//                         <span className="text-sm text-gray-400">
//                           from{" "}
//                           <span className="text-purple-400">
//                             {request.sender?.username}
//                           </span>
//                         </span>
//                       </div>
//                       <p className="text-gray-300 text-sm mb-3">
//                         {request.project?.description ||
//                           "No description provided."}
//                       </p>
//                       <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
//                         <button
//                           onClick={() => handleRespond(request._id, "rejected")}
//                           className="bg-gradient-to-tr from-red-500 to-pink-500 hover:brightness-110 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-red-500/40 transition w-full sm:w-auto"
//                         >
//                           ❌ Reject
//                         </button>
//                         <button
//                           onClick={() => handleRespond(request._id, "accepted")}
//                           className="bg-gradient-to-tr from-green-500 to-emerald-400 hover:brightness-110 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-green-500/40 transition w-full sm:w-auto"
//                         >
//                           ✔️ Accept
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-center text-gray-400">
//                   No pending requests at the moment.
//                 </p>
//               )}
//             </div>
//           </div>
//         )}

//         <main
//           className={`pt-24 px-4 pb-10 transition-all duration-300 ${
//             menuopen ? "ml-0 md:ml-64" : ""
//           }`}
//         >
//           <div className="space-y-10 max-w-6xl mx-auto">
//             <section
//               id="create-project-section"
//               className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
//             >
//               <h2 className="text-xl font-semibold mb-4 text-purple-400">
//                 Create a New Project
//               </h2>
//               <Createproject />
//             </section>

//             <section
//               id="my-projects-section"
//               className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
//             >
//               <h2 className="text-xl font-semibold mb-4 text-purple-400">
//                 My Projects
//               </h2>
//               <Getmyproject />
//             </section>

//             <section
//               id="all-projects-section"
//               className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
//             >
//               <h2 className="text-xl font-semibold mb-4 text-purple-400">
//                 All Projects
//               </h2>
//               <Getprojects />
//             </section>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }

// export default Home;

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
import { InView } from "react-intersection-observer";

// Define steps outside component to prevent re-creation on every render
const guideSteps = [
  {
    selector: "#welcome-header",
    title: "Welcome!",
    content:
      "This is your project dashboard where you'll manage all your work.",
  },
  {
    selector: "#profile-link",
    title: "Your Profile",
    content: "Access your personal information and settings here.",
  },
  {
    selector: "#create-project-section",
    title: "Create Projects",
    content: "Start new projects from scratch using this section.",
  },
  {
    selector: "#my-projects-section",
    title: "Your Projects",
    content: "All projects you've created appear here for quick access.",
  },
  {
    selector: "#main-menu-button",
    title: "Navigation",
    content: "Access all app features through this menu.",
  },
];

function Home() {
  const { user, loading } = useAuth();
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
      const allExist = guideSteps.every((step) =>
        document.querySelector(step.selector)
      );

      if (allExist) {
        clearInterval(checkInterval.current);
        setElementsReady(true);
      }
    };

    // Initial check
    checkElements();

    // If not all elements are ready, start polling
    if (!elementsReady) {
      checkInterval.current = setInterval(checkElements, 100);
    }

    return () => {
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
      user.userWithToken.hascompletedGuideline === false
    ) {
      setIsGuideActive(true);
    }
  }, [elementsReady, user]);

  const handleGuideComplete = async () => {
    if (isUpdating || !user) return;

    setIsUpdating(true);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/updateguide`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("res in handlecompled=>", res.data.data);
      dispatch(updateUser(res?.data?.data));
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
      {/* <style>{`
  .tour-highlight {
    box-shadow: 0 0 0 3px #8B5CF6;
    border-radius: 8px;
    z-index: 999;
    position: relative;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.6); }
    70% { box-shadow: 0 0 0 8px rgba(139, 92, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
  }

  .floating-orbs::before,
  .floating-orbs::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    z-index: -1;
  }

  .floating-orbs::before {
    top: -10%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.05), transparent 70%);
    animation: float 25s ease-in-out infinite;
  }

  .floating-orbs::after {
    top: 40%;
    right: -15%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.05), transparent 70%);
    animation: float 30s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-20px) translateX(15px); }
  }

  .glass-morphism {
    background: rgba(30, 30, 47, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.4) transparent;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.4);
    border-radius: 4px;
  }

  .hero-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-size: 200% 200%;
    animation: gradientShift 10s ease infinite;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
  }

  .text-shimmer {
    background: linear-gradient(45deg, #8B5CF6, #EC4899, #3B82F6, #8B5CF6);
    background-size: 250% 250%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .notification-badge {
    animation: bounceIn 0.5s ease-out;
  }

  @keyframes bounceIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`}</style> */}

      {isGuideActive && (
        <UserGuide
          steps={guideSteps}
          onComplete={handleGuideComplete}
          isLoading={isUpdating}
        />
      )}

      <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100 floating-orbs relative">
        {/* <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              radial-gradient(circle at 25px 25px, rgba(139, 92, 246, 0.2) 2px, transparent 0),
              radial-gradient(circle at 75px 75px, rgba(236, 72, 153, 0.2) 2px, transparent 0)
            `,
              backgroundSize: "100px 100px",
              animation: "float 30s linear infinite",
            }}
          />
        </div> */}

        <header className="w-full h-20 flex items-center justify-between px-6 glass-morphism shadow-md fixed top-0 left-0 right-0 z-50 border-b border-purple-500/20">
          <div className="flex items-center gap-6">
            <div
              id="main-menu-button"
              className="p-2 rounded-full hover:bg-purple-500/20 transition-all duration-300"
            >
              {!menuopen ? (
                <RiMenu2Line
                  onClick={() => setmenuopen(true)}
                  className="h-7 w-7 cursor-pointer text-purple-400 hover:text-purple-300 transition-transform duration-150 hover:scale-110"
                />
              ) : (
                <RxCross2
                  onClick={() => setmenuopen(false)}
                  className="h-7 w-7 cursor-pointer text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:rotate-90"
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <h1
                id="welcome-header"
                className="text-2xl font-bold text-shimmer"
              >
                Welcome back, {userData?.username}
              </h1>
            </div>
          </div>

          <div className="rightheader flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-75 blur transition-all duration-300" />
              <div className="relative">
                <FaBell
                  className="h-6 w-6 text-purple-400 cursor-pointer hover:text-purple-300 transition-all duration-300 hover:scale-110"
                  onClick={() => {
                    setShowModal(true);
                    console.log("modal is clickerd=>", showModal);
                  }}
                />
                {userData?.profile?.requests?.length > 0 && (
                  <span className="notification-badge absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {userData?.profile.requests.length}
                  </span>
                )}
              </div>
            </div>

            <div id="profile-link" className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-75 blur transition-all duration-300" />
              <Link
                to="/getprofile"
                className="relative cursor-pointer hover:opacity-80 transition-all duration-300 block p-2 rounded-full hover:bg-purple-500/20"
              >
                <CgProfile className="h-8 w-8 text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-110" />
              </Link>
            </div>
          </div>
        </header>

        {/* {menuopen && (
          <div className="fixed top-20 left-0 w-80 h-full glass-morhphism shadow-md z-40 menu-slide-in border-r border-purple-500/30">
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
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 hover:transform hover:translateX-2"
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
          
        )} */}
        {menuopen && (
          <>
            {/* Mobile overlay for better contrast */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setMenuopen(false)}
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
          <div className="fixed inset-0 z-50 flex items-start pt-10 justify-center backdrop-blur-md bg-black/70 px-4">
            <div className="glass-morphism shadow-2xl rounded-3xl w-full max-w-3xl p-8 relative neon-glow">
              <button
                className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-90"
                onClick={() => setShowModal(false)}
              >
                <RxCross2 className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-shimmer mb-4">
                  Project Collaboration Requests
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
              </div>

              {userData?.profile?.requests?.length > 0 ? (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin pr-4">
                  {userData.profile.requests.map((request, index) => (
                    <div
                      key={index}
                      className="glass-morphism-light rounded-2xl p-6 hover-lift border border-purple-500/30 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -mr-10 -mt-10" />

                      <div className="relative z-[60]">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-3">
                          <h3 className="text-xl font-bold text-white">
                            {request.project?.name || "Untitled Project"}
                          </h3>
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                            <span className="text-sm text-purple-300">
                              from{" "}
                              <span className="font-semibold">
                                {request.sender?.username}
                              </span>
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-300 text-base mb-6 leading-relaxed">
                          {request.project?.description ||
                            "No description provided."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                          <button
                            onClick={() =>
                              handleRespond(request._id, "rejected")
                            }
                            className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-red-500/50"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              ❌ Decline Request
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              handleRespond(request._id, "accepted")
                            }
                            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-green-500/50"
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
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-xl text-gray-400">
                    No pending requests at the moment.
                  </p>
                  <p className="text-gray-500 mt-2">
                    New collaboration opportunities will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <main
          className={`pt-28 px-6 pb-12 transition-all duration-500 ${
            menuopen ? "ml-0 lg:ml-80" : ""
          }`}
        >
          <div className="space-y-12 w-full mx-auto">
            <section className="text-center mb-16">
              <div className="hero-gradient p-12 rounded-3xl mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10">
                  <h2 className="text-5xl font-bold text-white mb-4">
                    Build the Future
                  </h2>
                  <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                    Collaborate, create, and bring your ideas to life with our
                    powerful project management platform.
                  </p>
                </div>
              </div>
            </section>

            <InView triggerOnce threshold={0.2}>
              {({ inView, ref }) => (
                <section
                  ref={ref}
                  id="create-project-section"
                  className="glass-morphism p-8 rounded-3xl shadow-2xl border border-purple-500/30 hover-lift section-enter relative overflow-hidden"
                >
                  <div
                    className={`${
                      inView ? "opacity-100" : "opacity-0"
                    } absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <h2 className="text-3xl font-bold text-shimmer">
                        Launch Your Next Big Idea
                      </h2>
                    </div>
                    <p className="text-gray-400 mb-8 text-lg">
                      Transform your vision into reality. Start building
                      something amazing today.
                    </p>
                    <Createproject />
                  </div>
                </section>
              )}
            </InView>

            <InView triggerOnce threshold={0.2}>
              {({ inView, ref }) => (
                <section
                  id="my-projects-section"
                  ref={ref}
                  className="glass-morphism p-8 rounded-3xl shadow-2xl border border-purple-500/30 hover-lift section-enter relative overflow-hidden"
                >
                  <div
                    className={`${
                      inView ? "opacity-100" : "opacity-0"
                    } absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -ml-16 -mt-16`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                        <span className="text-2xl">💼</span>
                      </div>
                      <h2 className="text-3xl font-bold text-shimmer">
                        Your Creative Universe
                      </h2>
                    </div>
                    <p className="text-gray-400 mb-8 text-lg">
                      Manage and track all your projects in one beautiful,
                      intuitive space.
                    </p>
                    <Getmyproject />
                  </div>
                </section>
              )}
            </InView>

            <InView triggerOnce threshold={0.2}>
              {({ inView, ref }) => (
                <section
                  id="all-projects-section"
                  ref={ref}
                  className="glass-morphism p-8 rounded-3xl shadow-2xl border border-purple-500/30 hover-lift section-enter relative overflow-hidden"
                >
                  <div
                    className={`${
                      inView ? "opacity-100" : "opacity-0"
                    } absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -mr-16 -mb-16`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                        <span className="text-2xl">🌍</span>
                      </div>
                      <h2 className="text-3xl font-bold text-shimmer">
                        Discover & Collaborate
                      </h2>
                    </div>
                    <p className="text-gray-400 mb-8 text-lg">
                      Explore incredible projects from our global community of
                      creators and innovators.
                    </p>
                    <Getprojects />
                  </div>
                </section>
              )}
            </InView>
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;
