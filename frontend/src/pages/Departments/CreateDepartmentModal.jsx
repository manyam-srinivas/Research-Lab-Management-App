import { useState, useEffect } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

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
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Department" : "Create Department"}
    size="max-w-xl"
  >
    <div className="space-y-4">

      <Input
        label="Department Name"
        name="name"
        placeholder="Enter department name"
        value={formData.name}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          name="description"
          placeholder="Enter department description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing
            ? "Update Department"
            : "Create Department"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateDepartmentModal;