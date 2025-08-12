import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TaskCompletionRate = ({ taskCompletionRates }) => {
  const completed = taskCompletionRates[0];
  const total = taskCompletionRates[1];
  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: total - completed },
  ];

  const COLORS = ["#10B981", "#F87171"];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h3 className="text-white font-semibold text-lg mb-4">✅ Task Completion Rate</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskCompletionRate;
