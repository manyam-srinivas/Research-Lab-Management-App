import { useEffect, useState } from "react";
import { FaTasks, FaPlus } from "react-icons/fa";
import { showError } from "../../utils/toast";
import { getProjects, getMyProjects } from "../../services/projectService";
import { getProjectMilestones } from "../../services/milestoneService";
import {
  getMilestoneTasks,
  getMyTasks,
  deleteTask,
} from "../../services/taskService";
import { getUsers } from "../../services/userService";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import CreateTaskModal from "./CreateTaskModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const selectCls =
  "w-full mt-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";

export default function Tasks() {
  const token = localStorage.getItem("token");
  const isManager = hasRole(...PERMISSIONS.TASK_MANAGE);

  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      if (isManager) {
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
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMilestones = async (projectId) => {
    if (!projectId) {
      setMilestones([]);
      setTasks([]);
      setSelectedMilestone("");
      return;
    }

    try {
      const response = await getProjectMilestones(token, projectId);
      setMilestones(response.milestones || []);
      setTasks([]);
      setSelectedMilestone("");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async (milestoneId) => {
    if (!milestoneId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getMilestoneTasks(token, milestoneId);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async (projectId) => {
    if (!projectId) {
      setTasks([]);
      setSelectedMilestone("");
      return;
    }

    try {
      setLoading(true);
      // Tasks assigned to the current user across the project's
      // milestones (students skip the milestone step).
      const response = await getMyTasks(token, projectId);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(token, confirm.id);
      setConfirm(null);
      fetchTasks(selectedMilestone);
    } catch (error) {
      console.error(error);
      showError("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const canManage = isManager;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tasks assigned to project milestones
          </p>
        </div>

        {canManage && (
          <button
            disabled={!selectedMilestone}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus /> Add Task
          </button>
        )}
      </div>

      <div
        className={
          isManager
            ? "grid md:grid-cols-2 gap-4 mb-6"
            : "max-w-md mb-6"
        }
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Project
          </label>

          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              if (isManager) {
                fetchMilestones(e.target.value);
              } else {
                fetchMyTasks(e.target.value);
              }
            }}
            className={selectCls}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        {isManager && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Milestone
            </label>

            <select
              value={selectedMilestone}
              onChange={(e) => {
                setSelectedMilestone(e.target.value);
                fetchTasks(e.target.value);
              }}
              className={selectCls}
            >
              <option value="">Select Milestone</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaTasks />}
            title="No tasks found"
            description={
              isManager
                ? "Select a project and milestone to see its tasks."
                : "No tasks are assigned to you in this project yet."
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</th>
                {isManager ? (
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Assigned To</th>
                ) : (
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Milestone</th>
                )}
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Priority</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Due Date</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => {
                const assignedUser = users.find((u) => u.id === task.assigned_to);

                return (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {task.title}
                    </td>
                    {isManager ? (
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                        {assignedUser ? assignedUser.full_name : "-"}
                      </td>
                    ) : (
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                        {task.milestone_title || "-"}
                      </td>
                    )}
                    <td className="p-4">
                      <StatusBadge status={task.priority} size="sm" />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {task.due_date || "-"}
                    </td>
                    {canManage && (
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                id: task.id,
                                title: "Delete task?",
                                message: `"${task.title}" will be removed.`,
                              })
                            }
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
                          >
                            Delete
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

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
          setIsEditing(false);
        }}
        milestoneId={selectedMilestone}
        users={users}
        task={selectedTask}
        isEditing={isEditing}
        onTaskCreated={() => fetchTasks(selectedMilestone)}
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
}
