import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "./Loader";
import DeveloperCard from "./DeveloperCard";
import { useAuth } from "../../context/AuthContext";

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
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/allusers`,
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
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse" />
        
        <div className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="absolute top-[40%] left-[60%] w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />  

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Hero Section with Parallax */}
      <section 
        className="relative z-10 text-center px-4 sm:px-6 lg:px-12 xl:px-24 pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24"
      >
        <div className="relative animate-fade-in">
          {/* Glowing text effect */}
          <div className="absolute inset-0 blur-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent opacity-50">
              Explore Talented Developers
            </h1>
          </div>
          
          <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Explore Talented Developers
          </h1>
        </div>
        
        <p className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mt-4 sm:mt-6 lg:mt-8 leading-relaxed px-2 animate-fade-in">
          Join forces with <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">visionary minds</span>, 
          collaborate across the globe, and bring your next breakthrough idea to life.
        </p>

        {/* Floating stats */}
        <div className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8 mt-6 sm:mt-8 lg:mt-12 animate-fade-in">
          {[
            { number: developer.length || "50+", label: "Developers" },
            { number: "120+", label: "Projects" },
            { number: "98%", label: "Success Rate" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center transition-transform duration-300 hover:scale-105"
            >
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
                {stat.number}
              </div>
              <div className="text-slate-400 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Grid */}
      <section className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {developer.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-8 lg:gap-12">
            {developer.map((dev, index) => (
              <div
                key={index}
                className="transition duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DeveloperCard dev={dev} devkey={dev._id} />
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
      <section className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 sm:py-16 lg:py-20 animate-fade-in">
        <div className="max-w-5xl mx-auto relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
          
          <div className="relative bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-2xl lg:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-center overflow-hidden transition-all duration-300 hover:scale-[1.02]">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-4 sm:mb-5 lg:mb-6">
              Got something to build?
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-7 lg:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              Build your <span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text font-semibold">dream team</span> by 
              inviting the best developers from our community to join your project.
            </p>
            
            <a
              href="/getprofile"
              className="inline-flex items-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base sm:text-lg lg:text-xl shadow-2xl relative overflow-hidden group transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
              <span className="relative z-10 text-sm sm:text-base lg:text-lg font-semibold">Update Your Profile</span>
              <div className="ml-1 sm:ml-2 relative z-10 animate-arrow">
                →
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Developers;


