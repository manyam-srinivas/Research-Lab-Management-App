import api from "./api";

export async function getProcurementRequests(token) {
  const response = await api.get("/procurement/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createProcurementRequest(token, requestData) {
  const response = await api.post(
    "/procurement/",
    requestData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateProcurementStatus(token, id, status) {
  const response = await api.put(
    `/procurement/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteProcurementRequest(token, id) {
  const response = await api.delete(
    `/procurement/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}