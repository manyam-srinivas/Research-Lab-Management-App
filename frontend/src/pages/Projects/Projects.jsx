import { useEffect, useState } from "react";


import {
  getProjects,
  deleteProject,
} from "../../services/projectService";

import CreateProjectModal from "./CreateProjectModal";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getProjects(token);
      setProjects(response.projects);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await deleteProject(token, id);

      fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to delete project");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Projects
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">Title</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Priority</th>

              <th className="p-4 text-left">Visibility</th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {projects.length > 0 ? (

              projects.map((project) => (

                <tr
                  key={project.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {project.title}
                  </td>

                  <td className="p-4">
                    {project.status}
                  </td>

                  <td className="p-4">
                    {project.priority}
                  </td>

                  <td className="p-4">
                    {project.visibility}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="5"
                  className="text-center p-8 text-slate-500"
                >
                  No Projects Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />

    </>
  );
}

export default Projects;