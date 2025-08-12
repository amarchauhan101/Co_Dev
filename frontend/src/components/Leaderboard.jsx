// import React, { useEffect, useMemo, useState } from "react";
// import { useSelector } from "react-redux";
// import { HiOutlineArrowSmUp, HiOutlineArrowSmDown } from "react-icons/hi";

// /* ── Colour helpers ───────────────────── */
// const PODIUM = [
//   { ring: "ring-cyan-400", bar: "bg-cyan-400", badge: "bg-cyan-500" }, // 2nd
//   { ring: "ring-amber-400", bar: "bg-amber-400", badge: "bg-amber-500" }, // 1st
//   { ring: "ring-rose-400", bar: "bg-rose-400", badge: "bg-rose-500" }, // 3rd
// ];

// const ROW_COLORS = [
//   "bg-cyan-100 text-cyan-800",
//   "bg-rose-100 text-rose-800",
//   "bg-amber-100 text-amber-800",
//   "bg-purple-100 text-purple-800",
//   "bg-teal-100 text-teal-800",
// ];

// /* ── Component ────────────────────────── */
// const Leaderboard = () => {
//   const user = useSelector((s) => s.userauth?.user?.userWithToken);
//   const [devs, setDevs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   /* fetch once */
//   useEffect(() => {
//     if (!user?.token) return;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("http://localhost:8000/api/v1/leaderboard", {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user.token}`,
//           },
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.message || "fetch error");
//         setDevs(data);
//       } catch (e) {
//         setErr(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [user?.token]);

//   /* enrich & rank */
//   const { podium, rows } = useMemo(() => {
//     const arr = devs.map((d) => {
//       const points = d?.profile?.points || 0;
//       const engagement =
//         d.profile?.pointHistory?.filter((p) =>
//           p.reason.toLowerCase().includes("project request accepted")
//         ).length || 0;
//       console.log(`engagement of ${d.username}`, engagement);
//       const respArr = d?.profile?.responseTimes || [];
//       const responseTime = respArr.length
//         ? Math.round(respArr.reduce((a, b) => a + b, 0) / respArr.length / 1000)
//         : 0;
//       const tArr = d.profile?.taskCompletionRates || [];
//       const completion = tArr.length
//         ? Math.round((tArr.filter(Boolean).length / tArr.length) * 100)
//         : 0;

//       return {
//         id: d._id,
//         name: d.profile?.name || d.username || d.email,
//         avatar: d.profile?.avatar || d.profileImage || d.avatar,
//         fallback: `https://api.dicebear.com/5.x/initials/svg?seed=${d.username}`,
//         points,
//         engagement,
//         responseTime,
//         completion,
//       };
//     });

//     arr.sort((a, b) => b.points - a.points);

//     const podium = arr
//       .slice(0, 3)
//       .map((d, i) => ({ ...d, ...PODIUM[i], rank: i + 1 }));
//     const rows = arr
//       .slice(3)
//       .map((d, i) => ({
//         ...d,
//         color: ROW_COLORS[i % ROW_COLORS.length],
//         rank: i + 4,
//       }));

//     return { podium, rows };
//   }, [devs]);

//   if (loading) return <Loader />;
//   if (err) return <Error msg={err} />;

//   return (
//     <div className="min-h-screen bg-white">
//       <section className="mx-auto max-w-6xl px-4 pt-6 relative">
//         <h1 className="font-extrabold text-3xl text-gray-800 mb-8">
//           Developer Leaderboard
//         </h1>

//         {/* podium */}
//         <div className="flex flex-col md:flex-row md:justify-between items-center gap-8">
//           {podium.map((d, i) => (
//             <PodiumCard key={d.id} data={d} isWinner={d.rank == 1} />
//           ))}
//         </div>
//         <div className="hidden md:flex  justify-between mt-6">
//           {podium.map((p, i) => (
//             <span key={i} className={`${p.bar} h-2 rounded-full flex-1 mx-1`} />
//           ))}
//         </div>

//         <RowHeader />
//         <div className="space-y-3 pb-12">
//           {rows.map((d) => (
//             <DataRow key={d.id} d={d} />
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// /* ── Sub components ───────────────────── */
// const Loader = () => (
//   <div className="flex h-screen items-center justify-center bg-white">
//     <div className="h-12 w-12 rounded-full border-4 border-t-sky-400 animate-spin" />
//   </div>
// );
// const Error = ({ msg }) => (
//   <div className="flex h-screen items-center justify-center bg-white">
//     <p className="text-rose-600">{msg}</p>
//   </div>
// );

// // const PodiumCard = ({ data, isWinner }) => {
// //   console.log("data in podium", data);
// //   const { rank } = data;
// //   const rank_map = {
// //     1: "h-40 w-40",
// //     2: "h-36 w-36",
// //     3: "h-24 w-24",
// //   };
// //   const size = rank_map[rank] || "h-28 w-28"; // default size for others
// //   console.log("size in podium", size);

// //   return (
// //     <div className="flex flex-col items-center text-center relative">
// //       {rank == 1 && (
// //         <svg
// //           className="mb-2 h-10 w-10 text-amber-400"
// //           viewBox="0 0 20 20"
// //           fill="currentColor"
// //         >
// //           <path d="M10 2l2.4 4.9 5.1.4-3.9 3.2 1.3 5.5-4.9-2.8L5 16.1l1.3-5.5-4-3.2 5.1-.4L10 2z" />
// //         </svg>
// //       )}
// //       <div className="relative">
// //         <img
// //           src={data.avatar}
// //           onError={(e) => {
// //             e.target.src = data.fallback;
// //           }}
// //           alt={data.name}
// //           className={`rounded-full object-cover ring-4 ${data.ring} ${size}`}
// //         />
// //         <span
// //           className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white ${data.badge}`}
// //         >
// //           {data.points}
// //         </span>
// //       </div>
// //       <p className="mt-6 text-sm font-semibold text-gray-800">{data.name}</p>
// //       <div className="mt-1 flex gap-3 text-[11px] text-gray-600 font-medium">
// //         <span>
// //           <span className="font-bold text-gray-800">{data.responseTime}</span>s
// //           resp
// //         </span>
// //         <span className="border-l pl-2">
// //           <span className="font-bold text-gray-800">{data.completion}%</span>{" "}
// //           done
// //         </span>
// //         <span className="border-l pl-2">
// //           <span className="font-bold text-gray-800">Project engagement : {data.engagement}</span>{" "}
// //         </span>
// //       </div>
// //     </div>
// //   );
// // };

// /* ── Podium card ──────────────────────── */
// const PodiumCard = ({ data }) => {
//   const { rank } = data;

//   /* avatar sizing */
//   const SIZE = { 1: "h-44 w-44", 2: "h-32 w-32", 3: "h-24 w-24" }[rank];

//   /* NEW → decide flex order: 2 nd ▶ order-1, 1 st ▶ order-2, 3 rd ▶ order-3 */
//   const orderClass = { 2: "order-1", 1: "order-2", 3: "order-3" }[rank];

//   return (
//     <div className={`flex flex-col items-center text-center relative ${orderClass}`}>
//       {rank === 1 && (
//         <svg className="mb-2 h-10 w-10 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
//           <path d="M10 2l2.4 4.9 5.1.4-3.9 3.2 1.3 5.5-4.9-2.8L5 16.1l1.3-5.5-4-3.2 5.1-.4L10 2z" />
//         </svg>
//       )}

//       <div className="relative">
//         <img
//           src={data.avatar}
//           onError={(e) => (e.currentTarget.src = data.fallback)}
//           alt={data.name}
//           className={`rounded-full object-cover ring-4 ${data.ring} ${SIZE}`}
//         />
//         <span
//           className={`
//             absolute -bottom-3 left-1/2 -translate-x-1/2
//             rounded-full px-3 py-1 text-[11px] font-bold text-white
//             ${data.badge}
//           `}
//         >
//           {data.points}
//         </span>
//       </div>

//       <p className="mt-6 font-semibold text-sm text-gray-800">{data.name}</p>

//       <div className="mt-1 flex gap-4 text-[11px] text-gray-600">
//         <span>
//           <span className="font-bold text-gray-800">{data.responseTime}</span>s&nbsp;resp
//         </span>
//         <span className="border-l pl-3">
//           <span className="font-bold text-gray-800">{data.completion}%</span>&nbsp;done
//         </span>
//         <span className="border-l pl-3">
//           <span className="font-bold text-gray-800">{data.engagement}</span>&nbsp;engage
//         </span>
//       </div>
//     </div>
//   );
// };

// const RowHeader = () => (
//   <div
//     className="
//       grid
//       grid-cols-[auto_5rem_3.5rem_4.5rem_6rem_5rem]
//       gap-4
//       px-6
//       py-2
//       mt-10
//       mb-3
//       text-[11px]
//       font-bold
//       uppercase
//       tracking-wider
//       text-gray-500
//       select-none
//     "
//   >
//     <span>User</span>
//     <span className="text-center">Score</span>
//     <span className="text-center">Rank</span>
//     <span className="text-center">Engage</span>
//     <span className="text-center">Avg&nbsp;Resp&nbsp;(s)</span>
//     <span className="text-center">Complete</span>
//   </div>
// );

// /* ▸ 2 | Data row ─────────────────────────────────────────── */
// const DataRow = ({ d }) => (
//   <div
//     className={`
//       grid
//       grid-cols-[auto_5rem_3.5rem_4.5rem_6rem_5rem]
//       items-center
//       gap-4
//       px-6
//       py-3
//       rounded-xl
//       bg-white
//       shadow-[0_1px_3px_rgba(16,24,40,0.08)]
//       transition
//       hover:shadow-[0_3px_6px_rgba(16,24,40,0.12)]
//       ${d.color}
//     `}
//   >
//     {/* ▸ User */}
//     <div className="flex items-center gap-3 min-w-0">
//       <img
//         src={d.avatar}
//         onError={(e) => (e.currentTarget.src = d.fallback)}
//         alt={d.name}
//         className="h-10 w-10 rounded-full object-cover ring-2 ring-white shrink-0"
//       />
//       <p className="text-sm font-semibold text-gray-800 truncate">
//         {d.name}
//       </p>
//     </div>

//     {/* ▸ Score */}
//     <p className="text-center text-sm font-semibold tabular-nums">
//       {d.points}
//     </p>

//     {/* ▸ Rank (+ optional trend arrow) */}
//     <p className="flex items-center justify-center text-sm font-semibold gap-1 tabular-nums">
//       {d.rank}
//       {/* change to ↓ or remove entirely if you don’t track movement */}
//       <HiOutlineArrowSmUp className="h-4 w-4 text-green-600 shrink-0" />
//     </p>

//     {/* ▸ Engage */}
//     <p className="text-center text-sm text-gray-700 tabular-nums">
//       {d.engagement}
//     </p>

//     {/* ▸ Avg Response (s) */}
//     <p className="text-center text-sm text-gray-700 tabular-nums">
//       {d.responseTime}
//     </p>

//     {/* ▸ Completion % */}
//     <p className="text-center text-sm text-gray-700 tabular-nums">
//       {d.completion}%
//     </p>
//   </div>
// );

// export default Leaderboard;

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineArrowSmUp, HiOutlineArrowSmDown } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

/* ── Color helpers ───────────────────── */
const PODIUM = [
  { ring: "ring-cyan-400", bar: "bg-cyan-400", badge: "bg-cyan-500" }, // 2nd
  { ring: "ring-amber-400", bar: "bg-amber-400", badge: "bg-amber-500" }, // 1st
  { ring: "ring-rose-400", bar: "bg-rose-400", badge: "bg-rose-500" }, // 3rd
];

const ROW_COLORS = [
  "bg-cyan-50",
  "bg-rose-50",
  "bg-amber-50",
  "bg-purple-50",
  "bg-teal-50",
];

/* ── Helper: stagger for list animations ─ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
};

/* ── Component ───────────────────────── */
const Leaderboard = () => {
  const {user} = useAuth();
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
        const res = await fetch("http://localhost:8000/api/v1/leaderboard", {
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
      .map((d, i) => ({ ...d, ...PODIUM[i], rank: i + 1 }));
    const rows = arr.slice(3).map((d, i) => ({
      ...d,
      color: ROW_COLORS[i % ROW_COLORS.length],
      rank: i + 4,
    }));

    return { podium, rows };
  }, [devs]);

  if (loading) return <Loader />;
  if (err) return <Error msg={err} />;

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl text-slate-800 mb-12 text-center">
          ⚡ Developer Leaderboard
        </h1>

        {/* Podium */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-8 md:gap-12 mb-12">
          {podium.map((d) => (
            <PodiumCard key={d.id} data={d} />
          ))}
        </div>
        <div className="hidden md:flex justify-center gap-3 mb-16">
          {podium.map((p, i) => (
            <span key={i} className={`${p.bar} h-2 w-24 rounded-full`} />
          ))}
        </div>

        {/* Rows */}
        <RowHeader />
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 pb-20"
          >
            {rows.map((d) => (
              <motion.div key={d.id} variants={itemVariants}>
                <DataRow d={d} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ── Loader / Error ───────────────────── */
const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-white">
    <div className="h-14 w-14 rounded-full border-4 border-t-indigo-500 animate-spin" />
  </div>
);

const Error = ({ msg }) => (
  <div className="flex h-screen items-center justify-center bg-white">
    <p className="text-rose-600 font-semibold text-lg">{msg}</p>
  </div>
);

/* ── Podium card ─────────────────────── */
const PodiumCard = ({ data }) => {
  const { rank } = data;

  const SIZE = { 1: "h-48 w-48", 2: "h-36 w-36", 3: "h-28 w-28" }[rank];
  const orderClass = { 2: "md:order-1", 1: "md:order-2", 3: "md:order-3" }[
    rank
  ];
  const bounce = { 1: "animate-bounce-slow", 2: "", 3: "" }[rank];

  return (
    <div
      className={`flex flex-col items-center text-center relative ${orderClass}`}
    >
      {rank === 1 && (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-2 h-12 w-12 text-amber-400 drop-shadow-lg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2l2.4 4.9 5.1.4-3.9 3.2 1.3 5.5-4.9-2.8L5 16.1l1.3-5.5-4-3.2 5.1-.4L10 2z" />
        </motion.svg>
      )}

      <motion.div
        className={`relative ${bounce}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link
          to={`/getdevprofile/${data.id}`}
          className="flex items-center justify-center"
        >
          <img
            src={data.avatar}
            onError={(e) => (e.currentTarget.src = data.fallback)}
            alt={data.name}
            className={`rounded-full object-cover ring-4 ${data.ring} ${SIZE}`}
          />
        </Link>
        <span
          className={`
            absolute -bottom-3 left-1/2 -translate-x-1/2
            rounded-full px-4 py-1 text-xs font-bold text-white shadow-md
            ${data.badge}
          `}
        >
          {data.points}
        </span>
      </motion.div>

      <p className="mt-6 font-semibold text-sm md:text-base text-slate-800 max-w-[10rem] truncate">
        {data.name}
      </p>

      <div className="mt-1 flex gap-4 text-[11px] md:text-xs text-slate-600">
        <span>
          <span className="font-bold text-slate-800">{data.responseTime}</span>s
          resp
        </span>
        <span className="border-l pl-3">
          <span className="font-bold text-slate-800">{data.completion}%</span>{" "}
          done
        </span>
        <span className="border-l pl-3">
          <span className="font-bold text-slate-800">{data.engagement}</span>{" "}
          engage
        </span>
      </div>
    </div>
  );
};

/* ── Row header ──────────────────────── */
const RowHeader = () => (
  <div
    className="
      hidden lg:grid
      grid-cols-[auto_6rem_4rem_5rem_7rem_6rem]
      gap-4
      px-6
      py-2
      mb-3
      text-[12px]
      font-bold
      uppercase
      tracking-wide
      text-slate-500
      
      
    "
  >
    <span>User</span>
    <span className="text-center">Score</span>
    <span className="text-center">Rank</span>
    <span className="text-center">Project Engage</span>
    <span className="text-center">Avg Resp (s)</span>
    <span className="text-center">Complete</span>
  </div>
);

/* ── Data row ─────────────────────────── */
const DataRow = ({ d }) => (
  <Link
    to={`/getdevprofile/${d.id}`}
    className={`
      block                          /* make the whole card clickable */
      rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow
      ${d.color} backdrop-blur-sm bg-opacity-60
    `}
  >
    <div className="flex items-center justify-between p-4 lg:hidden">
      <div className="flex items-center gap-3">
        <img
          src={d.avatar}
          onError={(e) => (e.currentTarget.src = d.fallback)}
          alt={d.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white shrink-0"
        />

        <div>
          <p className="font-semibold text-slate-800">{d.name}</p>
          <p className="text-xs text-slate-600">Rank #{d.rank}</p>
        </div>
      </div>
      <p className="font-bold text-slate-800">{d.points}</p>
    </div>

    {/* Desktop grid */}
    <div
      className="
        hidden lg:grid
        grid-cols-[auto_6rem_4rem_5rem_7rem_6rem]
        items-center
        gap-4
        px-6
        py-3
      "
    >

      
        <div className="flex items-center gap-3 min-w-0">
        <img
          src={d.avatar}
          onError={(e) => (e.currentTarget.src = d.fallback)}
          alt={d.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white shrink-0"
        />
        <p className="font-medium text-sm text-slate-800 truncate max-w-[12rem]">
          {d.name}
        </p>
      </div>
     

      <p className="text-center font-semibold tabular-nums">{d.points}</p>
      <p className="text-center font-semibold tabular-nums flex items-center justify-center gap-1">
        {d.rank}
        <HiOutlineArrowSmUp className="h-4 w-4 text-green-600" />
      </p>
      <p className="text-center text-sm tabular-nums text-slate-700">
        {d.engagement}
      </p>
      <p className="text-center text-sm tabular-nums text-slate-700">
        {d.responseTime}
      </p>
      <p className="text-center text-sm tabular-nums text-slate-700">
        {d.completion}%
      </p>
    </div>
  </Link>
);

export default Leaderboard;
