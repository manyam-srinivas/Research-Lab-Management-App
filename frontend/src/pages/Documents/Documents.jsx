import { useEffect, useState } from "react";
import {
  FaUpload,
  FaDownload,
  FaTrash,
  FaFileAlt,
} from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError, showSuccess } from "../../utils/toast";
import {
  getProjectDocuments,
  deleteDocument,
  downloadDocument,
} from "../../services/documentService";
import { getProjects } from "../../services/projectService";
import CreateDocumentModal from "./CreateDocumentModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const Documents = () => {
  const token = localStorage.getItem("token");

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects(token);
      setProjects(res.projects || []);
    } catch (err) {
      console.error(err);
      showError("Failed to load projects");
    }
  };

  const fetchDocuments = async (projectId) => {
    if (!projectId) {
      setDocuments([]);
      return;
    }

    try {
      setLoading(true);
      const res = await getProjectDocuments(token, projectId);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error(err);
      showError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    fetchDocuments(projectId);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocument(token, confirm.id);
      setConfirm(null);
      fetchDocuments(selectedProject);
      showSuccess("Document deleted successfully");
    } catch (err) {
      console.error(err);
      showError("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const blob = await downloadDocument(token, id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showError("Download failed");
    }
  };

  const canManage = hasRole(...PERMISSIONS.DOCUMENT_MANAGE);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Documents
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Project files and research documents
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              if (!selectedProject) {
                showError("Please select a project first");
                return;
              }
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaUpload /> Upload Document
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
        <TableSkeleton rows={5} cols={7} />
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaFileAlt />}
            title="No documents found"
            description="Select a project to see its uploaded documents."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">File</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Size</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Version</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Uploaded By</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created</th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Download</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Delete</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <FaFileAlt />
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {doc.file_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-500/15 dark:text-slate-300">
                      {doc.file_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {doc.file_size ? (doc.file_size / 1024).toFixed(2) : "—"} KB
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    v{doc.version}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {doc.uploaded_by || "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDownload(doc.id, doc.file_name)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                  </td>
                  {canManage && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setConfirm({
                            id: doc.id,
                            title: "Delete document?",
                            message: `\"${doc.file_name}\" will be removed.`,
                          })
                        }
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        projectId={selectedProject}
        onSuccess={() => {
          fetchDocuments(selectedProject);
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


export default Documents;
