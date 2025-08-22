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
    ? "bg-gradient-to-br from-slate-800/60 to-gray-900/60 backdrop-blur-sm border border-slate-600/30 transition-colors duration-200"
    : "bg-gradient-to-br from-gray-800/60 to-slate-900/60 backdrop-blur-sm border border-gray-600/30 transition-colors duration-200";

  const titleClass = isDevTheme
    ? "text-sm sm:text-base lg:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
    : "text-sm sm:text-base lg:text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent";

  const reliabilityData =
    profile.reliabilityHistory?.map((item, i) => ({
      name: `#${i + 1}`,
      score: item.score,
      date: new Date(item.date).toLocaleDateString(),
      reason: item.reason,
    })) || [
      // Fallback data if no reliability history exists
      { name: "#1", score: 85, date: "Dec 1, 2024", reason: "Consistent delivery" },
      { name: "#2", score: 92, date: "Dec 8, 2024", reason: "Quality improvements" },
      { name: "#3", score: 88, date: "Dec 15, 2024", reason: "Good communication" },
      { name: "#4", score: 95, date: "Dec 22, 2024", reason: "Excellent performance" },
      { name: "#5", score: 91, date: "Dec 29, 2024", reason: "Reliable execution" },
    ];

  // Process weekly logins data - if all logins are in same week, show daily breakdown
  const processWeeklyLogins = (loginDates) => {
    if (!loginDates || !Array.isArray(loginDates)) return [];
    
    console.log("Processing login dates:", loginDates);
    
    // First, try to group by week
    const weekGroups = {};
    
    loginDates.forEach(dateString => {
      const loginDate = new Date(dateString);
      const weekStart = new Date(loginDate);
      weekStart.setDate(loginDate.getDate() - loginDate.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]; // Use date as key
      
      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = {
          weekStart: weekStart,
          dates: [],
          count: 0
        };
      }
      weekGroups[weekKey].dates.push(dateString);
      weekGroups[weekKey].count++;
    });
    
    const weekCount = Object.keys(weekGroups).length;
    console.log("Week groups:", weekGroups, "Week count:", weekCount);
    
    // If all logins are in the same week, show daily breakdown instead
    if (weekCount === 1) {
      console.log("All logins in same week, showing daily breakdown");
      const dailyGroups = {};
      
      loginDates.forEach(dateString => {
        const loginDate = new Date(dateString);
        const dayKey = loginDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!dailyGroups[dayKey]) {
          dailyGroups[dayKey] = {
            date: loginDate,
            count: 0,
            times: []
          };
        }
        dailyGroups[dayKey].count++;
        dailyGroups[dayKey].times.push(loginDate.toLocaleTimeString());
      });
      
      const chartData = Object.entries(dailyGroups)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([dayKey, data], index) => ({
          name: data.date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          }),
          shortName: data.date.toLocaleDateString('en-US', { weekday: 'short' }),
          logins: data.count,
          weekStart: data.date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          dates: [data.date.toLocaleDateString()],
          totalDays: 1,
          times: data.times
        }));
      
      console.log("Daily chart data:", chartData);
      return chartData;
    }
    
    // Otherwise, show weekly breakdown
    const chartData = Object.entries(weekGroups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([weekKey, data], index) => ({
        name: `Week ${index + 1}`,
        shortName: `W${index + 1}`,
        logins: data.count,
        weekStart: data.weekStart.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        dates: data.dates.map(d => new Date(d).toLocaleDateString()),
        totalDays: data.dates.length
      }));
    
    console.log("Weekly chart data:", chartData);
    return chartData;
  };

  const weeklyLoginsData = profile.weeklyLogins ? 
    processWeeklyLogins(profile.weeklyLogins) : [
      // Fallback data if no weekly logins exist
      { name: "Week 1", shortName: "W1", logins: 12, weekStart: "Aug 11", totalDays: 5 },
      { name: "Week 2", shortName: "W2", logins: 15, weekStart: "Aug 18", totalDays: 6 },
      { name: "Week 3", shortName: "W3", logins: 8, weekStart: "Aug 25", totalDays: 4 },
      { name: "Week 4", shortName: "W4", logins: 18, weekStart: "Sep 1", totalDays: 7 },
      { name: "Week 5", shortName: "W5", logins: 14, weekStart: "Sep 8", totalDays: 5 },
    ];

  console.log("Final weekly logins data:", weeklyLoginsData);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-2">
      {/* Premium Revenue */}
      <section className={`${sectionClass} relative p-4 rounded-xl`}>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg">
              <FaDollarSign className="text-base text-white" />
            </div>
            <div>
              <h2 className={`${titleClass} leading-tight`}>
                💰 Premium Revenue
              </h2>
              <p className="text-gray-300 text-sm">Financial insights & growth</p>
            </div>
          </div>
          <div className="chart-container">
            <TaskPointsGraph profile={profile} />
          </div>
        </div>
      </section>

      {/* Task & Response */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className={`${sectionClass} relative p-4 rounded-xl`}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg">
                <FaTasks className="text-base text-white" />
              </div>
              <div>
                <h3 className={`${titleClass} leading-tight`}>
                  ✅ Task Completion
                </h3>
                <p className="text-gray-300 text-sm">Delivery metrics & performance</p>
              </div>
            </div>
            <div className="chart-container min-h-[250px] flex items-center justify-center">
              <TaskCompletionRate taskCompletionRates={profile.taskCompletionRates} />
            </div>
          </div>
        </section>

        <section className={`${sectionClass} relative p-4 rounded-xl`}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg">
                <FaBolt className="text-base text-white" />
              </div>
              <div>
                <h3 className={`${titleClass} leading-tight`}>
                  ⚡ Response Time
                </h3>
                <p className="text-gray-300 text-sm">Communication speed & trends</p>
              </div>
            </div>
            <div className="chart-container min-h-[250px] flex items-center justify-center">
              <ResponseTime responseTimes={profile.responseTimes} />
            </div>
          </div>
        </section>
      </div>

      {/* Reliability & Login Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Reliability Score Bar Chart */}
        <section className={`${sectionClass} relative p-4 rounded-xl`}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-lg">
                <FaShieldAlt className="text-base text-white" />
              </div>
              <div>
                <h3 className={`${titleClass} leading-tight`}>
                  🛡️ Reliability History
                </h3>
                <p className="text-gray-300 text-sm">Trust & performance evolution</p>
              </div>
            </div>
            <div className="chart-container">
              <div className="w-full h-[300px]">
                {/* Horizontal Scroll Container for Reliability Chart */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-corner-gray-800">
                  <div className="min-w-[600px] h-full">
                    {reliabilityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reliabilityData} margin={{ 
                          top: 20, 
                          right: 20, 
                          left: 20, 
                          bottom: 25 
                        }}>
                          <defs>
                            <linearGradient id="reliabilityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366F1" />
                              <stop offset="50%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#A855F7" />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="name" 
                            stroke="#9CA3AF" 
                            fontSize={12}
                            fontWeight={500}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#D1D5DB' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={12}
                            fontWeight={500}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                            tick={{ fill: '#D1D5DB' }}
                          />
                          <Tooltip
                            content={({ payload, label }) => {
                              if (!payload || !payload.length) return null;
                              const { date, score, reason } = payload[0].payload;
                              return (
                                <div className="tooltip-modern p-4 max-w-xs">
                                  <p className="text-white font-bold mb-2 text-sm">{label}</p>
                                  <div className="space-y-2">
                                    <p className="text-gray-300 text-xs">
                                      <span className="text-indigo-400 font-semibold">📅 Date:</span> {date}
                                    </p>
                                    <p className="text-gray-300 text-xs">
                                      <span className="text-indigo-400 font-semibold">📊 Score:</span> {score}%
                                    </p>
                                    <p className="text-gray-300 text-xs">
                                      <span className="text-indigo-400 font-semibold">💭 Reason:</span> {reason}
                                    </p>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="url(#reliabilityGradient)" 
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-gray-400 text-lg mb-2">📊</div>
                          <p className="text-gray-400 text-sm">No reliability data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Logins Area Chart */}
        <section className={`${sectionClass} relative p-4 rounded-xl`}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg">
                <FaCalendarAlt className="text-base text-white" />
              </div>
              <div>
                <h3 className={`${titleClass} leading-tight`}>
                  📈 Login Trends
                </h3>
                <p className="text-gray-300 text-sm">Activity patterns & engagement</p>
              </div>
            </div>
            <div className="chart-container">
              <div className="w-full h-[300px]">
                {/* Horizontal Scroll Container for Login Trends Chart */}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-corner-gray-800">
                  <div className="min-w-[600px] h-full">
                    {weeklyLoginsData?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyLoginsData} margin={{ 
                          top: 20, 
                          right: 20, 
                          left: 20, 
                          bottom: 25 
                        }}>
                          <defs>
                            <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0891B2" stopOpacity={0.8} />
                              <stop offset="50%" stopColor="#0E7490" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#155E75" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="loginStroke" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#06B6D4" />
                              <stop offset="50%" stopColor="#0891B2" />
                              <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="name" 
                            stroke="#9CA3AF" 
                            fontSize={12}
                            fontWeight={500}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#D1D5DB' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={12}
                            fontWeight={500}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#D1D5DB' }}
                          />
                          <Tooltip
                            content={({ payload, label }) => {
                              if (!payload || !payload.length) return null;
                              const data = payload[0].payload;
                              const isDailyView = data.times; // If times exist, it's daily view
                              
                              return (
                                <div className="tooltip-modern p-4 max-w-xs">
                                  <p className="text-white font-bold text-sm mb-2">📅 {label}</p>
                                  <div className="space-y-1">
                                    <p className="text-cyan-400 text-sm">
                                      🔗 Total Logins: {data.logins}
                                    </p>
                                    {data.weekStart && (
                                      <p className="text-gray-300 text-xs">
                                        📅 {isDailyView ? 'Date' : 'Week starts'}: {data.weekStart}
                                      </p>
                                    )}
                                    {data.totalDays && !isDailyView && (
                                      <p className="text-gray-300 text-xs">
                                        📊 Active days: {data.totalDays}
                                      </p>
                                    )}
                                    {data.times && (
                                      <p className="text-gray-300 text-xs">
                                        🕒 Times: {data.times.slice(0, 3).join(', ')}{data.times.length > 3 ? '...' : ''}
                                      </p>
                                    )}
                                    <p className="text-gray-400 text-xs mt-1">
                                      {isDailyView ? 'Daily' : 'Weekly'} engagement activity
                                    </p>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="logins"
                            stroke="url(#loginStroke)"
                            strokeWidth={3}
                            fill="url(#loginGradient)"
                            fillOpacity={1}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-gray-400 text-lg mb-2">📈</div>
                          <p className="text-gray-400 text-sm">No login data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};


