import { useEffect, useState } from "react";
import ProjectStatusChart from "../../components/dashboard/ProjectStatusChart";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import DashboardStats from "../../components/dashboard/DashboardStats";
import BudgetPieChart from "../../components/dashboard/BudgetPieChart";
import { getDashboardData, getRecentActivity } from "../../services/dashboardService";
import TaskStatusChart from "../../components/dashboard/TaskStatusChart";
import EquipmentStatusChart from "../../components/dashboard/EquipmentStatusChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import { isAdmin } from "../../utils/permissions";


function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

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

    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await getRecentActivity(token);
        setRecentItems(response.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchSummary();

    // Recent activity is an admin-only feed; the component is only
    // rendered for admins, so no loading state reset is needed here.
    if (isAdmin()) {
      fetchRecent();
    }
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

        {isAdmin() && (
          <RecentActivity
            items={recentItems}
            loading={recentLoading}
          />
        )}

      </>

    )}

  </div>
);
}

export default Dashboard;