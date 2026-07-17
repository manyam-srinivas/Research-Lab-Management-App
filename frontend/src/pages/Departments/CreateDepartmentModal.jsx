import { useState } from "react";
import { createDepartment } from "../../services/departmentService";

function CreateDepartmentModal({
  isOpen,
  onClose,
  onDepartmentCreated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

      await createDepartment(token, formData);

      alert("Department created successfully!");

      setFormData({
        name: "",
        description: "",
      });

      onClose();
      onDepartmentCreated();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create department"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Create Department
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Department Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="description"
            placeholder="Department Description"
            value={formData.description}
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
            Create Department
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateDepartmentModal;