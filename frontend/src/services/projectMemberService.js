import axios from "axios";

const API = "http://127.0.0.1:5000/api/project_members";

export const getProjectMembers = async (token, projectId) => {
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

export const addProjectMember = async (token, data) => {
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

export const updateProjectMember = async (
  token,
  memberId,
  data
) => {
  const response = await axios.put(
    `${API}/${memberId}`,
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
  const response = await axios.delete(
    `${API}/${memberId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};