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


