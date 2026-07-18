import { useEffect, useState } from "react";
import { FaUpload, FaDownload, FaTrash } from "react-icons/fa";

import {
  getProjectDocuments,
  deleteDocument,
  downloadDocument,
} from "../../services/documentService";

import { getProjects } from "../../services/projectService";
import CreateDocumentModal from "./CreateDocumentModal";

const Documents = () => {
  const token = localStorage.getItem("token");

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects(token);
      setProjects(res.projects);
    } catch (err) {
      console.error(err);
      alert("Failed to load projects");
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

      setDocuments(res.documents);
    } catch (err) {
      console.error(err);
      alert("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    fetchDocuments(projectId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await deleteDocument(token, id);

      fetchDocuments(selectedProject);

      alert("Document deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
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
      alert("Download failed");
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Documents
        </h1>

        <button
          onClick={() => {
            if (!selectedProject) {
              alert("Please select a project first");
              return;
            }

            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaUpload />

          Upload Document
        </button>

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

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-left">Version</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-center">Actions</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="7"
                  className="text-center p-6"
                >
                  Loading...
                </td>
              </tr>

            ) : documents.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  className="text-center p-6"
                >
                  No documents found
                </td>
              </tr>

            ) : (

              documents.map((doc) => (

                <tr
                  key={doc.id}
                  className="border-t"
                >
                  <td className="p-3">
                    {doc.file_name}
                  </td>

                  <td className="p-3">
                    {doc.file_type}
                  </td>

                  <td className="p-3">
                    {(doc.file_size / 1024).toFixed(2)} KB
                  </td>

                  <td className="p-3">
                    {doc.version}
                  </td>

                  <td className="p-3">
                    {doc.uploaded_by}
                  </td>

                  <td className="p-3">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-3 flex justify-center gap-3">

                    <button
                      onClick={() =>
                        handleDownload(doc.id, doc.file_name)
                      }
                      className="text-blue-600"
                    >
                      <FaDownload />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

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

    </div>
  );
};

export default Documents;