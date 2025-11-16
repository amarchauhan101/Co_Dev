import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineArrowSmUp, HiOutlineArrowSmDown, HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { AiFillThunderbolt } from "react-icons/ai";
import { 
  FaTrophy, 
  FaMedal, 
  FaAward, 
  FaBolt, 
  FaRocket, 
  FaFire,
  FaCrown,
  FaGem,
  FaStar
} from "react-icons/fa";

/* ── Enhanced Color System ───────────────────── */
const PODIUM = [
  { 
    ring: "ring-4 ring-slate-300/50 shadow-lg shadow-slate-500/30", 
    gradient: "from-slate-200 via-slate-100 to-slate-300",
    badge: "bg-gradient-to-r from-slate-400 to-slate-600",
    glow: "shadow-slate-400/50",
    icon: FaMedal,
    title: "Silver Master"
  }, // 2nd
  { 
    ring: "ring-4 ring-yellow-400/70 shadow-xl shadow-yellow-500/50", 
    gradient: "from-yellow-200 via-yellow-100 to-amber-300",
    badge: "bg-gradient-to-r from-yellow-400 to-amber-600",
    glow: "shadow-yellow-400/60",
    icon: FaCrown,
    title: "Gold Champion"
  }, // 1st
  { 
    ring: "ring-4 ring-orange-400/50 shadow-lg shadow-orange-500/30", 
    gradient: "from-orange-200 via-orange-100 to-rose-300",
    badge: "bg-gradient-to-r from-orange-400 to-rose-600",
    glow: "shadow-orange-400/50",
    icon: FaAward,
    title: "Bronze Hero"
  }, // 3rd
];

const ROW_GRADIENTS = [
  "from-cyan-50/80 via-cyan-100/60 to-blue-50/80",
  "from-rose-50/80 via-pink-100/60 to-red-50/80", 
  "from-amber-50/80 via-yellow-100/60 to-orange-50/80",
  "from-purple-50/80 via-violet-100/60 to-indigo-50/80",
  "from-teal-50/80 via-emerald-100/60 to-green-50/80",
  "from-indigo-50/80 via-blue-100/60 to-cyan-50/80",
];

