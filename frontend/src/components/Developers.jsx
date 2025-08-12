import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "./Loader";
import DeveloperCard from "./DeveloperCard";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

function Developers() {
  const { user, loading } = useAuth();
  const userWithToken = user?.userWithToken;
  const token = userWithToken?.token;
  const [developer, setDeveloper] = useState([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading || !token) return;
    const getAllUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/allusers",
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        setDeveloper(response.data?.users || []);
      } catch (err) {
        console.error("Error fetching developers:", err);
      } finally {
        // setLoading(false);
      }
    };
    getAllUsers();
  }, [loading, token]);

  console.log("developer in developer.jsx=>", developer);

  if (loading) {
    return <Loader />;
  }

  return (
   
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden text-white">
      {/* Background Visual Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-ping-slow" />
        <div className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-pink-600/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-[50%] left-[50%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* Hero Section */}
        <motion.div 
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        
      >
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-[10%] left-[10%] w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute top-[40%] left-[60%] w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Enhanced Hero Section with Parallax */}
      <motion.section 
        className="relative z-10 text-center px-4 sm:px-6 lg:px-24 pt-32 pb-24"
        
      >
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Glowing text effect */}
          <div className="absolute inset-0 blur-2xl">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent opacity-50">
              Explore Talented Developers
            </h1>
          </div>
          
          <motion.h1 
            className="relative text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Explore Talented Developers
          </motion.h1>
        </motion.div>
        
        <motion.p 
          className="text-slate-300 text-xl max-w-2xl mx-auto mt-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          Join forces with <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">visionary minds</span>, 
          collaborate across the globe, and bring your next breakthrough idea to life.
        </motion.p>

        {/* Floating stats */}
        <motion.div
          className="flex justify-center space-x-8 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {[
            { number: developer.length || "50+", label: "Developers" },
            { number: "120+", label: "Projects" },
            { number: "98%", label: "Success Rate" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
                {stat.number}
              </div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Developer Grid */}
      <section className="relative z-10 sm:px-2 lg:px-12">
        {developer.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {developer.map((dev, index) => (
              <div
                key={index}
                className="transition duration-300 group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index *0.02,duration:0.5 }}
                  viewport={{ once: true }}
                >
                  <DeveloperCard dev={dev} devkey={dev._id} />
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-400 text-lg mt-12">
            No developers found.
          </p>
        )}
      </section>

      {/* Call To Action */}
      <motion.section 
        className="relative z-10 p-10 sm:px-6 lg:px-24 pb-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
          
          <motion.div 
            className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-12 text-center overflow-hidden"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.h2 
              className="text-4xl sm:text-5xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-6"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Got something to build?
            </motion.h2>
            
            <p className="text-slate-300 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Build your <span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text font-semibold">dream team</span> by 
              inviting the best developers from our community to join your project.
            </p>
            
            <motion.a
              href="/getprofile"
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-2xl relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{
                  x: [-100, 100],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
              <span className="relative z-10">Update Your Profile</span>
              <motion.div
                className="ml-2 relative z-10"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default Developers;


// import axios from "axios";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useSelector } from "react-redux";
// import Loader from "./Loader";
// import DeveloperCard from "./DeveloperCard";
// import { useAuth } from "../../context/AuthContext";
// import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// function Developers() {
//   const { user, loading } = useAuth();
//   const userWithToken = user?.userWithToken;
//   const token = userWithToken?.token;
//   const [developer, setDeveloper] = useState([]);
//   const [isVisible, setIsVisible] = useState(false);

//   // Parallax scroll effects
//   const { scrollY } = useScroll();
//   const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
//   const heroY = useTransform(scrollY, [0, 300], [0, -50]);

//   // Optimized API call with useCallback
//   const getAllUsers = useCallback(async () => {
//     if (!token) return;
    
//     try {
//       const response = await axios.get(
//         "http://localhost:8000/api/v1/allusers",
//         {
//           headers: {
//             authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setDeveloper(response.data?.users || []);
//       setIsVisible(true);
//     } catch (err) {
//       console.error("Error fetching developers:", err);
//     }
//   }, [token]);

//   useEffect(() => {
//     if (loading || !token) return;
//     getAllUsers();
//   }, [token]);

//   // Memoized animations to prevent re-renders
//   const containerVariants = useMemo(() => ({
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   }), []);

//   const cardVariants = useMemo(() => ({
//     hidden: { 
//       opacity: 0, 
//       y: 60,
//       scale: 0.9,
//     },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       scale: 1,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//         damping: 15,
//         duration: 0.6,
//       },
//     },
//   }), []);

