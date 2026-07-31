import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import {
  createMilestone,
  updateMilestone,
} from "../../services/milestoneService";

import { showError, showSuccess } from "../../utils/toast";

function CreateMilestoneModal({
  isOpen,
  onClose,
  projectId,
  milestone,
  isEditing,
  onMilestoneCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "Pending",
    completion_percentage: 0,
  });
  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && milestone) {
    setFormData({
      title: milestone.title || "",
      description: milestone.description || "",
      due_date: milestone.due_date || "",
      status: milestone.status || "Pending",
      completion_percentage:
        milestone.completion_percentage ?? 0,
    });
  } else {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      status: "Pending",
      completion_percentage: 0,
    });
  }
}, [isOpen, isEditing, milestone]);

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      project_id: projectId,
      completion_percentage: Number(
        formData.completion_percentage
      ),
    };

    if (isEditing) {
      await updateMilestone(
        token,
        milestone.id,
        payload
      );

      showSuccess("Milestone updated successfully!");
    } else {
      await createMilestone(
        token,
        payload
      );

      showSuccess("Milestone created successfully!");
    }

    setFormData({
      title: "",
      description: "",
      due_date: "",
      status: "Pending",
      completion_percentage: 0,
    });

    onMilestoneCreated();
    onClose();

  } catch (error) {
    console.error(error);

    showError(
      isEditing
        ? "Failed to update milestone"
        : "Failed to create milestone"
    );
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Milestone" : "Create Milestone"}
    size="max-w-xl"
  >
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        label="Title"
        type="text"
        name="title"
        placeholder="Title"
        required
        value={formData.title}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          name="description"
          placeholder="Description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      <Input
        label="Due Date"
        type="date"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <Input
        label="Completion Percentage"
        type="number"
        name="completion_percentage"
        min="0"
        max="100"
        value={formData.completion_percentage}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {isEditing ? "Update" : "Create"}
        </Button>

      </div>
    </form>
  </Modal>
);
}

export default CreateMilestoneModal;
