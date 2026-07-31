import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

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
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Expense" : "Create Expense"}
    size="max-w-lg"
  >
    <div className="space-y-4">

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Budget
        </label>

        <select
          name="budget_id"
          value={formData.budget_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
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
      </div>

      <Input
        label="Procurement Request ID"
        type="number"
        name="procurement_request_id"
        placeholder="Optional"
        value={formData.procurement_request_id}
        onChange={handleChange}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        name="amount"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Expense Type
        </label>

        <select
          name="expense_type"
          value={formData.expense_type}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option>Recurring</option>
          <option>Non-Recurring</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing ? "Update Expense" : "Create Expense"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateExpenseModal;