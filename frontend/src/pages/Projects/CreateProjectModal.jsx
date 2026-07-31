import { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import {
  createProject,
  updateProject,
} from "../../services/projectService";

import { showError, showSuccess } from "../../utils/toast";

function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  project,
  isEditing,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    visibility: "Private",
    start_date: "",
    end_date: "",
    research_group_id: "1",
  });
  useEffect(() => {
  if (isEditing && project) {
    setFormData({
      title: project.title || "",
      description: project.description || "",
      priority: project.priority || "Medium",
      visibility: project.visibility || "Private",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      research_group_id: project.research_group_id || "1",
    });
  } else {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      visibility: "Private",
      start_date: "",
      end_date: "",
      research_group_id: "1",
    });
  }
}, [project, isEditing]);

  
  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    if (isEditing) {
      await updateProject(token, project.id, formData);

      showSuccess("Project updated successfully!");
    } else {
      await createProject(token, formData);

      showSuccess("Project created successfully!");
    }

    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      visibility: "Private",
      start_date: "",
      end_date: "",
      research_group_id: "1",
    });

    onClose();
    onProjectCreated();

  } catch (error) {
    showError(
      error.response?.data?.message ||
      (isEditing
        ? "Failed to update project"
        : "Failed to create project")
    );
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Project" : "Create Project"}
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
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
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
            className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option>Private</option>
            <option>Public</option>
          </select>
        </div>

        <Input
          label="Start Date"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
        />

        <Input
          label="End Date"
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
        />

      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
        >
          {isEditing ? "Update Project" : "Create Project"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateProjectModal;