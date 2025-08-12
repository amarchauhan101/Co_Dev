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
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6366F1"];

export const TaskPointsGraph = ({ profile }) => {
  const [view, setView] = useState("line");
  const history = profile?.pointHistory || [];

  const graphData = history.map((item, index) => ({
    name: `#${index + 1}`,
    date: new Date(item.date).toLocaleDateString(),
    points: item.points,
    reason: item.reason,
    size: item.points * 2,
  }));

  const getColor = (reason) => {
    if (reason.toLowerCase().includes("project")) return COLORS[0];
    if (reason.toLowerCase().includes("task")) return COLORS[1];
    if (reason.toLowerCase().includes("bonus")) return COLORS[2];
    return COLORS[3];
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <div className="flex gap-4 justify-center mb-6">
        {["line", "bar", "bubble"].map((type) => (
          <button
            key={type}
            onClick={() => setView(type)}
            className={`px-4 py-2 rounded ${
              view === type
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </button>
        ))}
      </div>

      {view === "line" && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white text-lg font-semibold mb-2">
            Points Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData}>
              <XAxis dataKey="date" stroke="#ccc" angle={-35} height={60} />
              <YAxis stroke="#ccc" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const { date, points, reason } = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow text-sm text-gray-800">
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Points:</strong> {points}
                      </p>
                      <p>
                        <strong>Reason:</strong> {reason}
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "bar" && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white text-lg font-semibold mb-2">
            Points Bar Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData}>
              <XAxis dataKey="date" stroke="#ccc" angle={-35} height={60} />
              <YAxis stroke="#ccc" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const { date, points, reason } = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow text-sm text-gray-800">
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Points:</strong> {points}
                      </p>
                      <p>
                        <strong>Reason:</strong> {reason}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="points">
                {graphData.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.reason)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === "bubble" && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white text-lg font-semibold mb-2">
            Milestone Bubble Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="date" stroke="#ccc" angle={-35} height={60} />
              <YAxis dataKey="points" stroke="#ccc" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const { date, points, reason } = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow text-sm text-gray-800">
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Points:</strong> {points}
                      </p>
                      <p>
                        <strong>Reason:</strong> {reason}
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter data={graphData} fill="#6366F1">
                {graphData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getColor(entry.reason)}
                    radius={entry.size}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
