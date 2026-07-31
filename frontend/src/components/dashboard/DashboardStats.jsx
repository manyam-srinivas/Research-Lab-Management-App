import {
  FaProjectDiagram,
  FaTasks,
  FaFlask,
  FaMoneyBillWave,
} from "react-icons/fa";

import StatCard from "./StatCard";

function DashboardStats({
  summary,
  finance,
  equipment,
  tasks,
}) {
  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatCard
        title="Projects"
        value={summary?.total_projects ?? 0}
        icon={<FaProjectDiagram />}
        color="#2563EB"
      />

      <StatCard
        title="Active Projects"
        value={summary?.active_projects ?? 0}
        icon={<FaProjectDiagram />}
        color="#3B82F6"
      />

      <StatCard
        title="Tasks"
        value={tasks?.total ?? 0}
        icon={<FaTasks />}
        color="#7C3AED"
      />

      <StatCard
        title="Completed Tasks"
        value={tasks?.completed ?? 0}
        icon={<FaTasks />}
        color="#8B5CF6"
      />

      <StatCard
        title="Equipment"
        value={equipment?.total ?? 0}
        icon={<FaFlask />}
        color="#22C55E"
      />

      <StatCard
        title="Available Equipment"
        value={equipment?.available ?? 0}
        icon={<FaFlask />}
        color="#16A34A"
      />

      <StatCard
        title="Budget"
        value={formatCurrency(finance?.total_budget)}
        icon={<FaMoneyBillWave />}
        color="#F59E0B"
      />

      <StatCard
        title="Budget Remaining"
        value={formatCurrency(finance?.remaining_budget)}
        icon={<FaMoneyBillWave />}
        color="#EA580C"
      />

    </div>
  );
}

export default DashboardStats;