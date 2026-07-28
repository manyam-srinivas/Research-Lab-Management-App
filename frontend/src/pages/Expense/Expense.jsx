import { useEffect, useState } from "react";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";

import { getDepartments } from "../../services/departmentService";

import {
  getExpenses,
  deleteExpense,
} from "../../services/expenseService";

import { getBudgets } from "../../services/budgetService";

import CreateExpenseModal from "./CreateExpenseModal";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
  try {
    const [
      expenseResponse,
      budgetResponse,
      departmentResponse,
    ] = await Promise.all([
      getExpenses(token),
      getBudgets(token),
      getDepartments(token),
    ]);

    setExpenses(expenseResponse.expenses);
    setBudgets(budgetResponse.budgets);
    setDepartments(departmentResponse.departments);

  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const getBudgetName = (budgetId) => {
  const budget = budgets.find(
    (b) => b.id === budgetId
  );

  if (!budget) return "-";

  const department = departments.find(
    (d) => d.id === budget.department_id
  );

  return `${department?.name || "-"} (${budget.financial_year})`;
};
  const handleEdit = (expense) => {
  setSelectedExpense(expense);
  setIsEditing(true);
  setIsModalOpen(true);
};
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await deleteExpense(token, id);
      fetchData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete expense"
      );
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Expense Management
        </h1>

        {hasRole(...PERMISSIONS.EXPENSE_CREATE) && (
  <button
    onClick={() => {
  setSelectedExpense(null);
  setIsEditing(false);
  setIsModalOpen(true);
}}
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
  >
    + Create Expense
  </button>
)}

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Budget
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Description
              </th>

              <th className="p-4 text-left">
                Created At
              </th>

              {hasRole(...PERMISSIONS.EXPENSE_MANAGE) && (
  <th className="p-4 text-center">
    Actions
  </th>
)}

            </tr>

          </thead>

          <tbody>

            {expenses.length > 0 ? (

              expenses.map((expense) => (

                <tr
                  key={expense.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {getBudgetName(
                      expense.budget_id
                    )}
                  </td>

                  <td className="p-4">
                    ₹{expense.amount}
                  </td>

                  <td className="p-4">
                    {expense.expense_type}
                  </td>

                  <td className="p-4">
                    {expense.description}
                  </td>

                  <td className="p-4">
                    {expense.created_at}
                  </td>

                  {hasRole(...PERMISSIONS.EXPENSE_MANAGE) && (
  <td className="p-4 text-center">

  <button
    onClick={() => handleEdit(expense)}
    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
  >
    Edit
  </button>

  <button
    onClick={() =>
      handleDelete(expense.id)
    }
    className="bg-red-600 text-white px-3 py-1 rounded"
  >
    Delete
  </button>

</td>
)}

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={
  hasRole(...PERMISSIONS.EXPENSE_MANAGE)
    ? 6
    : 5
}
                  className="text-center p-8 text-slate-500"
                >
                  No Expenses Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateExpenseModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedExpense(null);
    setIsEditing(false);
  }}
  budgets={budgets}
  expense={selectedExpense}
  isEditing={isEditing}
  onCreated={fetchData}
/>

    </>
  );
}

export default Expenses;