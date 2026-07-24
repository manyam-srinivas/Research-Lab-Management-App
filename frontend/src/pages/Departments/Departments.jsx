import { useEffect, useState } from "react";



import {
  getDepartments,
  deleteDepartment,
} from "../../services/departmentService";

import CreateDepartmentModal from "./CreateDepartmentModal";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await getDepartments(token);

      setDepartments(response.departments);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await deleteDepartment(token, id);

      fetchDepartments();

    } catch (error) {
      console.error(error);
      alert("Failed to delete department");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Departments
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Department
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

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {departments.length > 0 ? (

              departments.map((department) => (

                <tr
                  key={department.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {department.name}
                  </td>

                  <td className="p-4">
                    {department.description}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(department.id)}
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
                  colSpan="3"
                  className="text-center p-8 text-slate-500"
                >
                  No Departments Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDepartmentCreated={fetchDepartments}
      />

    </>
  );
}

export default Departments;