import { useEffect, useState } from "react";

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

  if (!isOpen) return null;

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

      alert("Task updated successfully!");
    } else {
      await createTask(
        token,
        payload
      );

      alert("Task created successfully!");
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

    alert(
      isEditing
        ? "Failed to update task"
        : "Failed to create task"
    );
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Task" : "Create Task"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
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

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Blocked</option>
          </select>

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isEditing ? "Update Task" : "Create Task"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateTaskModal;