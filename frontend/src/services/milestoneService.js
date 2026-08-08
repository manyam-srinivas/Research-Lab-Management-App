import api from "./api";

export const getProjectMilestones = async (
  token,
  projectId
) => {
  const response = await api.get(
    `/milestones/project/${projectId}`,
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
  const response = await api.post(
    `/milestones/`,
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
  const response = await api.put(
    `/milestones/${milestoneId}`,
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
  const response = await api.delete(
    `/milestones/${milestoneId}`,
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
  const response = await api.get(
    `/milestones/${milestoneId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
