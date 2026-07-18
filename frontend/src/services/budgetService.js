import api from "./api";

export async function getBudgets(token) {
  const response = await api.get("/budgets/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createBudget(token, budgetData) {
  const response = await api.post(
    "/budgets/",
    budgetData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateBudget(token, id, budgetData) {
  const response = await api.put(
    `/budgets/${id}`,
    budgetData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteBudget(token, id) {
  const response = await api.delete(
    `/budgets/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}