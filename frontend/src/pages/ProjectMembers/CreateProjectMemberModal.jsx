import { useState } from "react";
import { addProjectMember } from "../../services/projectMemberService";

const CreateProjectMemberModal = ({
  isOpen,
  onClose,
  token,
  projectId,
  users,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    user_id: "",
    member_type: "Student",
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

    if (!formData.user_id) {
      alert("Please select a user.");
      return;
    }

    try {
      await addProjectMember(token, {
        project_id: Number(projectId),
        user_id: Number(formData.user_id),
        member_type: formData.member_type,
      });

      alert("Member added successfully.");

      setFormData({
        user_id: "",
        member_type: "Student",
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to add member.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">

        <h2 className="text-xl font-bold mb-4">
          Add Project Member
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">
              User
            </label>

            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="">
                Select User
              </option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Member Type
            </label>

            <select
              name="member_type"
              value={formData.member_type}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
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

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            >
              Add Member
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateProjectMemberModal;