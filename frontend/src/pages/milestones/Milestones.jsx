import { useEffect, useState } from "react";

import { getProjects } from "../../services/projectService";
import {
  getProjectMilestones,
  deleteMilestone,
} from "../../services/milestoneService";

import CreateMilestoneModal from "./CreateMilestoneModal";

function Milestones() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects(token);
      setProjects(response.projects);
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
      const response = await getProjectMilestones(
        token,
        projectId
      );

      setMilestones(response.milestones);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProjectChange = (e) => {
    const id = e.target.value;

    setSelectedProject(id);

    fetchMilestones(id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this milestone?")) return;

    try {
      await deleteMilestone(token, id);

      fetchMilestones(selectedProject);
    } catch (error) {
      console.error(error);
      alert("Failed to delete milestone");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Milestones
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedProject}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          + Add Milestone
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="font-medium">
          Select Project
        </label>

        <select
          value={selectedProject}
          onChange={handleProjectChange}
          className="w-full border rounded-lg p-2 mt-2"
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

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Title
              </th>

              <th className="p-4 text-left">
                Due Date
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Completion %
              </th>

              <th className="p-4 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {milestones.length > 0 ? (
              milestones.map((milestone) => (
                <tr
                  key={milestone.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4">
                    {milestone.title}
                  </td>

                  <td className="p-4">
                    {milestone.due_date || "-"}
                  </td>

                  <td className="p-4">
                   <span
                     className={`px-3 py-1 rounded-full text-sm font-medium ${
                       milestone.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : milestone.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                     }`}
                   >
                        {milestone.status}
                   </span>
                  </td>

                  <td className="p-4 w-56">
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
      style={{
        width: `${milestone.completion_percentage}%`,
      }}
    ></div>
  </div>

  <p className="text-sm mt-1">
    {milestone.completion_percentage}%
  </p>
</td>

                  <td className="p-4 text-center">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(milestone.id)
                      }
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
                  No Milestones Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateMilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={selectedProject}
        onMilestoneCreated={() =>
          fetchMilestones(selectedProject)
        }
      />
    </>
  );
}

export default Milestones;