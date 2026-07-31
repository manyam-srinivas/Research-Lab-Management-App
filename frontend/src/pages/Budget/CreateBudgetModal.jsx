import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { showSuccess, showError } from "../../utils/toast";
import {
  createBudget,
  updateBudget,
} from "../../services/budgetService";

function CreateBudgetModal({
  isOpen,
  onClose,
  departments,
  budget,
  isEditing,
  onCreated,
}) {
  const [formData, setFormData] = useState({
    department_id: "",
    financial_year: "",
    allocated_amount: "",
  });
   useEffect(() => {
  if (!isOpen) return;

  if (isEditing && budget) {
    setFormData({
      department_id: budget.department_id || "",
      financial_year: budget.financial_year || "",
      allocated_amount: budget.allocated_amount || "",
    });
  } else {
    setFormData({
      department_id: "",
      financial_year: "",
      allocated_amount: "",
    });
  }
}, [isOpen, isEditing, budget]);
  

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
      department_id: Number(formData.department_id),
      financial_year: formData.financial_year,
      allocated_amount: Number(formData.allocated_amount),
    };

    if (isEditing) {
      await updateBudget(
        token,
        budget.id,
        payload
      );

      showSuccess("Budget updated successfully!");
    } else {
      await createBudget(
        token,
        payload
      );

      showSuccess("Budget created successfully!");
    }

    setFormData({
      department_id: "",
      financial_year: "",
      allocated_amount: "",
    });

    onClose();
    onCreated();

  } catch (error) {
    console.error(error);

    showError(
  error.response?.data?.message ||
  (isEditing
    ? "Failed to update budget"
    : "Failed to create budget")
);
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Budget" : "Create Budget"}
    size="max-w-lg"
  >
    <div className="space-y-4">

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Department
        </label>

        <select
          name="department_id"
          value={formData.department_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="">
            Select Department
          </option>

          {departments.map((department) => (
            <option
              key={department.id}
              value={department.id}
            >
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Financial Year"
        name="financial_year"
        placeholder="2026-2027"
        value={formData.financial_year}
        onChange={handleChange}
      />

      <Input
        label="Allocated Amount"
        type="number"
        step="0.01"
        name="allocated_amount"
        placeholder="Allocated Amount"
        value={formData.allocated_amount}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing
            ? "Update Budget"
            : "Create Budget"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateBudgetModal;