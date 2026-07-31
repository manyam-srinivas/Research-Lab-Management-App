import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

import { showError, showSuccess } from "../../utils/toast";

import {
  addProjectMember,
  updateProjectMember,
} from "../../services/projectMemberService";
const CreateProjectMemberModal = ({
  isOpen,
  onClose,
  token,
  projectId,
  users,
  member,
  isEditing,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    user_id: "",
    member_type: "Student",
  });
  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && member) {
    setFormData({
      user_id: member.user_id,
      member_type: member.member_type,
    });
  } else {
    setFormData({
      user_id: "",
      member_type: "Student",
    });
  }
}, [isOpen, isEditing, member]);

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.user_id) {
    showError("Please select a user.");
    return;
  }

  try {
    if (isEditing) {
      await updateProjectMember(
        token,
        member.id,
        {
          project_id: Number(projectId),
          user_id: Number(formData.user_id),
          member_type: formData.member_type,
        }
      );

      showSuccess("Member updated successfully.");
    } else {
      await addProjectMember(token, {
        project_id: Number(projectId),
        user_id: Number(formData.user_id),
        member_type: formData.member_type,
      });

      showSuccess("Member added successfully.");
    }

    setFormData({
      user_id: "",
      member_type: "Student",
    });

    onSuccess();

  } catch (err) {
    console.error(err);

    showError(
      isEditing
        ? "Failed to update member."
        : "Failed to add member."
    );
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Project Member" : "Add Project Member"}
    size="max-w-md"
  >
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          User
        </label>

        <select
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option value="">
            Select User
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.full_name} ({user.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Member Type
        </label>

        <select
          name="member_type"
          value={formData.member_type}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        >
          <option value="Student">Student</option>
          <option value="Research Scholar">
            Research Scholar
          </option>
          <option value="Faculty">
            Faculty
          </option>
          <option value="Lab Staff">
            Lab Staff
          </option>
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

        <Button type="submit">
          {isEditing ? "Update Member" : "Add Member"}
        </Button>

      </div>
    </form>
  </Modal>
);
};

export default CreateProjectMemberModal;