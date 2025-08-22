import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Cell,
} from "recharts";
import { FaBolt, FaArrowUp, FaArrowDown, FaClock, FaRocket } from "react-icons/fa";

export const ResponseTime = ({ responseTimes }) => {
  const data = responseTimes?.map((t, i) => ({
    name: `Day ${i + 1}`,
    shortName: `D${i + 1}`,
    seconds: Math.round(t / 1000),
    minutes: Math.round(t / 60000),
    formatted: formatTime(t),
    raw: t,
    trend: i > 0 ? (responseTimes[i] < responseTimes[i-1] ? 'improving' : 'declining') : 'stable'
  })) || [];

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  const avgResponseTime = data.length > 0 ? 
    data.reduce((sum, item) => sum + item.raw, 0) / data.length : 0;
  const bestTime = data.length > 0 ? Math.min(...data.map(item => item.raw)) : 0;
  const latestTime = data.length > 0 ? data[data.length - 1].raw : 0;
  const trend = data.length > 1 ? 
    (latestTime < data[data.length - 2].raw ? 'improving' : 'declining') : 'stable';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <FaClock className="text-yellow-400 text-sm" />
            <p className="text-white font-bold text-sm">{label}</p>
          </div>
          <div className="space-y-2">
            <p className="text-green-400 text-sm">
              <span className="font-semibold">⚡ Response Time:</span> {data.formatted}
            </p>
            <p className="text-cyan-400 text-xs">
              <span className="font-semibold">📊 Exact:</span> {data.seconds}s
            </p>
            <div className="flex items-center gap-1 mt-2">
              {data.trend === 'improving' && (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <FaArrowDown className="text-xs" /> Improving
                </span>
              )}
              {data.trend === 'declining' && (
                <span className="flex items-center gap-1 text-red-400 text-xs">
                  <FaArrowUp className="text-xs" /> Needs attention
                </span>
              )}
              {data.trend === 'stable' && (
                <span className="text-gray-400 text-xs">Stable</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaRocket className="text-green-400 text-lg" />
            <span className="text-green-300 text-sm font-medium">Latest</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(latestTime)}</p>
          <div className="flex items-center gap-1 mt-1">
            {trend === 'improving' ? (
              <FaArrowDown className="text-green-400 text-xs" />
            ) : (
              <FaArrowUp className="text-red-400 text-xs" />
            )}
            <span className={`text-xs ${trend === 'improving' ? 'text-green-400' : 'text-red-400'}`}>
              {trend === 'improving' ? 'Improving' : 'Needs Focus'}
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaBolt className="text-blue-400 text-lg" />
            <span className="text-blue-300 text-sm font-medium">Average</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(avgResponseTime)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-purple-400 text-lg" />
            <span className="text-purple-300 text-sm font-medium">Best Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(bestTime)}</p>
        </div>
      </div>

      {/* Chart Container with Horizontal Scroll */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <FaBolt className="text-yellow-400 text-lg" />
          <h4 className="text-white text-lg font-semibold">⚡ Response Time Evolution</h4>
        </div>
        
        {/* Scrollable Chart Container */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="min-w-[600px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#059669" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="shortName" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#D1D5DB' }}
                  interval={0}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#D1D5DB' }}
                  label={{ 
                    value: 'Response Time (seconds)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#9CA3AF' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="seconds"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  fill="url(#responseGradient)"
                  fillOpacity={1}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/50">
          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaRocket className="text-blue-400" />
            Performance Insights
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="text-cyan-400 font-medium">📈 Trend:</span> 
                {trend === 'improving' ? ' Response times are improving!' : 
                 trend === 'declining' ? ' Consider optimizing response speed.' : 
                 ' Response times are stable.'}
              </p>
              <p className="text-gray-300">
                <span className="text-green-400 font-medium">🎯 Target:</span> 
                Keep response times under 2 minutes for optimal user experience.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="text-purple-400 font-medium">💡 Tip:</span> 
                Consistent quick responses build stronger collaboration.
              </p>
              <p className="text-gray-300">
                <span className="text-yellow-400 font-medium">⚡ Status:</span> 
                {avgResponseTime < 120000 ? ' Excellent response speed!' : 
                 avgResponseTime < 300000 ? ' Good response time.' : 
                 ' Room for improvement.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
