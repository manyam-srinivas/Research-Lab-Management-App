import { useState } from "react";
import { createBudget } from "../../services/budgetService";

function CreateBudgetModal({
  isOpen,
  onClose,
  departments,
  onCreated,
}) {
  const [formData, setFormData] = useState({
    department_id: "",
    financial_year: "",
    allocated_amount: "",
  });

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

      await createBudget(token, {
        department_id: Number(formData.department_id),
        financial_year: formData.financial_year,
        allocated_amount: Number(formData.allocated_amount),
      });

      alert("Budget created successfully!");

      setFormData({
        department_id: "",
        financial_year: "",
        allocated_amount: "",
      });

      onClose();
      onCreated();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to create budget"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-lg rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Create Budget
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
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

          <input
            name="financial_year"
            placeholder="Financial Year (e.g. 2026-2027)"
            value={formData.financial_year}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            step="0.01"
            name="allocated_amount"
            placeholder="Allocated Amount"
            value={formData.allocated_amount}
            onChange={handleChange}
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
            Create Budget
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateBudgetModal;