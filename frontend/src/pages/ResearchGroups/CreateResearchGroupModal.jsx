import { useEffect, useState } from "react";
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
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            {isEditing
  ? "Edit Research Group"
  : "Create Research Group"}
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Research Group Name"
            value={formData.name}
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

          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
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
            {isEditing
  ? "Update Research Group"
  : "Create Research Group"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateResearchGroupModal;