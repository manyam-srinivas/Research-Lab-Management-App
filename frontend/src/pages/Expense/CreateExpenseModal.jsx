import { useEffect, useState } from "react";
import { showError, showSuccess } from "../../utils/toast";
import {
  createExpense,
  updateExpense,
} from "../../services/expenseService";

function CreateExpenseModal({
  isOpen,
  onClose,
  budgets,
  expense,
  isEditing,
  onCreated,
}) {
  const [formData, setFormData] = useState({
    budget_id: "",
    procurement_request_id: "",
    amount: "",
    expense_type: "Recurring",
    description: "",
  });
  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && expense) {
    setFormData({
      budget_id: expense.budget_id || "",
      procurement_request_id:
        expense.procurement_request_id || "",
      amount: expense.amount || "",
      expense_type:
        expense.expense_type || "Recurring",
      description: expense.description || "",
    });
  } else {
    setFormData({
      budget_id: "",
      procurement_request_id: "",
      amount: "",
      expense_type: "Recurring",
      description: "",
    });
  }
}, [isOpen, isEditing, expense]);
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
      budget_id: Number(formData.budget_id),
      procurement_request_id:
        formData.procurement_request_id
          ? Number(formData.procurement_request_id)
          : null,
      amount: Number(formData.amount),
      expense_type: formData.expense_type,
      description: formData.description,
    };

    if (isEditing) {
      await updateExpense(
        token,
        expense.id,
        payload
      );

      showSuccess("Expense updated successfully!");
    } else {
      await createExpense(
        token,
        payload
      );

      showSuccess("Expense created successfully!");
    }

    setFormData({
      budget_id: "",
      procurement_request_id: "",
      amount: "",
      expense_type: "Recurring",
      description: "",
    });

    onClose();
    onCreated();

  } catch (error) {
    console.error(error);

    showError(
      error.response?.data?.message ||
      (isEditing
        ? "Failed to update expense"
        : "Failed to create expense")
    );
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-lg rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            {isEditing
  ? "Edit Expense"
  : "Create Expense"}
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <select
            name="budget_id"
            value={formData.budget_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              Select Budget
            </option>

            {budgets.map((budget) => (
              <option
                key={budget.id}
                value={budget.id}
              >
                Budget #{budget.id} ({budget.financial_year})
              </option>
            ))}
          </select>

          <input
            type="number"
            name="procurement_request_id"
            placeholder="Procurement Request ID (Optional)"
            value={formData.procurement_request_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            step="0.01"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="expense_type"
            value={formData.expense_type}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>Recurring</option>
            <option>Non-Recurring</option>
          </select>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg p-3"
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            {isEditing
  ? "Update Expense"
  : "Create Expense"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateExpenseModal;