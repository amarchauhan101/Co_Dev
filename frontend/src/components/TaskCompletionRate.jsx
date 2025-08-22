import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar
} from "recharts";
import { FaCheckCircle, FaClock, FaTasks, FaTrophy, FaPercent, FaArrowUp } from "react-icons/fa";
import { useState } from "react";

const TaskCompletionRate = ({ taskCompletionRates }) => {
  const [view, setView] = useState("donut");
  
  // Handle different data formats
  let completed, total, completionPercentage;
  
  if (Array.isArray(taskCompletionRates)) {
    completed = taskCompletionRates[0] || 0;
    total = taskCompletionRates[1] || 1;
    completionPercentage = Math.round((completed / total) * 100);
  } else {
    // If it's already a percentage or single number
    completionPercentage = taskCompletionRates || 0;
    completed = completionPercentage;
    total = 100;
  }

  const remaining = total - completed;
  
  const pieData = [
    { name: "Completed Tasks", value: completed, percentage: completionPercentage },
    { name: "Remaining Tasks", value: remaining, percentage: 100 - completionPercentage },
  ];

  const progressData = [
    { name: "Progress", completed: completionPercentage, target: 100 }
  ];

  const COLORS = {
    completed: "#10B981",
    remaining: "#374151",
    accent: "#06B6D4",
    warning: "#F59E0B",
    danger: "#EF4444"
  };

  const getStatusColor = () => {
    if (completionPercentage >= 90) return COLORS.completed;
    if (completionPercentage >= 70) return COLORS.accent;
    if (completionPercentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const getStatusMessage = () => {
    if (completionPercentage >= 90) return "Outstanding Performance! 🌟";
    if (completionPercentage >= 70) return "Great Progress! 🚀";
    if (completionPercentage >= 50) return "Good Momentum 💪";
    return "Let's boost it up! ⚡";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            ></div>
            <p className="text-white font-bold text-sm">{data.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-cyan-400 text-sm">
              <span className="font-semibold">📊 Value:</span> {data.value}
            </p>
            <p className="text-emerald-400 text-sm">
              <span className="font-semibold">📈 Percentage:</span> {data.percentage}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const viewOptions = [
    { key: "donut", label: "Donut Chart", icon: <FaCheckCircle />, description: "Overview" },
    { key: "progress", label: "Progress Bar", icon: <FaPercent />, description: "Linear view" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-green-400 text-lg" />
            <span className="text-green-300 text-sm font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{completed}</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-gray-400 text-lg" />
            <span className="text-gray-300 text-sm font-medium">Remaining</span>
          </div>
          <p className="text-2xl font-bold text-white">{remaining}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaTasks className="text-blue-400 text-lg" />
            <span className="text-blue-300 text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-purple-400 text-lg" />
            <span className="text-purple-300 text-sm font-medium">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{completionPercentage}%</p>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
        {viewOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setView(option.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              view === option.key
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-sm"
            }`}
          >
            <span className="text-sm">{option.icon}</span>
            <span className="text-sm">{option.label}</span>
            <span className="text-xs opacity-70 hidden lg:inline">({option.description})</span>
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6 lg:p-8 shadow-2xl">
        {view === "donut" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400 text-lg" />
              <h4 className="text-white text-lg font-semibold">✅ Task Completion Overview</h4>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  {/* Horizontal Scroll Container for Donut Chart */}
                  <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-corner-gray-800">
                    <div className="min-w-[300px]">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            <Cell fill={COLORS.completed} />
                            <Cell fill={COLORS.remaining} />
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {completionPercentage}%
                      </div>
                      <div className="text-sm text-gray-400">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Panel */}
              <div className="flex-1 space-y-4">
                <div className="text-center lg:text-left">
                  <h5 className="text-xl font-bold text-white mb-2">{getStatusMessage()}</h5>
                  <p className="text-gray-300 text-sm mb-4">
                    You've completed {completed} out of {total} tasks with excellence!
                  </p>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400 font-medium">Completed</span>
                      <span className="text-white">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {completionPercentage < 100 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 font-medium">Remaining</span>
                        <span className="text-white">{100 - completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-gray-600 to-gray-500 h-2 rounded-full"
                          style={{ width: `${100 - completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "progress" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <FaPercent className="text-blue-400 text-lg" />
              <h4 className="text-white text-lg font-semibold">📊 Progress Breakdown</h4>
            </div>
            
            <div className="space-y-6">
              {/* Large Progress Circle */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={getStatusColor()}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      className="transition-all duration-2000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-1">
                        {completionPercentage}%
                      </div>
                      <div className="text-sm text-gray-400">Completed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-corner-gray-800">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCheckCircle className="text-green-400" />
                        <span className="text-green-300 font-medium">Completed</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{completed}</div>
                      <div className="text-sm text-green-400">Tasks finished</div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-xl p-4 border border-gray-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-gray-400" />
                        <span className="text-gray-300 font-medium">Pending</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{remaining}</div>
                      <div className="text-sm text-gray-400">Tasks remaining</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FaTasks className="text-blue-400" />
                        <span className="text-blue-300 font-medium">Total</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{total}</div>
                      <div className="text-sm text-blue-400">All tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/50">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className={`text-lg ${completionPercentage >= 90 ? 'text-yellow-400' : 'text-gray-400'}`} />
            <h5 className="text-white font-semibold">Performance Insights</h5>
          </div>
          <p className="text-gray-300 text-sm">
            {completionPercentage >= 90 ? 
              "🌟 Exceptional work! You're maintaining an outstanding completion rate." :
            completionPercentage >= 70 ?
              "🚀 Great momentum! Keep up the excellent progress on your tasks." :
            completionPercentage >= 50 ?
              "💪 Good progress! You're building solid momentum with your task completion." :
              "⚡ Every task completed brings you closer to excellence. Keep pushing forward!"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionRate;
