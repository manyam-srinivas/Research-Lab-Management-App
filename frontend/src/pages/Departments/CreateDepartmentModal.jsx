import { useState, useEffect } from "react";
import { showSuccess, showError } from "../../utils/toast";
import {
  createDepartment,
  updateDepartment,
} from "../../services/departmentService";

function CreateDepartmentModal({
  isOpen,
  onClose,
  onDepartmentCreated,
  department,
  isEditing,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  useEffect(() => {
  if (isEditing && department) {
    setFormData({
      name: department.name || "",
      description: department.description || "",
    });
  } else {
    setFormData({
      name: "",
      description: "",
    });
  }
}, [department, isEditing]);
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

    if (isEditing) {
      await updateDepartment(
        token,
        department.id,
        formData
      );

      showSuccess("Department updated successfully!");
    } else {
      await createDepartment(
        token,
        formData
      );

      showSuccess("Department created successfully!");
    }

    setFormData({
      name: "",
      description: "",
    });

   onDepartmentCreated();
onClose();

  } catch (error) {
    showError(
  error.response?.data?.message ||
  (isEditing
    ? "Failed to update department"
    : "Failed to create department")
);
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">

      <div className="bg-white w-full max-w-xl rounded-xl p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            {isEditing
  ? "Edit Department"
  : "Create Department"}
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

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

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
            {isEditing
  ? "Update Department"
  : "Create Department"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateDepartmentModal;