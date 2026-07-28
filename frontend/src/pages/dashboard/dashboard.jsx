import { useEffect, useState } from "react";
import ProjectStatusChart from "../../components/dashboard/ProjectStatusChart";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import DashboardStats from "../../components/dashboard/DashboardStats";
import BudgetPieChart from "../../components/dashboard/BudgetPieChart";
import { getDashboardData } from "../../services/dashboardService";
import TaskStatusChart from "../../components/dashboard/TaskStatusChart";
import EquipmentStatusChart from "../../components/dashboard/EquipmentStatusChart";


function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await getDashboardData(token);

        setDashboardData(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <>
      <WelcomeBanner />

      <div className="mt-8">
        <DashboardStats
  summary={dashboardData?.summary}
  finance={dashboardData?.finance}
  equipment={dashboardData?.equipment}
  tasks={dashboardData?.tasks}
/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  <ProjectStatusChart
    summary={dashboardData?.summary}
  />

  <BudgetPieChart
    finance={dashboardData?.finance}
  />
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  <TaskStatusChart
    tasks={dashboardData?.tasks}
  />

  <EquipmentStatusChart
    equipment={dashboardData?.equipment}
  />
</div>
    </>
  );
}

export default Dashboard;