import { useEffect, useState } from "react";

import { createResearchGroup } from "../../services/researchGroupService";
import { getDepartments } from "../../services/departmentService";

function CreateResearchGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
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

      } catch (error) {
        console.error(error);
      }
    };

    fetchDepartments();

  }, [isOpen]);

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

      await createResearchGroup(token, {
        ...formData,
        department_id: Number(formData.department_id),
      });

      alert("Research Group created successfully!");

      setFormData({
        name: "",
        description: "",
        department_id: "",
      });

      onClose();
      onGroupCreated();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create research group"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Create Research Group
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
            Create Research Group
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateResearchGroupModal;