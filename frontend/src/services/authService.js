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

export async function updateProfile(token, profileData) {
  const response = await api.put("/auth/profile", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function changePassword(token, oldPassword, newPassword) {
  const response = await api.put(
    "/auth/change-password",
    { old_password: oldPassword, new_password: newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
export async function registerUser(userData) {
  const response = await api.post("/auth/register", userData);

  return response.data;
}

export async function verifyEmail(token) {
  const response = await api.get(`/auth/verify-email/${token}`);

  return response.data;
}