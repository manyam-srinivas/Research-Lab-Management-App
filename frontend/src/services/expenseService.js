import api from "./api";

// Get all expenses
export const getExpenses = async (token) => {
  const response = await api.get("/expenses/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

// Delete expense
export const deleteExpense = async (token, id) => {
  const response = await api.delete(`/expenses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};