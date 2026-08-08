import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaUserFriends } from "react-icons/fa";
import { showError, showSuccess } from "../../utils/toast";
import { getProjects, getMyProjects } from "../../services/projectService";
import { getUsers } from "../../services/userService";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import {
  getProjectMembers,
  deleteProjectMember,
} from "../../services/projectMemberService";
import CreateProjectMemberModal from "./CreateProjectMemberModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const ProjectMembers = () => {
  const token = localStorage.getItem("token");
  const isManager = hasRole(...PERMISSIONS.PROJECT_MEMBER_MANAGE);

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      if (isManager) {
        // Managers manage members across all projects and need the
        // full user list for the add/edit form.
        const [projectRes, userRes] = await Promise.all([
          getProjects(token),
          getUsers().catch(() => ({ users: [] })),
        ]);

        setProjects(projectRes.projects || []);
        setUsers(userRes.users || []);
      } else {
        // Students only see the projects they belong to. If the deployed
        // backend doesn't have /projects/my yet, fall back to the full
        // list so the page still loads.
        try {
          const res = await getMyProjects(token);
          setProjects(res.projects || []);
        } catch (err) {
          console.error(err);
          const res = await getProjects(token);
          setProjects(res.projects || []);
        }
      }
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
      const res = await getProjectMembers(token, projectId);
      setMembers(res.members || []);
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProjectMember(token, confirm.id);
      setConfirm(null);
      fetchMembers(selectedProject);
      showSuccess("Member removed successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to remove member");
    } finally {
      setDeleting(false);
    }
  };

  const getUser = (userId) => {
    return users.find((user) => user.id === userId);
  };

  const canManage = isManager;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Project Members
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Team members assigned to each project
          </p>
        </div>

        {canManage && (
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
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> Add Member
          </button>
        )}
      </div>

      <div className="mb-6 max-w-md">
        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : members.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaUserFriends />}
            title="No members found"
            description="Select a project to see its team members."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Member Type</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Joined</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => {
                // Members carry their user details (name, email, role)
                // so students don't need the admin-only /users endpoint.
                const user = member.user || getUser(member.user_id);

                return (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          {(user?.full_name || "?")[0]}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {user?.full_name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {user?.email || "-"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                        {user?.role || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {member.member_type}
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                id: member.id,
                                title: "Remove member?",
                                message: `${user?.full_name || "This member"} will be removed from the project.`,
                              })
                            }
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                            title="Remove"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
};


export default ProjectMembers;
