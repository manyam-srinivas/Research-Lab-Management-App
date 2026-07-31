import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { showError, showSuccess } from "../../utils/toast";

import {
  createTask,
  updateTask,
} from "../../services/taskService";

function CreateTaskModal({
  isOpen,
  onClose,
  milestoneId,
  users,
  task,
  isEditing,
  onTaskCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    status: "Pending",
    due_date: "",
  });
  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && task) {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      assigned_to: task.assigned_to
        ? String(task.assigned_to)
        : "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      due_date: task.due_date || "",
    });
  } else {
    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      priority: "Medium",
      status: "Pending",
      due_date: "",
    });
  }
}, [isOpen, isEditing, task]);

  

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
      milestone_id: milestoneId,
      assigned_to: formData.assigned_to
        ? Number(formData.assigned_to)
        : null,
    };

    if (isEditing) {
      await updateTask(
        token,
        task.id,
        payload
      );

      showSuccess("Task updated successfully!");
    } else {
      await createTask(
        token,
        payload
      );

      showSuccess("Task created successfully!");
    }

    setFormData({
      title: "",
      description: "",
      assigned_to: "",
      priority: "Medium",
      status: "Pending",
      due_date: "",
    });

    onTaskCreated();
    onClose();

  } catch (error) {
    console.error(error);

    showError(
      isEditing
        ? "Failed to update task"
        : "Failed to create task"
    );
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Task" : "Create Task"}
    size="max-w-xl"
  >
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        label="Task Title"
        type="text"
        name="title"
        placeholder="Task Title"
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

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Assign User
        </label>

        <select
          name="assigned_to"
          value={formData.assigned_to}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option value="">
            Assign User (Optional)
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Priority
        </label>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>

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
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Blocked</option>
        </select>
      </div>

      <Input
        label="Due Date"
        type="date"
        name="due_date"
        value={formData.due_date}
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
          {isEditing ? "Update Task" : "Create Task"}
        </Button>

      </div>
    </form>
  </Modal>
);
}

export default CreateTaskModal;