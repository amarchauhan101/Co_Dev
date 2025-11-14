import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { FaTrophy } from "react-icons/fa";
import { FaChartLine, FaChartBar, FaCircle, FaRocket, FaStar } from "react-icons/fa";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6366F1", "#EC4899", "#06B6D4"];
const THEME_COLORS = {
  project: "#10B981",
  task: "#3B82F6", 
  bonus: "#F59E0B",
  achievement: "#EF4444",
  milestone: "#6366F1",
  collaboration: "#EC4899",
  default: "#06B6D4"
};

export const TaskPointsGraph = ({ profile }) => {
  const [view, setView] = useState("area");
  const history = profile?.pointHistory || [];

  const graphData = history.map((item, index) => ({
    name: `Day ${index + 1}`,
    shortName: `D${index + 1}`,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    fullDate: new Date(item.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }),
    points: item.points,
    reason: item.reason,
    size: Math.max(item.points * 3, 20),
    category: item.reason?.toLowerCase().includes('project') ? 'project' :
              item.reason?.toLowerCase().includes('task') ? 'task' :
              item.reason?.toLowerCase().includes('bonus') ? 'bonus' :
              item.reason?.toLowerCase().includes('achievement') ? 'achievement' :
              item.reason?.toLowerCase().includes('milestone') ? 'milestone' :
              item.reason?.toLowerCase().includes('collaboration') ? 'collaboration' : 'default',
    cumulative: history.slice(0, index + 1).reduce((sum, h) => sum + h.points, 0)
  }));

  const getColor = (reason) => {
    const category = reason?.toLowerCase();
    if (category?.includes("project")) return THEME_COLORS.project;
    if (category?.includes("task")) return THEME_COLORS.task;
    if (category?.includes("bonus")) return THEME_COLORS.bonus;
    if (category?.includes("achievement")) return THEME_COLORS.achievement;
    if (category?.includes("milestone")) return THEME_COLORS.milestone;
    if (category?.includes("collaboration")) return THEME_COLORS.collaboration;
    return THEME_COLORS.default;
  };

  const totalPoints = graphData.reduce((sum, item) => sum + item.points, 0);
  const avgPoints = totalPoints / (graphData.length || 1);
  const maxPoints = Math.max(...graphData.map(item => item.points), 0);

  const viewOptions = [
    { key: "area", label: "Area Chart", icon: <FaChartLine />, description: "Trend analysis" },
    { key: "bar", label: "Bar Chart", icon: <FaChartBar />, description: "Individual performance" },
    { key: "bubble", label: "Bubble Chart", icon: <FaCircle />, description: "Impact visualization" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isMobile = window.innerWidth < 640;
      
      return (
        <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 max-w-xs ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: getColor(data.reason) }}
            ></div>
            <p className="text-white font-bold text-xs sm:text-sm line-clamp-1">{isMobile ? data.date : data.fullDate}</p>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <p className="text-emerald-400 text-xs sm:text-sm">
              <span className="font-semibold">💎 Points:</span> {data.points}
            </p>
            <p className="text-cyan-400 text-xs sm:text-sm">
              <span className="font-semibold">📈 Total:</span> {data.cumulative}
            </p>
            <p className="text-gray-300 text-xs line-clamp-2">
              <span className="font-semibold text-purple-400">📝 Reason:</span> {data.reason}
            </p>
            <div className="flex items-center gap-1 mt-1 sm:mt-2">
              {Array.from({ length: Math.min(isMobile ? 3 : 5, Math.ceil(data.points / 10)) }, (_, i) => (
                <FaStar key={i} className="text-yellow-400 text-xs" />
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <div className="p-1 sm:p-1.5 bg-emerald-500/20 rounded-md sm:rounded-lg">
              <FaTrophy className="text-emerald-400 text-sm sm:text-base lg:text-lg" />
            </div>
            <span className="text-emerald-300 text-xs sm:text-sm font-medium line-clamp-1">Total Points</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{totalPoints.toLocaleString()}</p>
          <div className="flex items-center gap-1">
            <div className="w-full bg-emerald-900/30 rounded-full h-0.5 sm:h-1">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-0.5 sm:h-1 rounded-full w-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <div className="p-1 sm:p-1.5 bg-blue-500/20 rounded-md sm:rounded-lg">
              <FaRocket className="text-blue-400 text-sm sm:text-base lg:text-lg" />
            </div>
            <span className="text-blue-300 text-xs sm:text-sm font-medium line-clamp-1">Average</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{avgPoints.toFixed(1)}</p>
          <div className="flex items-center gap-1 text-xs sm:text-xs text-blue-400">
            <span className="truncate">per activity</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <div className="p-1 sm:p-1.5 bg-purple-500/20 rounded-md sm:rounded-lg">
              <FaStar className="text-purple-400 text-sm sm:text-base lg:text-lg" />
            </div>
            <span className="text-purple-300 text-xs sm:text-sm font-medium line-clamp-1">Best Day</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{maxPoints}</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(3, Math.ceil(maxPoints / 20)) }, (_, i) => (
              <FaStar key={i} className="text-yellow-400 text-xs animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/15 to-orange-600/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <div className="p-1 sm:p-1.5 bg-orange-500/20 rounded-md sm:rounded-lg">
              <FaChartLine className="text-orange-400 text-sm sm:text-base lg:text-lg" />
            </div>
            <span className="text-orange-300 text-xs sm:text-sm font-medium line-clamp-1">Activities</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{graphData.length}</p>
          <div className="flex items-center gap-1 text-xs sm:text-xs text-orange-400">
            <span className="truncate">recorded</span>
          </div>
        </div>
      </div>

      {/* Chart Type Selector - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setView(option.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base ${
                view === option.key
                  ? "bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 text-white shadow-purple-500/30 border-2 border-purple-400/50"
                  : "bg-gradient-to-br from-white/10 to-white/5 text-gray-300 hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30"
              }`}
            >
              <span className={`text-base sm:text-lg ${view === option.key ? 'animate-pulse' : ''}`}>{option.icon}</span>
              <span className="text-xs sm:text-sm font-semibold">{option.label}</span>
              <span className="text-xs opacity-70 hidden lg:inline bg-black/20 px-2 py-1 rounded-full">
                {option.description}
              </span>
              {view === option.key && (
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Mobile Chart Info */}
        <div className="sm:hidden bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-lg p-2 border border-slate-600/30">
          <div className="text-center">
            <span className="text-xs text-slate-300">
              {viewOptions.find(opt => opt.key === view)?.description}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Container - Mobile Optimized */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-4 lg:p-6 xl:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02] hover:border-white/20">
        {view === "area" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <FaChartLine className="text-white text-sm sm:text-base lg:text-lg" />
                </div>
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  📈 Points Journey
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:ml-auto">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Daily Points</span>
                  <span className="sm:hidden">Daily</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Cumulative</span>
                  <span className="sm:hidden">Total</span>
                </div>
              </div>
            </div>
            {/* Scrollable Chart Container */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div style={{minWidth: `${Math.max(graphData.length * 80, 400)}px`, height: window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 350}}>
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 350}>
                  <AreaChart data={graphData} margin={{ 
                    top: 20, 
                    right: window.innerWidth < 640 ? 10 : 30, 
                    left: window.innerWidth < 640 ? 10 : 20, 
                    bottom: window.innerWidth < 640 ? 40 : 20 
                  }}>
                    <defs>
                      <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                        <stop offset="30%" stopColor="#06B6D4" stopOpacity={0.7} />
                        <stop offset="70%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#34D399" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                      <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis 
                      dataKey={window.innerWidth < 640 ? "shortName" : "date"}
                      stroke="#9CA3AF" 
                      fontSize={window.innerWidth < 640 ? 9 : 11}
                      fontWeight={500}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#D1D5DB', fontSize: window.innerWidth < 640 ? 9 : 11 }}
                      interval={0}
                      angle={window.innerWidth < 640 ? -45 : 0}
                      textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                    height={window.innerWidth < 640 ? 50 : 30}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={window.innerWidth < 640 ? 9 : 11}
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#D1D5DB', fontSize: window.innerWidth < 640 ? 9 : 11 }}
                    domain={['dataMin - 5', 'dataMax + 10']}
                    width={window.innerWidth < 640 ? 35 : 50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="points"
                    stroke="url(#lineGradient)"
                    strokeWidth={window.innerWidth < 640 ? 3 : 4}
                    fill="url(#pointsGradient)"
                    fillOpacity={1}
                    dot={{ fill: '#ffffff', strokeWidth: 2, r: window.innerWidth < 640 ? 3 : 5, stroke: 'url(#lineGradient)' }}
                    activeDot={{ 
                      r: window.innerWidth < 640 ? 6 : 8, 
                      stroke: '#ffffff', 
                      strokeWidth: 3, 
                      fill: '#10B981',
                      filter: "url(#glow)",
                      style: { cursor: 'pointer' }
                    }}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>
        )}

        {view === "bar" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <FaChartBar className="text-white text-sm sm:text-base lg:text-lg" />
                </div>
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  📊 Performance Breakdown
                </h4>
              </div>
              <div className="w-full sm:w-auto sm:ml-auto">
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 sm:gap-2 text-xs">
                  {Object.entries(THEME_COLORS).slice(0, 6).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-lg"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-gray-300 capitalize text-xs truncate">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Scrollable Bar Chart Container */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="min-w-[600px] w-full">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 350}>
                  <BarChart data={graphData} margin={{ 
                    top: 20, 
                    right: window.innerWidth < 640 ? 10 : 30, 
                    left: window.innerWidth < 640 ? 10 : 20, 
                    bottom: window.innerWidth < 640 ? 40 : 20 
                  }}>
                    <defs>
                      {Object.entries(THEME_COLORS).map(([key, color]) => (
                        <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="50%" stopColor={color} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                        </linearGradient>
                      ))}
                    <filter id="barGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey={window.innerWidth < 640 ? "shortName" : "date"}
                    stroke="#9CA3AF" 
                    fontSize={window.innerWidth < 640 ? 9 : 11}
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#D1D5DB', fontSize: window.innerWidth < 640 ? 9 : 11 }}
                    interval={window.innerWidth < 640 ? 1 : "preserveStartEnd"}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                    height={window.innerWidth < 640 ? 50 : 30}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={window.innerWidth < 640 ? 9 : 11}
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#D1D5DB', fontSize: window.innerWidth < 640 ? 9 : 11 }}
                    domain={['dataMin - 2', 'dataMax + 5']}
                    width={window.innerWidth < 640 ? 35 : 50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="points" 
                    radius={[window.innerWidth < 640 ? 4 : 8, window.innerWidth < 640 ? 4 : 8, 2, 2]}
                    filter="url(#barGlow)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {graphData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${entry.category})`}
                        stroke={THEME_COLORS[entry.category]}
                        strokeWidth={window.innerWidth < 640 ? 1 : 2}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {view === "bubble" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                  <FaCircle className="text-white text-sm sm:text-base lg:text-lg" />
                </div>
                <h4 className="text-sm sm:text-base lg:text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  🎯 Impact Bubbles
                </h4>
              </div>
              <div className="text-xs text-gray-400 sm:ml-auto">
                <span>💡 Bubble size = Impact level</span>
              </div>
            </div>
            {/* Scrollable Bubble Chart Container */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="min-w-[600px] w-full">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 350}>
                  <ScatterChart data={graphData} margin={{ 
                    top: 20, 
                    right: window.innerWidth < 640 ? 10 : 30, 
                    left: window.innerWidth < 640 ? 10 : 20, 
                    bottom: window.innerWidth < 640 ? 40 : 20 
                  }}>
                    <defs>
                      <filter id="bubbleGlow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    {Object.entries(THEME_COLORS).map(([key, color]) => (
                      <radialGradient key={key} id={`bubble-${key}`}>
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="70%" stopColor={color} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                      </radialGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey={window.innerWidth < 640 ? "shortName" : "date"}
                    stroke="#9CA3AF" 
                    fontSize={window.innerWidth < 640 ? 9 : 11}
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#D1D5DB', fontSize: window.innerWidth < 640 ? 9 : 11 }}
                    interval={window.innerWidth < 640 ? 1 : "preserveStartEnd"}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                    height={window.innerWidth < 640 ? 50 : 30}
                  />
                  <YAxis 
                    dataKey="points" 
                    stroke="#9CA3AF" 
                    fontSize={window.innerWidth < 640 ? 9 : 11}
                    fontWeight={500}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#D1D5DB', fontSize: window.innerWidth < 640 ? 9 : 11 }}
                    domain={['dataMin - 3', 'dataMax + 8']}
                    width={window.innerWidth < 640 ? 35 : 50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter data={graphData} animationDuration={2000}>
                    {graphData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#bubble-${entry.category})`}
                        stroke={getColor(entry.reason)}
                        strokeWidth={window.innerWidth < 640 ? 2 : 3}
                        r={Math.max(window.innerWidth < 640 ? entry.size / 5 : entry.size / 3, window.innerWidth < 640 ? 6 : 8)}
                        filter="url(#bubbleGlow)"
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              </div>
            </div>
            
            {/* Mobile-Optimized Bubble Legend */}
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg sm:rounded-xl border border-gray-600/30">
              <h6 className="text-white font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FaRocket className="text-yellow-400" />
                Categories
              </h6>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {Object.entries(THEME_COLORS).slice(0, 6).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-gray-800/50 rounded-md sm:rounded-lg">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg animate-pulse"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-gray-300 text-xs font-medium capitalize truncate">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      

      
         

  
  );
};
