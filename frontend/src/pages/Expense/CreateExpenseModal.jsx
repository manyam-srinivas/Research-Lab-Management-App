import { useEffect, useMemo, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { showError, showSuccess } from "../../utils/toast";
import {
  createExpense,
  updateExpense,
} from "../../services/expenseService";

const formatINR = (value) =>
  `\u20b9${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const selectCls =
  "w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";
const labelCls =
  "block mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300";

function CreateExpenseModal({
  isOpen,
  onClose,
  departments,
  expense,
  isEditing,
  onCreated,
}) {
  const [formData, setFormData] = useState({
    department_id: "",
    project_id: "",
    budget_id: "",
    procurement_request_id: "",
    amount: "",
    expense_type: "Recurring",
    description: "",
  });

  // Locate the department + project that own a budget record (for edit).
  const findBudgetOwner = (budgetId) => {
    for (const department of departments || []) {
      const deptRecord = (department.budget_records || []).find(
        (r) => String(r.id) === String(budgetId)
      );

      if (deptRecord) {
        return { departmentId: String(department.id), projectId: "" };
      }

      for (const project of department.projects || []) {
        const found = (project.budget_records || []).some(
          (r) => String(r.id) === String(budgetId)
        );

        if (found) {
          return {
            departmentId: String(department.id),
            projectId: String(project.id),
          };
        }
      }
    }

    return { departmentId: "", projectId: "" };
  };

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && expense) {
      const owner = findBudgetOwner(expense.budget_id);

      setFormData({
        department_id: owner.departmentId,
        project_id: owner.projectId,
        budget_id: expense.budget_id ? String(expense.budget_id) : "",
        procurement_request_id: expense.procurement_request_id || "",
        amount: expense.amount || "",
        expense_type: expense.expense_type || "Recurring",
        description: expense.description || "",
      });
    } else {
      setFormData({
        department_id: "",
        project_id: "",
        budget_id: "",
        procurement_request_id: "",
        amount: "",
        expense_type: "Recurring",
        description: "",
      });
    }
  }, [isOpen, isEditing, expense]);

  const selectedDepartment = useMemo(
    () =>
      departments.find(
        (d) => String(d.id) === String(formData.department_id)
      ) || null,
    [departments, formData.department_id]
  );

  const departmentProjects = useMemo(
    () => selectedDepartment?.projects || [],
    [selectedDepartment]
  );

  const selectedProject = useMemo(
    () =>
      departmentProjects.find(
        (p) => String(p.id) === String(formData.project_id)
      ) || null,
    [departmentProjects, formData.project_id]
  );

  // Budget options: the project's budgets when a project is chosen,
  // otherwise the department's budgets.
  const budgetOptions = useMemo(() => {
    if (formData.project_id) {
      return selectedProject?.budget_records || [];
    }
    return selectedDepartment?.budget_records || [];
  }, [formData.project_id, selectedProject, selectedDepartment]);

  const selectedBudget = useMemo(
    () =>
      budgetOptions.find(
        (b) => String(b.id) === String(formData.budget_id)
      ) || null,
    [budgetOptions, formData.budget_id]
  );

  // Department budgets are the pool the department's projects draw
  // from: the spendable amount is the department-wide available
  // (allocated - spent - committed), which the overview already
  // exposes. Project budgets are capped by their own remaining.
  const remainingFor = (budget) =>
    formData.project_id
      ? Number(budget?.remaining || 0)
      : Number(selectedDepartment?.budget?.remaining || 0);

  const effectiveRemaining = selectedBudget
    ? remainingFor(selectedBudget)
    : 0;

  const amountValue = Number(formData.amount) || 0;
  const overRemaining =
    amountValue > 0 && amountValue > effectiveRemaining;

  const handleChange = (e) => {
    const next = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    setFormData(next);

    if (e.target.name === "department_id") {
      setFormData({ ...next, project_id: "", budget_id: "" });
    } else if (e.target.name === "project_id") {
      setFormData({ ...next, budget_id: "" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.department_id) {
      showError("Please select a department.");
      return;
    }

    if (!formData.budget_id) {
      showError(
        formData.project_id
          ? "This project has no budget. Select its budget or add one in the Budgets page."
          : "Please select a budget."
      );
      return;
    }

    if (!Number(formData.amount) || Number(formData.amount) <= 0) {
      showError("Please enter an amount greater than zero.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        budget_id: Number(formData.budget_id),
        project_id: formData.project_id
          ? Number(formData.project_id)
          : null,
        procurement_request_id: formData.procurement_request_id
          ? Number(formData.procurement_request_id)
          : null,
        amount: Number(formData.amount),
        expense_type: formData.expense_type,
        description: formData.description,
      };

      if (isEditing) {
        await updateExpense(token, expense.id, payload);
        showSuccess("Expense updated successfully!");
      } else {
        await createExpense(token, payload);
        showSuccess("Expense created successfully!");
      }

      setFormData({
        department_id: "",
        project_id: "",
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
        {/* Department */}
        <div>
          <label className={labelCls}>Department</label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className={selectCls}
          >
            <option value="">Select Department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project (under that department) */}
        <div>
          <label className={labelCls}>Project (optional)</label>
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            className={selectCls}
            disabled={!formData.department_id}
          >
            <option value="">— Department budget (no project) —</option>
            {departmentProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          {formData.department_id && departmentProjects.length === 0 && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              No projects in this department.
            </p>
          )}
        </div>

        {/* Budget to charge */}
        <div>
          <label className={labelCls}>Budget</label>
          <select
            name="budget_id"
            value={formData.budget_id}
            onChange={handleChange}
            className={selectCls}
            disabled={!formData.department_id}
          >
            <option value="">Select Budget</option>
            {budgetOptions.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.financial_year || "FY"} — Available{" "}
                {formatINR(remainingFor(budget))}
              </option>
            ))}
          </select>

          {formData.project_id && budgetOptions.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              No budget allocated to this project yet. Add one in the
              Budgets page, or charge the department budget instead.
            </p>
          )}
        </div>

        {/* Remaining hint */}
        {selectedBudget && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm transition ${
              overRemaining
                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
                : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {formatINR(effectiveRemaining)} available on this budget
            {overRemaining && (
              <span className="font-semibold">
                {" "}— exceeds by{" "}
                {formatINR(amountValue - effectiveRemaining)}
              </span>
            )}
          </div>
        )}

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
          <label className={labelCls}>Expense Type</label>
          <select
            name="expense_type"
            value={formData.expense_type}
            onChange={handleChange}
            className={selectCls}
          >
            <option>Recurring</option>
            <option>Non-Recurring</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
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