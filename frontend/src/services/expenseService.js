import api from "./api";

// Get all expenses
export const getExpenses = async (token, queryString = "") => {
  const response = await api.get(`/expenses/${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const exportExpensesCsv = async (token) => {
  const response = await api.get("/expenses/export", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  return response.data;
};

// Create expense
export const createExpense = async (token, data) => {
  const response = await api.post("/expenses/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export const updateExpense = async (
  token,
  id,
  data
) => {
  const response = await api.put(
    `/expenses/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }  
  );

  return response.data;
};

// Delete expense
export const deleteExpense = async (token, id) => {
  const response = await api.delete(`/expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};