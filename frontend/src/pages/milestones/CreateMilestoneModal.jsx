import { useState } from "react";
import { createMilestone } from "../../services/milestoneService";

function CreateMilestoneModal({
  isOpen,
  onClose,
  projectId,
  onMilestoneCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "Pending",
    completion_percentage: 0,
  });

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

      await createMilestone(token, {
        ...formData,
        project_id: projectId,
      });

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
      alert("Failed to create milestone");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">

        <h2 className="text-2xl font-bold mb-6">
          Create Milestone
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
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

          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Completed">
              Completed
            </option>
          </select>

          <div>
            <label className="block mb-2 font-medium">
              Completion Percentage
            </label>

            <input
              type="number"
              name="completion_percentage"
              min="0"
              max="100"
              value={formData.completion_percentage}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CreateMilestoneModal;
