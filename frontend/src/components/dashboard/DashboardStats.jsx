import {
  FaProjectDiagram,
  FaTasks,
  FaFlask,
  FaMoneyBillWave,
} from "react-icons/fa";

import StatCard from "./StatCard";

function DashboardStats({ summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatCard
  title="Projects"
  value={summary?.total_projects ?? 0}
  icon={<FaProjectDiagram />}
  color="#2563EB"
/>

<StatCard
  title="Tasks"
  value={summary?.total_tasks ?? 0}
  icon={<FaTasks />}
  color="#7C3AED"
/>

<StatCard
  title="Equipment"
  value={summary?.total_equipment ?? 0}
  icon={<FaFlask />}
  color="#22C55E"
/>

<StatCard
  title="Notifications"
  value={summary?.unread_notifications ?? 0}
  icon={<FaMoneyBillWave />}
  color="#F59E0B"
/>

    </div>
  );
}

export default DashboardStats;