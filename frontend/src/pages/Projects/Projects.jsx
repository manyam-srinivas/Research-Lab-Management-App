import { useEffect, useRef, useState } from "react";
import { FaProjectDiagram, FaPlus } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getProjects,
  deleteProject,
} from "../../services/projectService";

import CreateProjectModal from "./CreateProjectModal";
import ProjectFinanceModal from "./ProjectFinanceModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const PER_PAGE = 10;

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [financeProject, setFinanceProject] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const lastFilters = useRef("");

  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page);
      params.set("per_page", PER_PAGE);
      const qs = params.toString();
      const response = await getProjects(token, qs ? `?${qs}` : "");
      setProjects(response.projects || []);
      setTotal(response.total || 0);
      setPages(response.pages || 1);

      // Clamp back to a valid page when the last rows on a page are removed.
      if (page > (response.pages || 1)) {
        setPage(response.pages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const key = `${search}|${statusFilter}`;

    // If the filters changed, jump back to page 1 — the page change will
    // trigger the fetch, so we skip it here to avoid a double request.
    if (key !== lastFilters.current) {
      lastFilters.current = key;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await deleteProject(token, confirm.id);
      setConfirm(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      showError("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const canManage = hasRole(...PERMISSIONS.PROJECT_MANAGE);

  const inputCls =
    "rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30";

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Projects
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {total} project{total === 1 ? "" : "s"} in the lab
            </p>
          )}
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> Add Project
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 ${inputCls}`}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputCls}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaProjectDiagram />}
            title={search || statusFilter ? "No matching projects" : "No projects yet"}
            description={
              search || statusFilter
                ? "Try changing your search or filters."
                : "Create your first project to start tracking research work."
            }
            action={
              canManage ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  + Add Project
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
            <table className="min-w-[1000px] w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Priority</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Visibility</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-100">
                      {project.title}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={project.priority} />
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {project.visibility}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => setFinanceProject(project)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                        title="View budgets, expenses and procurement for this project"
                      >
                        Finance
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => handleEdit(project)}
                            className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({
                                id: project.id,
                                title: "Delete project?",
                                message: `\"${project.title}\" will be permanently removed.`,
                              })
                            }
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pages={pages}
            total={total}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
          setIsEditing(false);
        }}
        onProjectCreated={fetchProjects}
        project={selectedProject}
        isEditing={isEditing}
      />

      <ProjectFinanceModal
        isOpen={!!financeProject}
        onClose={() => setFinanceProject(null)}
        project={financeProject}
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

export default Projects;
