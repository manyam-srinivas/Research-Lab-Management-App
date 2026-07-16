import { useState } from "react";
import { createProject } from "../../services/projectService";

function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    visibility: "Private",
    start_date: "",
    end_date: "",
    research_group_id: "1",
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

      await createProject(token, formData);

      alert("Project created successfully!");

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
      alert(
        error.response?.data?.message ||
        "Failed to create project"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-2xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Create Project
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            name="title"
            placeholder="Project Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <div className="grid grid-cols-2 gap-4">

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="border rounded-lg p-3"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="border rounded-lg p-3"
            >
              <option>Private</option>
              <option>Public</option>
            </select>

            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />

            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="border rounded-lg p-3"
            />

          </div>

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
            Create Project
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateProjectModal;