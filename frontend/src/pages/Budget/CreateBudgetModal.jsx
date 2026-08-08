import { useEffect, useMemo, useRef, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { showSuccess, showError } from "../../utils/toast";
import {
  createBudget,
  updateBudget,
  getBudgetAvailability,
} from "../../services/budgetService";

const formatINR = (value) =>
  `\u20b9${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const selectCls =
  "w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";
const labelCls =
  "block mb-1.5 text-sm font-medium text-gray-700 dark:text-slate-300";

function CreateBudgetModal({
  isOpen,
  onClose,
  departments,
  budget,
  isEditing,
  onCreated,
  defaultType = "department",
}) {
  const [formData, setFormData] = useState({
    budget_type: "department",
    department_id: "",
    project_id: "",
    financial_year: "",
    allocated_amount: "",
  });
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const availabilityRequestRef = useRef(0);

  // Projects belonging to the currently selected department.
  const departmentProjects = useMemo(() => {
    if (!formData.department_id) return [];

    const department = departments.find(
      (d) => String(d.id) === String(formData.department_id)
    );

    return department?.projects || [];
  }, [departments, formData.department_id]);

  const fetchAvailability = (departmentId, projectId) => {
    availabilityRequestRef.current += 1;

    if (!departmentId || !projectId) {
      setAvailability(null);
      setLoadingAvailability(false);
      return;
    }

    const requestId = availabilityRequestRef.current;
    const token = localStorage.getItem("token");

    setLoadingAvailability(true);

    getBudgetAvailability(
      token,
      departmentId,
      undefined,
      isEditing ? budget?.id : undefined
    )
      .then((res) => {
        if (requestId === availabilityRequestRef.current) {
          setAvailability(res.availability || null);
        }
      })
      .catch(() => {
        if (requestId === availabilityRequestRef.current) {
          setAvailability(null);
        }
      })
      .finally(() => {
        if (requestId === availabilityRequestRef.current) {
          setLoadingAvailability(false);
        }
      });
  };

  // Find which department a project budget belongs to (used to re-open
  // an existing project budget in edit mode).
  const findProjectDepartment = (projectId) => {
    for (const department of departments || []) {
      const found = (department.projects || []).some(
        (p) => String(p.id) === String(projectId)
      );

      if (found) return String(department.id);
    }

    return "";
  };

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && budget) {
      const isProject = Boolean(budget.project_id);
      const departmentId = budget.department_id
        ? String(budget.department_id)
        : isProject
          ? findProjectDepartment(budget.project_id)
          : "";

      setFormData({
        budget_type: isProject ? "project" : "department",
        department_id: departmentId,
        project_id: budget.project_id ? String(budget.project_id) : "",
        financial_year: budget.financial_year || "",
        allocated_amount: budget.allocated_amount || "",
      });

      if (isProject && departmentId) {
        fetchAvailability(departmentId, budget.project_id);
      } else {
        setAvailability(null);
      }
    } else {
      setFormData({
        budget_type: defaultType || "department",
        department_id: "",
        project_id: "",
        financial_year: "",
        allocated_amount: "",
      });
      setAvailability(null);
    }
  }, [isOpen, isEditing, budget, defaultType]);

  const handleChange = (e) => {
    const next = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    setFormData(next);

    if (e.target.name === "department_id") {
      next.project_id = "";
      setFormData(next);
      setAvailability(null);
    } else if (e.target.name === "project_id") {
      fetchAvailability(next.department_id, next.project_id);
    }
  };

  const isProject = formData.budget_type === "project";

  const budgetValue = Number(formData.allocated_amount) || 0;
  const overBudget =
    isProject &&
    !!formData.project_id &&
    !!formData.allocated_amount &&
    availability &&
    budgetValue > availability.available;

  const canSubmit =
    !!formData.department_id &&
    !!formData.allocated_amount &&
    Number(formData.allocated_amount) > 0 &&
    !(isProject && !formData.project_id) &&
    !overBudget &&
    !(isProject && loadingAvailability);

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!formData.department_id) {
        showError("Please select a department.");
      } else if (isProject && !formData.project_id) {
        showError("Please select a project under the department.");
      } else if (isProject && overBudget) {
        showError(
          `Budget exceeds the department's available amount of ${formatINR(
            availability?.available
          )}.`
        );
      } else if (Number(formData.allocated_amount) <= 0) {
        showError("Please enter an allocated amount greater than zero.");
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        financial_year: formData.financial_year,
        allocated_amount: Number(formData.allocated_amount),
        department_id: isProject ? null : Number(formData.department_id),
        project_id: isProject ? Number(formData.project_id) : null,
      };

      if (isEditing) {
        await updateBudget(token, budget.id, payload);
        showSuccess("Budget updated successfully!");
      } else {
        await createBudget(token, payload);
        showSuccess("Budget created successfully!");
      }

      setFormData({
        budget_type: "department",
        department_id: "",
        project_id: "",
        financial_year: "",
        allocated_amount: "",
      });
      setAvailability(null);

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
        {/* Scope toggle */}
        <div>
          <label className={labelCls}>Budget applies to</label>
          <div className="flex rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
            <button
              type="button"
              disabled={isEditing}
              onClick={() => {
                setFormData({
                  ...formData,
                  budget_type: "department",
                  project_id: "",
                });
                setAvailability(null);
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                !isProject
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Department
            </button>
            <button
              type="button"
              disabled={isEditing}
              onClick={() =>
                setFormData({ ...formData, budget_type: "project" })
              }
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isProject
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Project
            </button>
          </div>
        </div>

        {/* Department - required for both scopes */}
        <div>
          <label className={labelCls}>
            Department{isProject ? " (containing the project)" : ""}
          </label>
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

        {isProject && (
          <div>
            <label className={labelCls}>Project</label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className={selectCls}
            >
              <option value="">Select Project</option>
              {departmentProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {departmentProjects.length === 0 && formData.department_id && (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                No projects in this department.
              </p>
            )}
          </div>
        )}

        {/* Availability hint for project budgets */}
        {isProject && formData.department_id && (
          <div
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm border transition ${
              overBudget
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
            }`}
          >
            <span>
              {loadingAvailability
                ? "Checking availability..."
                : availability
                ? `Available in ${
                    departments.find(
                      (d) => String(d.id) === String(formData.department_id)
                    )?.name || "department"
                  }: ${formatINR(availability.available)}`
                : "Unable to check availability"}
            </span>
            {overBudget && (
              <span className="font-semibold">
                Exceeds by {formatINR(budgetValue - availability.available)}
              </span>
            )}
          </div>
        )}

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
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isEditing ? "Update Budget" : "Create Budget"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateBudgetModal;
