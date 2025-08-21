import {
  AreaChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
} from "recharts";
import {TaskPointsGraph} from "./TaskPointsGraph"
import { ResponseTime } from "./ResponseTime";
import TaskCompletionRate from "./TaskCompletionRate";
import { FaChartLine, FaTasks, FaBolt, FaShieldAlt, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import './AnalyticsStyles.css';

export const Graph = ({ profile, variant = "default" }) => {
  if (!profile) return null;
  const isDevTheme = variant === "developer";

  const sectionClass = isDevTheme
    ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500"
    : "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500";

  const titleClass = isDevTheme
    ? "text-sm sm:text-base lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
    : "text-sm sm:text-base lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent";

  const reliabilityData =
    profile.reliabilityHistory?.map((item, i) => ({
      name: `#${i + 1}`,
      score: item.score,
      date: new Date(item.date).toLocaleDateString(),
      reason: item.reason,
    })) || [];

  const weeklyLoginsData =
    profile.weeklyLogins?.map((_, index) => ({
      name: `Week ${index + 1}`,
      logins: 1,
    })) || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8 px-1 sm:px-2">
      {/* Premium Revenue */}
      <section className={`${sectionClass} section-fade-in relative overflow-hidden p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl xl:rounded-3xl group`}>
        {/* Animated background elements */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-24 xl:h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 lg:bottom-4 lg:left-4 w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-20 xl:h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg lg:rounded-xl xl:rounded-2xl shadow-lg icon-float">
              <FaDollarSign className="text-sm sm:text-base lg:text-lg xl:text-2xl text-white icon-glow" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className={`${titleClass} leading-tight`}>
                💰 Premium Revenue
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Financial insights</p>
            </div>
          </div>
          <div className="chart-container">
            <TaskPointsGraph profile={profile} />
          </div>
        </div>
      </section>

      {/* Task & Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
        <section className={`${sectionClass} section-fade-in relative overflow-hidden p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl xl:rounded-3xl group`}>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-20 xl:h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg lg:rounded-xl xl:rounded-2xl shadow-lg icon-float">
                <FaTasks className="text-sm sm:text-base lg:text-lg xl:text-2xl text-white icon-glow" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className={`${titleClass} leading-tight`}>
                  ✅ Task Completion
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">Delivery metrics</p>
              </div>
            </div>
            <div className="chart-container">
              <TaskCompletionRate taskCompletionRates={profile.taskCompletionRates} />
            </div>
          </div>
        </section>

        <section className={`${sectionClass} section-fade-in relative overflow-hidden p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl xl:rounded-3xl group`}>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-20 xl:h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg lg:rounded-xl xl:rounded-2xl shadow-lg icon-float">
                <FaBolt className="text-sm sm:text-base lg:text-lg xl:text-2xl text-white icon-glow" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className={`${titleClass} leading-tight`}>
                  ⚡ Response Time
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">Communication speed</p>
              </div>
            </div>
            <div className="chart-container">
              <ResponseTime responseTimes={profile.responseTimes} />
            </div>
          </div>
        </section>
      </div>

      {/* Reliability Score Bar Chart */}
      <section className={`${sectionClass} section-fade-in relative overflow-hidden p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl xl:rounded-3xl group`}>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-24 xl:h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 lg:bottom-4 lg:left-4 w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-20 xl:h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg lg:rounded-xl xl:rounded-2xl shadow-lg icon-float">
              <FaShieldAlt className="text-sm sm:text-base lg:text-lg xl:text-2xl text-white icon-glow" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className={`${titleClass} leading-tight`}>
                🛡️ Reliability History
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">Trust & performance</p>
            </div>
          </div>
          <div className="chart-container">
            <div className="w-full h-[200px] sm:h-[250px] lg:h-[300px] xl:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reliabilityData} margin={{ 
                  top: 10, 
                  right: 10, 
                  left: 10, 
                  bottom: 15 
                }}>
                  <defs>
                    <linearGradient id="reliabilityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={8}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={8}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload || !payload.length) return null;
                      const { date, score, reason } = payload[0].payload;
                      return (
                        <div className="tooltip-modern p-2 sm:p-3 lg:p-4 shadow-2xl max-w-xs">
                          <p className="text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">{label}</p>
                          <p className="text-gray-300 text-xs">
                            <span className="text-purple-400">Date:</span> {date}
                          </p>
                          <p className="text-gray-300 text-xs">
                            <span className="text-purple-400">Score:</span> {score}%
                          </p>
                          <p className="text-gray-300 text-xs">
                            <span className="text-purple-400">Reason:</span> {reason}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="url(#reliabilityGradient)" 
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity duration-300"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Logins Area Chart */}
      <section className={`${sectionClass} section-fade-in relative overflow-hidden p-3 sm:p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl xl:rounded-3xl group`}>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-24 xl:h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 lg:bottom-4 lg:left-4 w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-20 xl:h-20 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg lg:rounded-xl xl:rounded-2xl shadow-lg icon-float">
              <FaCalendarAlt className="text-sm sm:text-base lg:text-lg xl:text-2xl text-white icon-glow" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className={`${titleClass} leading-tight`}>
                📈 Login Trends
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">Activity patterns</p>
            </div>
          </div>
          <div className="chart-container">
            <div className="w-full h-[200px] sm:h-[220px] lg:h-[260px] xl:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyLoginsData} margin={{ 
                  top: 10, 
                  right: 10, 
                  left: 10, 
                  bottom: 15 
                }}>
                  <defs>
                    <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDevTheme ? "#06B6D4" : "#06B6D4"} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={isDevTheme ? "#06B6D4" : "#06B6D4"} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="loginStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={8}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={8}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ payload, label }) => {
                      if (!payload || !payload.length) return null;
                      return (
                        <div className="tooltip-modern p-2 sm:p-3 lg:p-4 shadow-2xl">
                          <p className="text-white font-semibold text-xs sm:text-sm">{label}</p>
                          <p className="text-cyan-400 text-xs sm:text-sm">
                            Logins: {payload[0].value}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logins"
                    stroke="url(#loginStroke)"
                    strokeWidth={2}
                    fill="url(#loginGradient)"
                    fillOpacity={1}
                    className="drop-shadow-lg"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


