import { useEffect, useState } from "react";

import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import DashboardStats from "../../components/dashboard/DashboardStats";

import { getDashboardSummary } from "../../services/authService";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await getDashboardSummary(token);

        setSummary(response.summary);
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
        <DashboardStats summary={summary} />
      </div>
    </>
  );
}

export default Dashboard;