import { useEffect, useState } from "react";
import { FaFlagCheckered, FaPlus } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import { getProjects } from "../../services/projectService";
import {
  getProjectMilestones,
  deleteMilestone,
} from "../../services/milestoneService";
import CreateMilestoneModal from "./CreateMilestoneModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function Milestones() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects(token);
      setProjects(response.projects || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMilestones = async (projectId) => {
    if (!projectId) {
      setMilestones([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getProjectMilestones(token, projectId);
      setMilestones(response.milestones || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProject(id);
    fetchMilestones(id);
  };

  const handleEdit = (milestone) => {
    setSelectedMilestone(milestone);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMilestone(token, confirm.id);
      setConfirm(null);
      fetchMilestones(selectedProject);
    } catch (error) {
      console.error(error);
      showError("Failed to delete milestone");
    } finally {
      setDeleting(false);
    }
  };

  const canManage = hasRole(...PERMISSIONS.MILESTONE_MANAGE);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Milestones
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Project milestones with completion tracking
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedProject}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus /> Add Milestone
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 mb-6 max-w-md">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Project
        </label>

        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="w-full mt-2 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
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
        <TableSkeleton rows={5} cols={5} />
      ) : milestones.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaFlagCheckered />}
            title="No milestones found"
            description="Select a project to see its milestones."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Due Date</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Completion</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {milestones.map((milestone) => (
                <tr key={milestone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {milestone.title}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {milestone.due_date || "-"}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={milestone.status} size="sm" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${milestone.completion_percentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {milestone.completion_percentage || 0}%
                      </span>
                    </div>
                  </td>
                  {canManage && (
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(milestone)}
                          className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              id: milestone.id,
                              title: "Delete milestone?",
                              message: `\"${milestone.title}\" will be removed.`,
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateMilestoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMilestone(null);
          setIsEditing(false);
        }}
        projectId={selectedProject}
        milestone={selectedMilestone}
        isEditing={isEditing}
        onMilestoneCreated={() => fetchMilestones(selectedProject)}
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
