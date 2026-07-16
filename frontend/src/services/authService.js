import api from "./api";

export async function loginUser(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}
export async function getDashboardSummary(token) {
  const response = await api.get("/dashboard/summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
export async function getProfile(token) {
  const response = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}