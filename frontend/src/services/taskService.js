import api from "./api";

export const getMilestoneTasks = async (token, milestoneId) => {
  const response = await api.get(
    `/tasks/milestone/${milestoneId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getMyTasks = async (token, projectId) => {
  const qs = projectId ? `?project_id=${projectId}` : "";
  const response = await api.get(`/tasks/my${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTask = async (token, taskId) => {
  const response = await api.get(
    `/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createTask = async (token, data) => {
  const response = await api.post(
    `/tasks/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateTask = async (
  token,
  taskId,
  data
) => {
  const response = await api.put(
    `/tasks/${taskId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteTask = async (
  token,
  taskId
) => {
  const response = await api.delete(
    `/tasks/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
