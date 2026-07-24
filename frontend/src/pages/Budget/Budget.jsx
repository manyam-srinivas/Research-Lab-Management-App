import { useEffect, useState } from "react";


import {
  getBudgets,
  deleteBudget,
} from "../../services/budgetService";

import { getDepartments } from "../../services/departmentService";

import CreateBudgetModal from "./CreateBudgetModal";

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [budgetResponse, departmentResponse] =
        await Promise.all([
          getBudgets(token),
          getDepartments(token),
        ]);

      setBudgets(budgetResponse.budgets);
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
      (d) => d.id === departmentId
    );

    return department
      ? department.name
      : "-";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this budget?")) return;

    try {
      await deleteBudget(token, id);
      fetchData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete budget"
      );
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Budget Management
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Budget
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Department
              </th>

              <th className="p-4 text-left">
                Financial Year
              </th>

              <th className="p-4 text-left">
                Allocated
              </th>

              <th className="p-4 text-left">
                Spent
              </th>

              <th className="p-4 text-left">
                Remaining
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {budgets.length > 0 ? (

              budgets.map((budget) => (

                <tr
                  key={budget.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {getDepartmentName(
                      budget.department_id
                    )}
                  </td>

                  <td className="p-4">
                    {budget.financial_year}
                  </td>

                  <td className="p-4">
                    ₹{budget.allocated_amount}
                  </td>

                  <td className="p-4">
                    ₹{budget.spent_amount}
                  </td>

                  <td className="p-4 font-semibold text-green-600">
                    ₹{budget.remaining_amount}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(budget.id)
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
                  colSpan="6"
                  className="text-center p-8 text-slate-500"
                >
                  No Budgets Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        departments={departments}
        onCreated={fetchData}
      />

    </>
  );
}

export default Budget;