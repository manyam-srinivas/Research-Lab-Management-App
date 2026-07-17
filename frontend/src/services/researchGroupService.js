import api from "./api";

export async function getResearchGroups(token) {
  const response = await api.get("/research-groups/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createResearchGroup(token, groupData) {
  const response = await api.post(
    "/research-groups/",
    groupData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateResearchGroup(token, id, groupData) {
  const response = await api.put(
    `/research-groups/${id}`,
    groupData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteResearchGroup(token, id) {
  const response = await api.delete(
    `/research-groups/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}