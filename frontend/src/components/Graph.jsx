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

export const Graph = ({ profile, variant = "default" }) => {
  if (!profile) return null;
  const isDevTheme = variant === "developer";

 const sectionClass = isDevTheme
  ? "bg-[#F9FAFB] text-gray-800 border border-gray-200 shadow-md"
  : "bg-gray-900 text-white border border-gray-800 shadow-xl";

const titleClass = isDevTheme
  ? "text-lg font-semibold text-indigo-700 mb-4"
  : "text-lg font-semibold text-white mb-4";

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
    <div className="w-full max-w-6xl mx-auto mt-12 space-y-10">
      {/* Premium Revenue */}
      <section className={`${sectionClass} p-6 rounded-2xl`}>
        <h2 className={`${titleClass}`}>
          📈 Premium Revenue Overview
        </h2>
        <div className="rounded-xl overflow-hidden">
          <TaskPointsGraph profile={profile} />
        </div>
      </section>

      {/* Task & Response */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className={`${sectionClass} p-6 rounded-2xl`}>
          <h3 className={`${titleClass}`}>
            ✅ Task Completion Rate
          </h3>
          <TaskCompletionRate
            taskCompletionRates={profile.taskCompletionRates}
          />
        </section>

        <section className={`${sectionClass} p-6 rounded-2xl`}>
          <h3 className={`${titleClass}`}>
            ⚡ Average Response Time
          </h3>
          <ResponseTime responseTimes={profile.responseTimes} />
        </section>
      </div>

      {/* Reliability Score Bar Chart */}
      <section className={`${sectionClass} p-6 rounded-2xl`}>
          <h3 className={`${titleClass}`}>
          🛡️ Reliability Score History
        </h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reliabilityData}>
              <XAxis dataKey="name" stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const { date, score, reason } = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded shadow text-sm text-gray-800">
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Score:</strong> {score}
                      </p>
                      <p>
                        <strong>Reason:</strong> {reason}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" fill={isDevTheme ? "#6366F1" : "#10B981"} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Weekly Logins Area Chart */}
      <section className={`${sectionClass} p-6 rounded-2xl`}>
          <h3 className={`${titleClass}`}>
          🔐 Weekly Login Trends
        </h3>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyLoginsData}>
              <defs>
                <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDevTheme ? "#6366F1" : "#EF4444"} stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                labelStyle={{ color: "#E5E7EB" }}
                itemStyle={{ color: "#F87171" }}
              />
              <Area
                type="monotone"
                dataKey="logins"
                stroke="#EF4444"
                fill="url(#loginGradient)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};


