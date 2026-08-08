import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import {
  createProject,
  updateProject,
} from "../../services/projectService";
import { getDepartments } from "../../services/departmentService";
import { getResearchGroups } from "../../services/researchGroupService";
import { getBudgetAvailability } from "../../services/budgetService";

import { showError, showSuccess } from "../../utils/toast";

const formatINR = (value) =>
  `\u20b9${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "Medium",
  visibility: "Private",
  status: "Draft",
  start_date: "",
  end_date: "",
  research_group_id: "",
  department_id: "",
  budget: "",
};

function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  project,
  isEditing,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [researchGroups, setResearchGroups] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- Load reference data when the modal opens -------------------------
  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");

    getDepartments(token)
      .then((res) => setDepartments(res.departments || []))
      .catch(() => showError("Failed to load departments"));

    getResearchGroups(token)
      .then((res) => setResearchGroups(res.groups || []))
      .catch(() => showError("Failed to load research groups"));
  }, [isOpen]);

  // ---- Live budget availability for the selected department --------------
  const availabilityRequestRef = useRef(0);

  const fetchAvailability = useCallback(
    (departmentId) => {
      if (!departmentId) {
        availabilityRequestRef.current += 1;
        setAvailability(null);
        setLoadingAvailability(false);
        return;
      }

      const requestId = ++availabilityRequestRef.current;
      const token = localStorage.getItem("token");

      setLoadingAvailability(true);
      getBudgetAvailability(
        token,
        departmentId,
        isEditing ? project?.id : undefined
      )
        .then((res) => {
          // Ignore stale responses from a previously selected department.
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
    },
    [isEditing, project?.id]
  );

  // ---- Seed the form for create / edit -----------------------------------
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        priority: project.priority || "Medium",
        visibility: project.visibility || "Private",
        status: project.status || "Draft",
        start_date: project.start_date ? project.start_date.slice(0, 10) : "",
        end_date: project.end_date ? project.end_date.slice(0, 10) : "",
        research_group_id: project.research_group_id
          ? String(project.research_group_id)
          : "",
        department_id: project.department_id
          ? String(project.department_id)
          : "",
        budget: project.budget ? String(project.budget) : "",
      });

      if (project.department_id) {
        fetchAvailability(String(project.department_id));
      }
    } else {
      setFormData({ ...EMPTY_FORM });
      setAvailability(null);
    }
  }, [isOpen, isEditing, project, fetchAvailability]);

  const handleChange = (e) => {
    const next = {
      ...formData,
      [e.target.name]: e.target.value,
    };

    setFormData(next);

    if (e.target.name === "department_id") {
      fetchAvailability(e.target.value);
    }
  };

  // Picking a research group auto-selects its department (still overridable).
  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    const group = researchGroups.find((g) => String(g.id) === groupId);
    const nextDepartment = group?.department_id
      ? String(group.department_id)
      : formData.department_id;

    setFormData({
      ...formData,
      research_group_id: groupId,
      department_id: nextDepartment,
    });

    fetchAvailability(nextDepartment);
  };

  const budgetValue = parseFloat(formData.budget) || 0;
  const overBudget =
    !!formData.department_id &&
    !!formData.budget &&
    availability &&
    budgetValue > availability.available;

  const canSubmit =
    formData.title.trim() &&
    !submitting &&
    !overBudget &&
    !(!!formData.department_id && !!formData.budget && loadingAvailability);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        visibility: formData.visibility,
        status: formData.status || "Draft",
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        research_group_id: formData.research_group_id
          ? Number(formData.research_group_id)
          : null,
        department_id: formData.department_id
          ? Number(formData.department_id)
          : null,
        budget: formData.budget === "" ? 0 : Number(formData.budget),
      };

      if (isEditing) {
        await updateProject(token, project.id, payload);
        showSuccess("Project updated successfully!");
      } else {
        await createProject(token, payload);
        showSuccess("Project created successfully!");
      }

      setFormData({ ...EMPTY_FORM });
      setAvailability(null);
      onProjectCreated();
      onClose();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          (isEditing
            ? "Failed to update project"
            : "Failed to create project")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectCls =
    "w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "Create Project"}
      size="max-w-2xl"
    >
      <div className="space-y-4">
        <Input
          label="Project Title"
          name="title"
          placeholder="Enter project title"
          value={formData.title}
          onChange={handleChange}
        />

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter project description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={selectCls}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className={selectCls}
            >
              <option value="Private">Private</option>
              <option value="Department Only">Department Only</option>
              <option value="Public">Public</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status || "Draft"}
              onChange={handleChange}
              disabled={!isEditing}
              className={`${selectCls} ${
                !isEditing ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />

          <Input
            label="End Date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Research Group
            </label>
            <select
              name="research_group_id"
              value={formData.research_group_id}
              onChange={handleGroupChange}
              className={selectCls}
            >
              <option value="">None</option>
              {researchGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Selecting a group auto-fills its department.
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className={selectCls}
            >
              <option value="">None</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Required to allocate a project budget.
            </p>
          </div>
        </div>

        <div>
          <Input
            label="Project Budget (&#x20B9;)"
            name="budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={formData.budget}
            onChange={handleChange}
          />

          {formData.department_id && formData.budget !== "" && (
            <div
              className={`mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                overBudget
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
                  Exceeds available budget by{" "}
                  {formatINR(budgetValue - availability.available)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting
              ? "Saving..."
              : isEditing
              ? "Update Project"
              : "Create Project"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateProjectModal;
