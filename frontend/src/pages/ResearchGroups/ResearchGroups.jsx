import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getResearchGroups,
  deleteResearchGroup,
} from "../../services/researchGroupService";

import { getDepartments } from "../../services/departmentService";

import CreateResearchGroupModal from "./CreateResearchGroupModal";

function ResearchGroups() {
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [groupResponse, departmentResponse] =
        await Promise.all([
          getResearchGroups(token),
          getDepartments(token),
        ]);

      setGroups(groupResponse.groups);
      setDepartments(departmentResponse.departments);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (dept) => dept.id === departmentId
    );

    return department ? department.name : "N/A";
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this research group?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await deleteResearchGroup(token, id);

      fetchData();

    } catch (error) {
      console.error(error);
      alert("Failed to delete research group");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Research Groups
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Research Group
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Description
              </th>

              <th className="p-4 text-left">
                Department
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {groups.length > 0 ? (

              groups.map((group) => (

                <tr
                  key={group.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {group.name}
                  </td>

                  <td className="p-4">
                    {group.description}
                  </td>

                  <td className="p-4">
                    {getDepartmentName(group.department_id)}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(group.id)}
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
                  colSpan="4"
                  className="text-center p-8 text-slate-500"
                >
                  No Research Groups Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateResearchGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={fetchData}
      />

    </DashboardLayout>
  );
}

export default ResearchGroups;