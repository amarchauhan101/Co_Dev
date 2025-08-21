import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { FaCode, FaServer, FaDatabase, FaRocket, FaShieldAlt, FaBolt, FaCheckCircle, FaBrain } from "react-icons/fa";
import { FaPalette } from "react-icons/fa6";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import './AnalyticsStyles.css';

// Format milliseconds to "X min Y sec"

const SKILL_COLORS = {
  HTML: "#FF6B35",
  CSS: "#4338CA",
  JS: "#F59E0B",
  Frontend: "#8B5CF6",
  Backend: "#059669",
  Database: "#DC2626",
  DevOps: "#EC4899",
  Python: "#3776AB",
  React: "#61DAFB",
  Node: "#339933",
  MongoDB: "#47A248",
  MySQL: "#4479A1",
};

const SkillIcon = ({ name }) => {
  const icons = {
    Frontend: <FaCode className="text-indigo-500" />,
    Backend: <FaServer className="text-emerald-500" />,
    Database: <FaDatabase className="text-amber-500" />,
    DevOps: <FaPalette className="text-red-500" />,
    HTML: <FaCode className="text-orange-400" />,
    CSS: <FaCode className="text-blue-400" />,
    JS: <FaCode className="text-yellow-400" />,
  };
  return icons[name] || <FaCode />;
};

const ProfileDev = ({ profile }) => {
  const reliabilityScore = profile?.reliabilityScore ?? 0;
  const responseTime = profile?.responseTimes?.[0] ?? "N/A";
  const taskCompletion = Array.isArray(profile?.taskCompletionRates)
    ? Math.round(
        (profile.taskCompletionRates.reduce((a, b) => a + b, 0) /
          profile.taskCompletionRates.length) *
          100
      )
    : 0;

  const skillsData = (profile?.skills || []).map((skill) => ({
    name: skill,
    value: 1,
  }));

  const formatResponseTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const responseTimes = profile?.responseTimes || [];

  const current = responseTimes.at(-1) || 0;
  const previous = responseTimes.length > 1 ? responseTimes.at(-2) : null;

  const change = previous !== null ? previous - current : null;
  const changePercent =
    previous !== null ? ((Math.abs(change) / previous) * 100).toFixed(1) : null;

  const improved = change > 0;

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
      
      {/* Floating background elements */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 glass-card-enhanced rounded-2xl lg:rounded-3xl shadow-2xl p-3 sm:p-6 lg:p-8 font-['Inter'] text-white transition-all duration-500">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl lg:rounded-2xl shadow-lg icon-float">
            <FaRocket className="text-lg sm:text-xl lg:text-2xl text-white icon-glow" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              🚀 Developer Analytics
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">Real-time performance insights</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
          {/* RELIABILITY SCORE */}
          <div className="metric-card group relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20 w-full min-w-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-orange-500/30 rounded-full blur-sm"></div>
            
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-lg backdrop-blur-sm">
                  <FaShieldAlt className="text-xs sm:text-sm lg:text-base text-orange-300" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-orange-300 uppercase tracking-wider">
                  🛡️ Reliability
                </h3>
              </div>
              
              <div className="text-center mb-3 sm:mb-4">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-br from-white to-orange-100 bg-clip-text text-transparent">
                    {reliabilityScore}
                  </span>
                  <span className="text-sm sm:text-base lg:text-xl text-orange-400 font-bold">%</span>
                </div>
                
                {/* Mini pie chart */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Completed", value: reliabilityScore },
                          { name: "Remaining", value: 100 - reliabilityScore },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={12}
                        outerRadius={20}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="url(#orangeGradient)" />
                        <Cell fill="#374151" />
                      </Pie>
                      <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#FB923C" />
                          <stop offset="50%" stopColor="#F97316" />
                          <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                      </defs>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 sm:h-2 progress-bar overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 h-1.5 sm:h-2 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${reliabilityScore}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30 font-medium">
                  Excellent
                </span>
              </div>
            </div>
          </div>

          {/* RESPONSE TIME */}
          <div className="metric-card group relative bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20 w-full min-w-0">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-green-500/30 rounded-full blur-sm"></div>
            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-2 h-2 sm:w-3 sm:h-3 bg-green-400/40 rounded-full animate-pulse"></div>
            
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-lg backdrop-blur-sm">
                  <FaBolt className="text-xs sm:text-sm lg:text-base text-green-300" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-green-300 uppercase tracking-wider">
                  ⚡ Response
                </h3>
              </div>

              <div className="text-center mb-3 sm:mb-4">
                <div className="mb-3">
                  <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-br from-white to-green-100 bg-clip-text text-transparent">
                    {formatResponseTime(current)}
                  </span>
                </div>

                {changePercent !== null && (
                  <div
                    className={`text-xs px-2 py-1 rounded-full flex items-center justify-center gap-1 font-semibold backdrop-blur-sm max-w-fit mx-auto ${
                      improved
                        ? "text-green-300 bg-green-500/20 border border-green-500/30"
                        : "text-red-300 bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    {improved ? <FaArrowDown className="text-xs" /> : <FaArrowUp className="text-xs" />}
                    <span>{changePercent}%</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30 font-medium">
                  {improved ? "Improving" : "Needs Focus"}
                </span>
              </div>
            </div>
          </div>

          {/* TASK COMPLETION */}
          <div className="metric-card group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 w-full min-w-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-blue-500/30 rounded-full blur-sm"></div>
            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400/40 rounded-full animate-bounce"></div>
            
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-lg backdrop-blur-sm">
                  <FaCheckCircle className="text-xs sm:text-sm lg:text-base text-blue-300" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-wider">
                  ✅ Tasks
                </h3>
              </div>
              
              <div className="text-center mb-3 sm:mb-4">
                <div className="flex items-center justify-center gap-1 mb-3">
                  <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
                    {taskCompletion}
                  </span>
                  <span className="text-sm sm:text-base lg:text-xl text-blue-400 font-bold">%</span>
                </div>
                
                {/* Progress circle */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-3 relative">
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
                      stroke="url(#blueGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - taskCompletion / 100)}`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30 font-medium">
                  On Track
                </span>
              </div>
            </div>
          </div>

          {/* SKILL DISTRIBUTION */}
          <div className="metric-card group relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 col-span-1 sm:col-span-2 w-full min-w-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 bg-purple-500/30 rounded-full blur-sm"></div>
            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-2 h-2 sm:w-3 sm:h-3 bg-purple-400/40 rounded-full animate-ping"></div>
            
            <div className="relative z-10 w-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-lg backdrop-blur-sm">
                  <FaBrain className="text-xs sm:text-sm lg:text-base text-purple-300" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-purple-300 uppercase tracking-wider">
                  🧠 Skills
                </h3>
              </div>
              
              <div className="mt-2 sm:mt-4 overflow-x-auto scrollbar-custom">
                <div
                  style={{ 
                    width: `${Math.max(skillsData.length * 40, 200)}px`, 
                    minWidth: "100%" 
                  }}
                >
                  <ResponsiveContainer width="100%" height={60}>
                    <BarChart data={skillsData} margin={{ top: 5, right: 2, left: 2, bottom: 5 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#C4B5FD", fontSize: 8, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={25}
                      />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                        {skillsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={SKILL_COLORS[entry.name] || "#8B5CF6"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="text-center mt-2">
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 font-medium">
                  Multi-skilled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDev;
