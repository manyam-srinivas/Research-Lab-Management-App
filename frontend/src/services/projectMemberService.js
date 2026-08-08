import api from "./api";

export const getProjectMembers = async (token, projectId) => {
  const response = await api.get(
    `/project_members/project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const addProjectMember = async (token, data) => {
  const response = await api.post(
    `/project_members/`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateProjectMember = async (
  token,
  memberId,
  data
) => {
  const response = await api.put(
    `/project_members/${memberId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteProjectMember = async (
  token,
  memberId
) => {
  const response = await api.delete(
    `/project_members/${memberId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
