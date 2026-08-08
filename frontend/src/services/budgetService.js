import api from "./api";

export async function getBudgets(token, queryString = "") {
  const response = await api.get(`/budgets/${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getBudgetAvailability(
  token,
  departmentId,
  excludeProjectId,
  excludeBudgetId
) {
  const params = new URLSearchParams();

  params.set("department_id", departmentId);

  if (excludeProjectId) {
    params.set("exclude_project_id", excludeProjectId);
  }

  if (excludeBudgetId) {
    params.set("exclude_budget_id", excludeBudgetId);
  }

  const response = await api.get(
    `/budgets/availability?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function exportBudgetsCsv(token) {
  const response = await api.get("/budgets/export", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
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