import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getProjects } from "../../services/projectService";
import CreateProjectModal from "./CreateProjectModal";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await getProjects(token);

      setProjects(response.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Priority</th>
              <th className="text-left p-4">Visibility</th>
            </tr>
          </thead>

          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4">{project.title}</td>
                  <td className="p-4">{project.status}</td>
                  <td className="p-4">{project.priority}</td>
                  <td className="p-4">{project.visibility}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-8 text-slate-500"
                >
                  No Projects Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </DashboardLayout>
  );
}

export default Projects;