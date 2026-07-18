import api from "./api";

export async function getEquipment(token) {
  const response = await api.get("/equipment/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createEquipment(token, equipmentData) {
  const response = await api.post(
    "/equipment/",
    equipmentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateEquipment(token, id, equipmentData) {
  const response = await api.put(
    `/equipment/${id}`,
    equipmentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteEquipment(token, id) {
  const response = await api.delete(
    `/equipment/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}