//   console.log("developer in developer.jsx=>", developer);

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden text-white">
//       {/* Enhanced Background Visual Effects with Parallax */}
//       <motion.div 
//         className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
//         style={{ y: backgroundY }}
//       >
//         {/* Animated gradient orbs */}
//         <motion.div 
//           className="absolute top-[10%] left-[10%] w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 180, 360],
//             opacity: [0.3, 0.5, 0.3],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
        
//         <motion.div 
//           className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-full blur-2xl"
//           animate={{
//             scale: [1.2, 1, 1.2],
//             rotate: [360, 180, 0],
//             opacity: [0.4, 0.6, 0.4],
//           }}
//           transition={{
//             duration: 25,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
        
//         <motion.div 
//           className="absolute top-[40%] left-[60%] w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
//           animate={{
//             x: [0, 100, 0],
//             y: [0, -50, 0],
//             scale: [1, 1.3, 1],
//           }}
//           transition={{
//             duration: 30,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />

//         {/* Floating particles */}
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-2 h-2 bg-white/20 rounded-full"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               y: [-20, -100, -20],
//               opacity: [0, 1, 0],
//               scale: [0, 1, 0],
//             }}
//             transition={{
//               duration: 3 + Math.random() * 2,
//               repeat: Infinity,
//               delay: Math.random() * 2,
//               ease: "easeInOut",
//             }}
//           />
//         ))}
//       </motion.div>

//       {/* Enhanced Hero Section with Parallax */}
//       <motion.section 
//         className="relative z-10 text-center px-4 sm:px-6 lg:px-24 pt-32 pb-24"
//         style={{ y: heroY }}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//           className="relative"
//         >
//           {/* Glowing text effect */}
//           <div className="absolute inset-0 blur-2xl">
//             <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent opacity-50">
//               Explore Talented Developers
//             </h1>
//           </div>
          
//           <motion.h1 
//             className="relative text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
//             animate={{
//               backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//             }}
//             transition={{
//               duration: 5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           >
//             Explore Talented Developers
//           </motion.h1>
//         </motion.div>
        
//         <motion.p 
//           className="text-slate-300 text-xl max-w-4xl mx-auto mt-8 leading-relaxed"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
//         >
//           Join forces with <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">visionary minds</span>, 
//           collaborate across the globe, and bring your next breakthrough idea to life.
//         </motion.p>

//         {/* Floating stats */}
//         <motion.div
//           className="flex justify-center space-x-8 mt-12"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.6 }}
//         >
//           {[
//             { number: developer.length || "50+", label: "Developers" },
//             { number: "120+", label: "Projects" },
//             { number: "98%", label: "Success Rate" },
//           ].map((stat, index) => (
//             <motion.div
//               key={stat.label}
//               className="text-center"
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             >
//               <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
//                 {stat.number}
//               </div>
//               <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </motion.section>

//       {/* Enhanced Developer Grid */}
//       <section className="relative z-10 px-4 sm:px-6 lg:px-24 pb-20">
//         <AnimatePresence>
//           {developer && developer.length > 0 ? (
//             <motion.div 
//               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
//               variants={containerVariants}
//               initial="hidden"
//               animate={isVisible ? "visible" : "hidden"}
//             >
//               {developer?.map((dev, index) => (
//                 <motion.div
//                   key={dev._id}
//                   variants={cardVariants}
//                   className="group relative"
//                   whileHover={{ 
//                     y: -8,
//                     transition: { type: "spring", stiffness: 300, damping: 20 } 
//                   }}
//                 >
//                   {/* Card glow effect */}
//                   <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm" />
                  
//                   {/* Card wrapper with enhanced styling */}
//                   <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden group-hover:border-slate-600/70 transition-all duration-500">
//                     <DeveloperCard dev={dev} devkey={dev._id} />
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20"
//             >
//               <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
//                 <div className="text-4xl">🔍</div>
//               </div>
//               <p className="text-slate-400 text-xl mb-4">No developers found</p>
//               <p className="text-slate-500">Check back soon for amazing talent!</p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </section>

//       {/* Enhanced Call To Action */}
//       <motion.section 
//         className="relative z-10 px-4 sm:px-6 lg:px-24 pb-20"
//         initial={{ opacity: 0, y: 40 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         viewport={{ once: true }}
//       >
//         <div className="max-w-5xl mx-auto relative">
//           {/* Background glow */}
//           <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
          
