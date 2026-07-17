import api from "./api";

export async function getProjects(token) {
  const response = await api.get("/projects/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createProject(token, projectData) {
  const response = await api.post(
    "/projects/",
    projectData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateProject(token, id, projectData) {
  const response = await api.put(
    `/projects/${id}`,
    projectData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteProject(token, id) {
  const response = await api.delete(
    `/projects/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}