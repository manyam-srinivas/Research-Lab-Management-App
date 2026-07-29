import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users/");
  return response.data;
};

export const getPendingUsers = async () => {
  const response = await api.get("/users/pending");
  return response.data;
};

export const approveUser = async (userId, role) => {
  const response = await api.put(`/users/approve/${userId}`, {
    role,
  });

  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await api.put(`/users/reject/${userId}`);
  return response.data;
};

export const changeUserRole = async (userId, role) => {
  const response = await api.put(`/users/change-role/${userId}`, {
    role,
  });

  return response.data;
};

export const activateUser = async (userId) => {
  const response = await api.put(`/users/activate/${userId}`);
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.put(`/users/deactivate/${userId}`);
  return response.data;
};