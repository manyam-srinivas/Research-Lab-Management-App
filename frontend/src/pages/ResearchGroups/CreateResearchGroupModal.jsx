import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { showError, showSuccess } from "../../utils/toast";

import {
  createResearchGroup,
  updateResearchGroup,
} from "../../services/researchGroupService";

import { getDepartments } from "../../services/departmentService";

function CreateResearchGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
  group,
  isEditing,
}) {

  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department_id: "",
  });

  useEffect(() => {
  if (!isOpen) return;

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getDepartments(token);

      setDepartments(response.departments);

      if (isEditing && group) {
        setFormData({
          name: group.name || "",
          description: group.description || "",
          department_id: String(group.department_id || ""),
        });
      } else {
        setFormData({
          name: "",
          description: "",
          department_id: "",
        });
      } 

    } catch (error) {
      console.error(error);
    }
  };

  fetchDepartments();

}, [isOpen, isEditing, group]);
  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};
  

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
      ...formData,
      department_id: Number(formData.department_id),
    };

    if (isEditing) {
      await updateResearchGroup(
        token,
        group.id,
        payload
      );

      showSuccess("Research Group updated successfully!");
    } else {
      await createResearchGroup(
        token,
        payload
      );

      showSuccess("Research Group created successfully!");
    }

    setFormData({
      name: "",
      description: "",
      department_id: "",
    });

    onClose();
    onGroupCreated();

  } catch (error) {
    showError(
      error.response?.data?.message ||
      (isEditing
        ? "Failed to update research group"
        : "Failed to create research group")
    );
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      isEditing
        ? "Edit Research Group"
        : "Create Research Group"
    }
    size="max-w-xl"
  >
    <div className="space-y-4">

      <Input
        label="Research Group Name"
        type="text"
        name="name"
        placeholder="Research Group Name"
        value={formData.name}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Department
        </label>

        <select
          name="department_id"
          value={formData.department_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option value="">
            Select Department
          </option>

          {departments.map((department) => (
            <option
              key={department.id}
              value={department.id}
            >
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing
            ? "Update Research Group"
            : "Create Research Group"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateResearchGroupModal;