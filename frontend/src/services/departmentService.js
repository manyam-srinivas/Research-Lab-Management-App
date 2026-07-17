import api from "./api";

export async function getDepartments(token) {
  const response = await api.get("/departments/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createDepartment(token, departmentData) {
  const response = await api.post(
    "/departments/",
    departmentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateDepartment(token, id, departmentData) {
  const response = await api.put(
    `/departments/${id}`,
    departmentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteDepartment(token, id) {
  const response = await api.delete(
    `/departments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}