//           <motion.div 
//             className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-12 text-center overflow-hidden"
//             whileHover={{ 
//               scale: 1.02,
//               boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
//             }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           >
//             {/* Animated background pattern */}
//             <div className="absolute inset-0 opacity-10">
//               {[...Array(20)].map((_, i) => (
//                 <motion.div
//                   key={i}
//                   className="absolute w-1 h-1 bg-white rounded-full"
//                   style={{
//                     left: `${Math.random() * 100}%`,
//                     top: `${Math.random() * 100}%`,
//                   }}
//                   animate={{
//                     opacity: [0, 1, 0],
//                     scale: [0, 1, 0],
//                   }}
//                   transition={{
//                     duration: 2 + Math.random() * 2,
//                     repeat: Infinity,
//                     delay: Math.random() * 2,
//                   }}
//                 />
//               ))}
//             </div>

//             <motion.h2 
//               className="text-4xl sm:text-5xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-6"
//               animate={{
//                 backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//               }}
//               transition={{
//                 duration: 6,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             >
//               Got something to build?
//             </motion.h2>
            
//             <p className="text-slate-300 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
//               Build your <span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text font-semibold">dream team</span> by 
//               inviting the best developers from our community to join your project.
//             </p>
            
//             <motion.a
//               href="/getprofile"
//               className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-2xl relative overflow-hidden group"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             >
//               {/* Button shine effect */}
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
//                 animate={{
//                   x: [-100, 100],
//                 }}
//                 transition={{
//                   duration: 2,
//                   repeat: Infinity,
//                   repeatDelay: 3,
//                 }}
//               />
//               <span className="relative z-10">Update Your Profile</span>
//               <motion.div
//                 className="ml-2 relative z-10"
//                 animate={{ x: [0, 5, 0] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//               >
//                 →
//               </motion.div>
//             </motion.a>
//           </motion.div>
//         </div>
//       </motion.section>
//     </div>
//   );
// }

// export default Developers;


// import axios from "axios";
// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useSelector } from "react-redux";
// import Loader from "./Loader";
// import DeveloperCard from "./DeveloperCard";
// import { useAuth } from "../../context/AuthContext";
// import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// function Developers() {
//   const { user, loading } = useAuth();
//   const userWithToken = user?.userWithToken;
//   const token = userWithToken?.token;
//   const [developer, setDeveloper] = useState([]);
//   const [isVisible, setIsVisible] = useState(false);
//   const [apiLoading, setApiLoading] = useState(false); // Add separate loading state for API
//   const [error, setError] = useState(null); // Add error state

//   // Parallax scroll effects
//   const { scrollY } = useScroll();
//   const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
//   const heroY = useTransform(scrollY, [0, 300], [0, -50]);

//   // Optimized API call with useCallback
//   const getAllUsers = useCallback(async () => {
//     if (!token) {
//       console.log("No token available");
//       return;
//     }
    
//     setApiLoading(true);
//     setError(null);
    
//     try {
//       console.log("Making API request with token:", token.substring(0, 20) + "...");
      
//       const response = await axios.get(
//         "http://localhost:8000/api/v1/allusers",
//         {
//           headers: {
//             authorization: `Bearer ${token}`,
//           },
//         }
//       );
      
//       console.log("API Response:", response.data);
      
//       const users = response.data?.users || [];
//       console.log("Extracted users:", users);
      
//       setDeveloper(users);
//       setIsVisible(true);
      
//       if (users.length === 0) {
//         console.warn("No users found in API response");
//       }
      
//     } catch (err) {
//       console.error("Error fetching developers:", err);
//       console.error("Error details:", {
//         message: err.message,
//         status: err.response?.status,
//         data: err.response?.data
//       });
//       setError(err.message);
//     } finally {
//       setApiLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     console.log("useEffect triggered - loading:", loading, "token:", !!token);
    
//     if (loading) {
//       console.log("Still loading auth...");
//       return;
//     }
    
//     if (!token) {
//       console.log("No token available, skipping API call");
//       return;
//     }
    
//     getAllUsers();
//   }, [loading, token, getAllUsers]); // Fixed: added getAllUsers to dependencies

//   // Debug logs
//   useEffect(() => {
//     console.log("Current state:", {
//       authLoading: loading,
//       hasToken: !!token,
//       apiLoading,
//       developersCount: developer.length,
//       isVisible,
//       error
//     });
//   }, [loading, token, apiLoading, developer.length, isVisible, error]);

