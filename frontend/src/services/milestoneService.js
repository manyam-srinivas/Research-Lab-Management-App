import axios from "axios";

const API = "http://127.0.0.1:5000/api/milestones";

export const getProjectMilestones = async (
  token,
  projectId
) => {
  const response = await axios.get(
    `${API}/project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const createMilestone = async (
  token,
  data
) => {
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

export const updateMilestone = async (
  token,
  milestoneId,
  data
) => {
  const response = await axios.put(
    `${API}/${milestoneId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteMilestone = async (
  token,
  milestoneId
) => {
  const response = await axios.delete(
    `${API}/${milestoneId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getMilestone = async (
  token,
  milestoneId
) => {
  const response = await axios.get(
    `${API}/${milestoneId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};