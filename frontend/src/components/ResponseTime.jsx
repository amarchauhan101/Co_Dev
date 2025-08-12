import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const ResponseTime = ({ responseTimes }) => {
  const data =
    responseTimes?.map((t, i) => ({
      name: `#${i + 1}`,
      seconds: Math.round(t / 1000),
    })) || [];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h3 className="text-white text-lg font-semibold mb-4">📈 Response Time Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" unit="s" />
          <Tooltip />
          <Line type="monotone" dataKey="seconds" stroke="#10B981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