/* ── Enhanced Animation System ─────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { 
    y: 60, 
    opacity: 0,
    scale: 0.9,
    rotateX: -15
  },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    rotateX: 0,
    transition: { 
      type: "spring", 
      stiffness: 300,
      damping: 25,
      duration: 0.6
    } 
  },
};

const podiumVariants = {
  hidden: { 
    y: 100, 
    opacity: 0, 
    scale: 0.8,
    rotateY: -20
  },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    transition: { 
      type: "spring", 
      stiffness: 200,
      damping: 20,
      duration: 0.8
    } 
  },
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const pulseGlow = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

/* ── Component ───────────────────────── */
const Leaderboard = () => {
  const { user } = useAuth();
  const userWithToken = user?.userWithToken;
  const token = userWithToken?.token;
  const [devs, setDevs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /* fetch once */
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/leaderboard`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "fetch error");
        setDevs(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* enrich & rank */
  const { podium, rows } = useMemo(() => {
    const arr = devs.map((d) => {
      const points = d?.profile?.points || 0;
      const engagement =
        d.profile?.pointHistory?.filter((p) =>
          p.reason.toLowerCase().includes("project request accepted")
        ).length || 0;
      const respArr = d?.profile?.responseTimes || [];
      const responseTime = respArr.length
        ? Math.round(respArr.reduce((a, b) => a + b, 0) / respArr.length / 1000)
        : 0;
      const tArr = d.profile?.taskCompletionRates || [];
      const completion = tArr.length
        ? Math.round((tArr.filter(Boolean).length / tArr.length) * 100)
        : 0;

      return {
        id: d._id,
        name: d.profile?.name || d.username || d.email,
        avatar: d.profile?.avatar || d.profileImage || d.avatar,
        fallback: `https://api.dicebear.com/5.x/initials/svg?seed=${d.username}`,
        points,
        engagement,
        responseTime,
        completion,
      };
    });

    arr.sort((a, b) => b.points - a.points);

    const podium = arr
      .slice(0, 3)
      .map((d, i) => ({ 
        ...d, 
        ...PODIUM[i], 
        rank: i + 1,
        isTopRank: i === 0,
        medalIcon: PODIUM[i].icon
      }));
    const rows = arr.slice(3).map((d, i) => ({
      ...d,
      gradient: ROW_GRADIENTS[i % ROW_GRADIENTS.length],
      rank: i + 4,
      isHighPerformer: d.points > 1000,
      isRising: Math.random() > 0.5 // In real app, this would be calculated from historical data
    }));

    return { podium, rows };
  }, [devs]);

  if (loading) return <Loader />;
  if (err) return <Error msg={err} />;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 1}}}
          className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 2}}}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"
        />
        
        {/* Sparkling Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        {/* Enhanced Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={pulseGlow}
              className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl"
            >
              <FaTrophy className="text-3xl text-white" />
            </motion.div>
          </div>
          
          <h1 className="font-black text-4xl sm:text-5xl md:text-7xl bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 leading-tight">
            Elite Developer
          </h1>
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-purple-200 via-pink-300 to-cyan-300 bg-clip-text text-transparent mb-6">
            Hall of Fame ⚡
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Celebrating the most extraordinary developers in our community
          </p>
        </motion.div>

        {/* Enhanced Podium */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-end md:justify-center gap-8 md:gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {podium.map((d, index) => (
            <motion.div key={d.id} variants={podiumVariants}>
              <PodiumCard data={d} />
            </motion.div>
          ))}
        </motion.div>

        {/* Elegant Divider */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {podium.map((p, i) => (
              <motion.div
                key={i}
                className={`h-1 w-20 bg-gradient-to-r ${p.gradient} rounded-full shadow-lg`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Rows Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <RowHeader />
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 pb-20"
            >
              {rows.map((d, index) => (
                <motion.div 
                  key={d.id} 
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <DataRow d={d} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

/* ── Enhanced Loader ─────────────────────── */
const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
    <div className="relative">
      <motion.div
        className="h-20 w-20 rounded-full border-4 border-t-yellow-400 border-r-purple-400 border-b-cyan-400 border-l-pink-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 h-16 w-16 rounded-full border-4 border-t-transparent border-r-yellow-300 border-b-transparent border-l-purple-300"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <FaTrophy className="text-yellow-400 text-xl" />
      </div>
    </div>
  </div>
);

const Error = ({ msg }) => (
  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-rose-900">
    <div className="text-center p-8 bg-red-500/10 rounded-2xl border border-red-500/20 backdrop-blur-sm">
      <FaBolt className="text-red-400 text-4xl mx-auto mb-4" />
      <p className="text-red-300 font-semibold text-xl">{msg}</p>
    </div>
  </div>
);

/* ── Spectacular Podium Card ─────────────────────── */
const PodiumCard = ({ data }) => {
  const { rank, medalIcon: MedalIcon } = data;

  const sizeClasses = { 
    1: "h-56 w-56 md:h-64 md:w-64", 
    2: "h-44 w-44 md:h-48 md:w-48", 
    3: "h-36 w-36 md:h-40 md:w-40" 
  }[rank];
  
  const orderClass = { 
    2: "md:order-1", 
    1: "md:order-2", 
    3: "md:order-3" 
  }[rank];

  const rankEmoji = { 1: "👑", 2: "🥈", 3: "🥉" }[rank];

  return (
    <div className={`flex flex-col items-center text-center relative ${orderClass} group`}>
      {/* Crown for winner */}
      {rank === 1 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
          className="mb-4"
        >
          <div className="relative">
            <motion.div
              animate={pulseGlow}
              className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-2xl"
            >
              <FaCrown className="text-2xl text-white" />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <FaStar className="text-white text-xs" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Avatar Container */}
      <motion.div
        className="relative mb-6"
        whileHover={{ 
          scale: 1.1, 
          rotateY: 10,
          transition: { duration: 0.3 }
        }}
        animate={rank === 1 ? {
          y: [-5, 5, -5],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        } : {}}
      >
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${data.gradient} opacity-50 blur-xl ${data.glow} animate-pulse`} />
        
        {/* Main avatar */}
        <Link
          to={`/getdevprofile/${data.id}`}
          className="relative block"
        >
          <div className={`relative ${sizeClasses} rounded-full overflow-hidden ${data.ring} bg-gradient-to-br ${data.gradient} p-1`}>
            <img
              src={data.avatar}
              onError={(e) => (e.currentTarget.src = data.fallback)}
              alt={data.name}
              className="w-full h-full rounded-full object-cover"
            />
            
            {/* Rank badge */}
            <motion.div
              className={`absolute -bottom-2 -right-2 ${data.badge} rounded-full p-3 shadow-xl border-4 border-white`}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MedalIcon className="text-white text-lg" />
            </motion.div>

            {/* Points display */}
            <motion.div
              className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${data.badge} text-white px-4 py-2 rounded-full shadow-lg border-2 border-white`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
            >
              <span className="font-black text-sm">{data.points}</span>
            </motion.div>
          </div>
        </Link>

        {/* Floating particles for #1 */}
        {rank === 1 && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Enhanced Name and Stats */}
      <div className="space-y-3">
        <div className="text-center">
          <motion.h3 
            className="font-black text-lg md:text-xl text-white mb-1 max-w-[12rem] truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {data.name}
          </motion.h3>
          <motion.p 
            className={`text-sm font-semibold bg-gradient-to-r ${data.gradient} bg-clip-text text-transparent`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {data.title}
          </motion.p>
        </div>

        {/* Enhanced Stats Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FaBolt className="text-yellow-400 text-xs" />
              <span className="font-black text-white text-sm">{data.responseTime}s</span>
            </div>
            <p className="text-gray-300 text-xs">Response</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FaRocket className="text-green-400 text-xs" />
              <span className="font-black text-white text-sm">{data.completion}%</span>
            </div>
            <p className="text-gray-300 text-xs">Complete</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FaFire className="text-orange-400 text-xs" />
              <span className="font-black text-white text-sm">{data.engagement}</span>
            </div>
            <p className="text-gray-300 text-xs">Projects</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ── Elegant Row Header ──────────────────────── */
const RowHeader = () => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="hidden lg:grid grid-cols-[auto_6rem_4rem_5rem_7rem_6rem] gap-4 px-8 py-4 mb-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
  >
    <span className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
      <FaGem className="text-cyan-400" />
      Developer
    </span>
    <span className="text-center text-sm font-bold uppercase tracking-wider text-yellow-300 flex items-center justify-center gap-1">
      <FaTrophy className="text-yellow-400 text-xs" />
      Score
    </span>
    <span className="text-center text-sm font-bold uppercase tracking-wider text-purple-300">
      Rank
    </span>
    <span className="text-center text-sm font-bold uppercase tracking-wider text-orange-300 flex items-center justify-center gap-1">
      <FaRocket className="text-orange-400 text-xs" />
      Projects
    </span>
    <span className="text-center text-sm font-bold uppercase tracking-wider text-green-300 flex items-center justify-center gap-1">
      <FaBolt className="text-green-400 text-xs" />
      Response
    </span>
    <span className="text-center text-sm font-bold uppercase tracking-wider text-pink-300 flex items-center justify-center gap-1">
      <AiFillThunderbolt className="text-pink-400 text-xs" />
      Complete
    </span>
  </motion.div>
);

/* ── Stunning Data Row ─────────────────────────── */
const DataRow = ({ d, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <Link
      to={`/getdevprofile/${d.id}`}
      className="block group relative overflow-hidden"
    >
      {/* Main Card */}
      <div className={`
        relative bg-gradient-to-r ${d.gradient} backdrop-blur-sm 
        rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300
        border border-white/20 hover:border-white/40
        transform hover:scale-[1.02] hover:-translate-y-1
      `}>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        
        {/* Mobile Layout */}
        <div className="flex items-center justify-between p-5 lg:hidden relative z-10">
          <div className="flex items-center gap-4">
            {/* Enhanced Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-cyan-400/30 rounded-full blur-md animate-pulse" />
              <img
                src={d.avatar}
                onError={(e) => (e.currentTarget.src = d.fallback)}
                alt={d.name}
                className="relative h-14 w-14 rounded-full object-cover ring-3 ring-white/50 shadow-lg"
              />
              
              {/* Rising indicator */}
              {d.isRising && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <HiOutlineArrowSmUp className="text-white text-xs" />
                </motion.div>
              )}
            </div>

            <div>
              <p className="font-bold text-slate-800 text-lg">{d.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rank #{d.rank}</span>
                {d.isHighPerformer && (
                  <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-semibold">
                    🔥 Hot
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Points with enhancement */}
          <div className="text-right">
            <p className="font-black text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {d.points}
            </p>
            <p className="text-xs text-slate-500 font-medium">points</p>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-[auto_6rem_4rem_5rem_7rem_6rem] items-center gap-4 px-8 py-5 relative z-10">
          {/* User Info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full blur-sm" />
              <img
                src={d.avatar}
                onError={(e) => (e.currentTarget.src = d.fallback)}
                alt={d.name}
                className="relative h-12 w-12 rounded-full object-cover ring-2 ring-white/30 shadow-lg"
              />
              
              {/* Performance indicators */}
              {d.isHighPerformer && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <FaStar className="text-white text-[8px]" />
                </motion.div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-800 text-base truncate max-w-[10rem]">
                {d.name}
              </p>
              {d.isHighPerformer && (
                <p className="text-xs text-purple-600 font-semibold">Elite Performer</p>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <p className="font-black text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tabular-nums">
              {d.points}
            </p>
          </div>

          {/* Rank */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="font-bold text-slate-700 tabular-nums">#{d.rank}</span>
              {d.isRising ? (
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <HiOutlineArrowSmUp className="h-4 w-4 text-green-500" />
                </motion.div>
              ) : (
                <HiOutlineArrowSmDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <FaRocket className="text-orange-500 text-xs" />
              <span className="text-slate-700 font-semibold tabular-nums">{d.engagement}</span>
            </div>
          </div>

          {/* Response Time */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <FaBolt className="text-green-500 text-xs" />
              <span className="text-slate-700 font-semibold tabular-nums">{d.responseTime}s</span>
            </div>
          </div>

          {/* Completion */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <AiFillThunderbolt className="text-pink-500 text-xs" />
              <span className="text-slate-700 font-semibold tabular-nums">{d.completion}%</span>
            </div>
          </div>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </div>
    </Link>
  );
};

export default Leaderboard;
