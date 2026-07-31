import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#22C55E",
];

function ProjectStatusChart({ summary }) {
  const data = [
    {
      name: "Active",
      value: summary?.active_projects ?? 0,
    },
    {
      name: "Other",
      value:
        (summary?.total_projects ?? 0) -
        (summary?.active_projects ?? 0),
    },
  ];

  const hasData =
    (summary?.total_projects ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

      <div className="mb-5">

        <h2 className="text-xl font-semibold text-gray-900">
          Project Status
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Distribution of active and inactive projects.
        </p>

      </div>

      <div className="h-80">

        {!hasData ? (

          <div className="flex h-full items-center justify-center">

            <p className="text-gray-400">
              No project data available.
            </p>

          </div>

        ) : (

          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>
  );
}

export default ProjectStatusChart;