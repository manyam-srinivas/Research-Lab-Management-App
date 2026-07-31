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
  <div className="space-y-8">

    <WelcomeBanner />

    {!dashboardData ? (

      <div className="flex justify-center items-center py-32">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-gray-500">
            Loading Dashboard...
          </p>

        </div>

      </div>

    ) : (

      <>

        <DashboardStats
          summary={dashboardData.summary}
          finance={dashboardData.finance}
          equipment={dashboardData.equipment}
          tasks={dashboardData.tasks}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <ProjectStatusChart
            summary={dashboardData.summary}
          />

          <BudgetPieChart
            finance={dashboardData.finance}
          />

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <TaskStatusChart
            tasks={dashboardData.tasks}
          />

          <EquipmentStatusChart
            equipment={dashboardData.equipment}
          />

        </div>

      </>

    )}

  </div>
);
}

export default Dashboard;