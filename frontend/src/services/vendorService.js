import api from "./api";

export async function getVendors(token) {
  const response = await api.get("/vendors/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createVendor(token, vendorData) {
  const response = await api.post(
    "/vendors/",
    vendorData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateVendor(token, id, vendorData) {
  const response = await api.put(
    `/vendors/${id}`,
    vendorData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteVendor(token, id) {
  const response = await api.delete(
    `/vendors/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}