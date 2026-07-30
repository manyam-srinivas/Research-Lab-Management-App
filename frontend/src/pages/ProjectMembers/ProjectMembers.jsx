import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { showError, showSuccess } from "../../utils/toast"; 
import { getProjects } from "../../services/projectService";
import { getUsers } from "../../services/userService";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import {
  getProjectMembers,
  deleteProjectMember,
} from "../../services/projectMemberService";

import CreateProjectMemberModal from "./CreateProjectMemberModal";

const ProjectMembers = () => {
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");

  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projectRes, userRes] = await Promise.all([
        getProjects(token),
        getUsers(token),
      ]);

      setProjects(projectRes.projects);
      setUsers(userRes.users);
    } catch (err) {
      console.error(err);
      showError("Failed to load data");
    }
  };

  const fetchMembers = async (projectId) => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    try {
      setLoading(true);

      const res = await getProjectMembers(
        token,
        projectId
      );

      setMembers(res.members);
    } catch (err) {
      console.error(err);
      showError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    fetchMembers(projectId);
  };
  const handleEdit = (member) => {
  setSelectedMember(member);
  setIsEditing(true);
  setIsModalOpen(true);
};
  const handleDelete = async (memberId) => {
    if (
      !window.confirm(
        "Remove this member from project?"
      )
    )
      return;

    try {
      await deleteProjectMember(
        token,
        memberId
      );

      fetchMembers(selectedProject);

      showSuccess("Member removed successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to remove member");
    }
  };

  const getUser = (userId) => {
    return users.find(
      (user) => user.id === userId
    );
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Project Members
        </h1>

        {hasRole(...PERMISSIONS.PROJECT_MEMBER_MANAGE) && (
  <button
    onClick={() => {
      if (!selectedProject) {
        showError("Please select a project");
        return;
      }

      setSelectedMember(null);
setIsEditing(false);
setIsModalOpen(true);
    }}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  >
    <FaPlus />
    Add Member
  </button>
)}
      </div>

      <div className="mb-6">

        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="border rounded-lg p-3 w-full"
        >
          <option value="">
            Select Project
          </option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.title}
            </option>
          ))}

        </select>

      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">

        <table className="min-w-[1000px] w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">
                Name
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Role
              </th>

              <th className="p-3 text-left">
                Member Type
              </th>

              <th className="p-3 text-left">
                Joined
              </th>

              {hasRole(...PERMISSIONS.PROJECT_MEMBER_MANAGE) && (
  <th className="p-3 text-center">
    Actions
  </th>
)}
            </tr>

          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={
  hasRole(...PERMISSIONS.PROJECT_MEMBER_MANAGE)
    ? 6
    : 5
}
                  className="text-center p-6"
                >
                  Loading...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={
  hasRole(...PERMISSIONS.PROJECT_MEMBER_MANAGE)
    ? 6
    : 5
}
                  className="text-center p-6"
                >
                  No members found
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const user = getUser(
                  member.user_id
                );

                return (
                  <tr
                    key={member.id}
                    className="border-t"
                  >
                    <td className="p-3">
                      {user?.full_name || "-"}
                    </td>

                    <td className="p-3">
                      {user?.email || "-"}
                    </td>

                    <td className="p-3">
                      {user?.role || "-"}
                    </td>

                    <td className="p-3">
                      {member.member_type}
                    </td>

                    <td className="p-3">
                      {new Date(
                        member.joined_at
                      ).toLocaleDateString()}
                    </td>

                    {hasRole(...PERMISSIONS.PROJECT_MEMBER_MANAGE) && (
  <td className="p-3 flex justify-center gap-3">
    <button
  onClick={() => handleEdit(member)}
  className="text-blue-600"
>
  <FaEdit />
</button>

    <button
      onClick={() => handleDelete(member.id)}
      className="text-red-600"
    >
      <FaTrash />
    </button>
  </td>
)}
                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

      <CreateProjectMemberModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setIsEditing(false);
  }}
  token={token}
  projectId={selectedProject}
  users={users}
  member={selectedMember}
  isEditing={isEditing}
  onSuccess={() => {
    fetchMembers(selectedProject);
    setIsModalOpen(false);
  }}
/>

    </div>
  );
};

export default ProjectMembers;