//   // Memoized animations to prevent re-renders
//   const containerVariants = useMemo(() => ({
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   }), []);

//   const cardVariants = useMemo(() => ({
//     hidden: { 
//       opacity: 0, 
//       y: 60,
//       scale: 0.9,
//     },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       scale: 1,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//         damping: 15,
//         duration: 0.6,
//       },
//     },
//   }), []);

//   console.log("developer in developer.jsx=>", developer);

//   // Show loading if auth is loading OR if API is loading
//   if (loading || apiLoading) {
//     return <Loader />;
//   }

//   // Show error state if there's an error
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Error Loading Developers</h2>
//           <p className="text-slate-300 mb-4">{error}</p>
//           <button 
//             onClick={getAllUsers}
//             className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden text-white">
//       {/* Enhanced Background Visual Effects with Parallax */}
//       <motion.div 
//         className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
//         style={{ y: backgroundY }}
//       >
//         {/* Animated gradient orbs */}
//         <motion.div 
//           className="absolute top-[10%] left-[10%] w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 180, 360],
//             opacity: [0.3, 0.5, 0.3],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
        
//         <motion.div 
//           className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-full blur-2xl"
//           animate={{
//             scale: [1.2, 1, 1.2],
//             rotate: [360, 180, 0],
//             opacity: [0.4, 0.6, 0.4],
//           }}
//           transition={{
//             duration: 25,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
        
//         <motion.div 
//           className="absolute top-[40%] left-[60%] w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
//           animate={{
//             x: [0, 100, 0],
//             y: [0, -50, 0],
//             scale: [1, 1.3, 1],
//           }}
//           transition={{
//             duration: 30,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />

//         {/* Floating particles */}
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-2 h-2 bg-white/20 rounded-full"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               y: [-20, -100, -20],
//               opacity: [0, 1, 0],
//               scale: [0, 1, 0],
//             }}
//             transition={{
//               duration: 3 + Math.random() * 2,
//               repeat: Infinity,
//               delay: Math.random() * 2,
//               ease: "easeInOut",
//             }}
//           />
//         ))}
//       </motion.div>

//       {/* Enhanced Hero Section with Parallax */}
//       <motion.section 
//         className="relative z-10 text-center px-4 sm:px-6 lg:px-24 pt-32 pb-24"
//         style={{ y: heroY }}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, ease: "easeOut" }}
//           className="relative"
//         >
//           {/* Glowing text effect */}
//           <div className="absolute inset-0 blur-2xl">
//             <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent opacity-50">
//               Explore Talented Developers
//             </h1>
//           </div>
          
//           <motion.h1 
//             className="relative text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
//             animate={{
//               backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//             }}
//             transition={{
//               duration: 5,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           >
//             Explore Talented Developers
//           </motion.h1>
//         </motion.div>
        
//         <motion.p 
//           className="text-slate-300 text-xl max-w-4xl mx-auto mt-8 leading-relaxed"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
//         >
//           Join forces with <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">visionary minds</span>, 
//           collaborate across the globe, and bring your next breakthrough idea to life.
//         </motion.p>

//         {/* Floating stats */}
//         <motion.div
//           className="flex justify-center space-x-8 mt-12"
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.6 }}
//         >
//           {[
//             { number: developer.length > 0 ? developer.length : "0", label: "Developers" },
//             { number: "120+", label: "Projects" },
//             { number: "98%", label: "Success Rate" },
//           ].map((stat, index) => (
//             <motion.div
//               key={stat.label}
//               className="text-center"
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             >
//               <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
//                 {stat.number}
//               </div>
//               <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </motion.section>

//       {/* Debug Info (Remove in production) */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
//           <div>Auth Loading: {loading ? 'Yes' : 'No'}</div>
//           <div>Has Token: {token ? 'Yes' : 'No'}</div>
//           <div>API Loading: {apiLoading ? 'Yes' : 'No'}</div>
//           <div>Developers Count: {developer.length}</div>
//           <div>Is Visible: {isVisible ? 'Yes' : 'No'}</div>
//           <div>Error: {error || 'None'}</div>
//         </div>
//       )}

//       {/* Enhanced Developer Grid */}
//       <section className="relative z-10 px-4 sm:px-6 lg:px-24 pb-20">
//         <AnimatePresence>
//           {developer && developer.length > 0 ? (
//             <motion.div 
//               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
//               variants={containerVariants}
//               initial="hidden"
//               animate={isVisible ? "visible" : "hidden"}
//             >
//               {developer.map((dev, index) => {
//                 // Add safety check for dev._id
//                 if (!dev || !dev._id) {
//                   console.warn("Invalid developer object at index", index, dev);
//                   return null;
//                 }
                
//                 return (
//                   <motion.div
//                     key={dev._id}
//                     variants={cardVariants}
//                     className="group relative"
//                     whileHover={{ 
//                       y: -8,
//                       transition: { type: "spring", stiffness: 300, damping: 20 } 
//                     }}
//                   >
//                     {/* Card glow effect */}
//                     <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm" />
                    
//                     {/* Card wrapper with enhanced styling */}
//                     <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden group-hover:border-slate-600/70 transition-all duration-500">
//                       <DeveloperCard dev={dev} devkey={dev._id} />
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </motion.div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20"
//             >
//               <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
//                 <div className="text-4xl">🔍</div>
//               </div>
//               <p className="text-slate-400 text-xl mb-4">No developers found</p>
//               <p className="text-slate-500">Check back soon for amazing talent!</p>
              
//               {/* Debug info for empty state */}
//               {process.env.NODE_ENV === 'development' && (
//                 <div className="mt-4 text-sm text-slate-400">
//                   <p>Auth Loading: {loading ? 'Yes' : 'No'}</p>
//                   <p>API Loading: {apiLoading ? 'Yes' : 'No'}</p>
//                   <p>Has Token: {token ? 'Yes' : 'No'}</p>
//                   <p>Error: {error || 'None'}</p>
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </section>

//       {/* Enhanced Call To Action */}
      // <motion.section 
      //   className="relative z-10 px-4 sm:px-6 lg:px-24 pb-20"
      //   initial={{ opacity: 0, y: 40 }}
      //   whileInView={{ opacity: 1, y: 0 }}
      //   transition={{ duration: 0.8, ease: "easeOut" }}
      //   viewport={{ once: true }}
      // >
      //   <div className="max-w-5xl mx-auto relative">
      //     {/* Background glow */}
      //     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
          
      //     <motion.div 
      //       className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-12 text-center overflow-hidden"
      //       whileHover={{ 
      //         scale: 1.02,
      //         boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      //       }}
      //       transition={{ type: "spring", stiffness: 300, damping: 30 }}
      //     >
      //       {/* Animated background pattern */}
      //       <div className="absolute inset-0 opacity-10">
      //         {[...Array(20)].map((_, i) => (
      //           <motion.div
      //             key={i}
      //             className="absolute w-1 h-1 bg-white rounded-full"
      //             style={{
      //               left: `${Math.random() * 100}%`,
      //               top: `${Math.random() * 100}%`,
      //             }}
      //             animate={{
      //               opacity: [0, 1, 0],
      //               scale: [0, 1, 0],
      //             }}
      //             transition={{
      //               duration: 2 + Math.random() * 2,
      //               repeat: Infinity,
      //               delay: Math.random() * 2,
      //             }}
      //           />
      //         ))}
      //       </div>

      //       <motion.h2 
      //         className="text-4xl sm:text-5xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-6"
      //         animate={{
      //           backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      //         }}
      //         transition={{
      //           duration: 6,
      //           repeat: Infinity,
      //           ease: "easeInOut",
      //         }}
      //       >
      //         Got something to build?
      //       </motion.h2>
            
      //       <p className="text-slate-300 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
      //         Build your <span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text font-semibold">dream team</span> by 
      //         inviting the best developers from our community to join your project.
      //       </p>
            
      //       <motion.a
      //         href="/getprofile"
      //         className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-2xl relative overflow-hidden group"
      //         whileHover={{ scale: 1.05 }}
      //         whileTap={{ scale: 0.95 }}
      //         transition={{ type: "spring", stiffness: 300, damping: 20 }}
      //       >
      //         {/* Button shine effect */}
      //         <motion.div
      //           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
      //           animate={{
      //             x: [-100, 100],
      //           }}
      //           transition={{
      //             duration: 2,
      //             repeat: Infinity,
      //             repeatDelay: 3,
      //           }}
      //         />
      //         <span className="relative z-10">Update Your Profile</span>
      //         <motion.div
      //           className="ml-2 relative z-10"
      //           animate={{ x: [0, 5, 0] }}
      //           transition={{ duration: 1.5, repeat: Infinity }}
      //         >
      //           →
      //         </motion.div>
      //       </motion.a>
      //     </motion.div>
      //   </div>
      // </motion.section>
//     </div>
//   );
// }

// export default Developers;