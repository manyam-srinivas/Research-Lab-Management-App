import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function EquipmentStatusChart({ equipment }) {
  const data = [
    {
      name: "Available",
      value: equipment?.available ?? 0,
    },
    {
      name: "Booked",
      value: equipment?.booked ?? 0,
    },
    {
      name: "Maintenance",
      value: equipment?.maintenance ?? 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Equipment Status
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="value"
              fill="#22C55E"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EquipmentStatusChart;