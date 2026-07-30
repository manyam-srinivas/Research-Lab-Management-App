import { useEffect, useState } from "react";
import { showError } from "../../utils/toast";
import { getProjects } from "../../services/projectService";
import { getProjectMilestones } from "../../services/milestoneService";
import {
  getMilestoneTasks,
  deleteTask,
} from "../../services/taskService";
import { getUsers } from "../../services/userService";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import CreateTaskModal from "./CreateTaskModal";

function Tasks() {
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [projectRes, userRes] = await Promise.all([
        getProjects(token),
        getUsers(token),
      ]);

      setProjects(projectRes.projects);
      setUsers(userRes.users);
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
      const response = await getProjectMilestones(
        token,
        projectId
      );

      setMilestones(response.milestones);
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
      const response = await getMilestoneTasks(
        token,
        milestoneId
      );

      setTasks(response.tasks);
    } catch (error) {
      console.error(error);
    }
  };
   const handleEdit = (task) => {
  setSelectedTask(task);
  setIsEditing(true);
  setIsModalOpen(true);
};
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await deleteTask(token, id);
      fetchTasks(selectedMilestone);
    } catch (error) {
      console.error(error);
      showError("Failed to delete task");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Tasks
        </h1>

        {hasRole(...PERMISSIONS.TASK_MANAGE) && (
  <button
    disabled={!selectedMilestone}
    onClick={() => setIsModalOpen(true)}
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
  >
    + Add Task
  </button>
)}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">

        <div className="bg-white rounded-xl shadow p-5">

          <label className="font-medium">
            Project
          </label>

          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              fetchMilestones(e.target.value);
            }}
            className="w-full mt-2 border rounded-lg p-2"
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

        <div className="bg-white rounded-xl shadow p-5">

          <label className="font-medium">
            Milestone
          </label>

          <select
            value={selectedMilestone}
            onChange={(e) => {
              setSelectedMilestone(e.target.value);
              fetchTasks(e.target.value);
            }}
            className="w-full mt-2 border rounded-lg p-2"
          >
            <option value="">
              Select Milestone
            </option>

            {milestones.map((milestone) => (
              <option
                key={milestone.id}
                value={milestone.id}
              >
                {milestone.title}
              </option>
            ))}
          </select>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="min-w-[1000px] w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Title
              </th>

              <th className="p-4 text-left">
                Assigned To
              </th>

              <th className="p-4 text-left">
                Priority
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Due Date
              </th>

              {hasRole(...PERMISSIONS.TASK_MANAGE) && (
  <th className="p-4 text-center">
    Actions
  </th>
)}

            </tr>

          </thead>

          <tbody>

            {tasks.length > 0 ? (

              tasks.map((task) => {

                const assignedUser = users.find(
                  (u) => u.id === task.assigned_to
                );

                return (

                  <tr
                    key={task.id}
                    className="border-t hover:bg-slate-50"
                  >

                    <td className="p-4">
                      {task.title}
                    </td>

                    <td className="p-4">
                      {assignedUser
                        ? assignedUser.full_name
                        : "-"}
                    </td>

                    <td className="p-4">
                      {task.priority}
                    </td>

                    <td className="p-4">
                      {task.status}
                    </td>

                    <td className="p-4">
                      {task.due_date || "-"}
                    </td>

                    

  {hasRole(...PERMISSIONS.TASK_MANAGE) && (
  <td className="p-4 text-center">

    <button
  onClick={() => handleEdit(task)}
  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
>
  Edit
</button>

    <button
      onClick={() => handleDelete(task.id)}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Delete
    </button>

  </td>
)} 
                  </tr>

                );

              })

            ) : (

              <tr>

                <td
                  colSpan={
  hasRole(...PERMISSIONS.TASK_MANAGE)
    ? 6
    : 5
}
                  className="text-center p-8 text-slate-500"
                >
                  No Tasks Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

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
  onTaskCreated={() =>
    fetchTasks(selectedMilestone)
  }
/>

    </>
  );
}

export default Tasks;