import axios from "axios";

const API = "http://127.0.0.1:5000/api/tasks";

export const getMilestoneTasks = async (token, milestoneId) => {
  const response = await axios.get(
    `${API}/milestone/${milestoneId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getTask = async (token, taskId) => {
  const response = await axios.get(
    `${API}/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createTask = async (token, data) => {
  const response = await axios.post(
    `${API}/`,
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
  const response = await axios.put(
    `${API}/${taskId}`,
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
  const response = await axios.delete(
    `${API}/${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};