import {
  FaProjectDiagram,
  FaTasks,
  FaFlask,
  FaMoneyBillWave,
} from "react-icons/fa";

import StatCard from "./StatCard";

function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatCard
        title="Projects"
        value="15"
        icon={<FaProjectDiagram />}
        color="#2563EB"
      />

      <StatCard
        title="Tasks"
        value="42"
        icon={<FaTasks />}
        color="#7C3AED"
      />

      <StatCard
        title="Equipment"
        value="30"
        icon={<FaFlask />}
        color="#22C55E"
      />

      <StatCard
        title="Budget"
        value="₹5,00,000"
        icon={<FaMoneyBillWave />}
        color="#F59E0B"
      />

    </div>
  );
}

export default DashboardStats;