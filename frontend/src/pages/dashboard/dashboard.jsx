import DashboardLayout from "../../layouts/DashboardLayout";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import DashboardStats from "../../components/dashboard/DashboardStats";

function Dashboard() {
  return (
    <DashboardLayout>

      <WelcomeBanner />

      <div className="mt-8">
        <DashboardStats />
      </div>

    </DashboardLayout>
  );
}

export default Dashboard;