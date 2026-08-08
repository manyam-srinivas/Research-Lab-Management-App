import api from "./api";

export const getDashboardData = async (token) => {
  const response = await api.get("/dashboard/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getRecentActivity = async (token) => {
  const response = await api.get("/dashboard/recent", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};