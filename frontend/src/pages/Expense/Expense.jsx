import { useEffect, useState } from "react";
import { FaReceipt, FaPlus, FaFileCsv } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import { getDepartmentsOverview } from "../../services/departmentService";
import {
  getExpenses,
  deleteExpense,
  exportExpensesCsv,
} from "../../services/expenseService";
import CreateExpenseModal from "./CreateExpenseModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const money = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

function TypeChip({ type }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-500/15 dark:text-slate-300">
      {type}
    </span>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const qs = params.toString();

      const [expenseResponse, overviewResponse] = await Promise.all([
        getExpenses(token, qs ? `?${qs}` : ""),
        getDepartmentsOverview(token),
      ]);

      setExpenses(expenseResponse.expenses || []);
      setDepartments(overviewResponse.departments || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const getBudgetName = (budgetId) => {
    if (!budgetId) return "-";

    for (const department of departments) {
      const deptRecord = (department.budget_records || []).find(
        (r) => r.id === budgetId
      );

      if (deptRecord) {
        return `${department.name} · ${deptRecord.financial_year || "FY"}`;
      }

      for (const project of department.projects || []) {
        const record = (project.budget_records || []).find(
          (r) => r.id === budgetId
        );

        if (record) {
          return `${department.name} / ${project.title} · ${record.financial_year || "FY"}`;
        }
      }
    }

    return "-";
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(token, confirm.id);
      setConfirm(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportExpensesCsv(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showError("Failed to export expenses");
    }
  };

  const canCreate = hasRole(...PERMISSIONS.EXPENSE_CREATE);
  const canManage = hasRole(...PERMISSIONS.EXPENSE_MANAGE);

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const avgAmount = expenses.length ? totalAmount / expenses.length : 0;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Expense Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track spending against department budgets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition"
          >
            <FaFileCsv /> Export CSV
          </button>

          {canCreate && (
            <button
              onClick={() => {
                setSelectedExpense(null);
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
            >
              <FaPlus /> Create Expense
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      {!loading && expenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {expenses.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total spent</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {money(totalAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Average per expense</p>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {money(avgAmount)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : expenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaReceipt />}
            title="No expenses yet"
            description="Expenses are recorded against department budgets."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Budget</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created At</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-200">
                    {getBudgetName(expense.budget_id)}
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {money(expense.amount)}
                  </td>
                  <td className="p-4">
                    <TypeChip type={expense.expense_type} />
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {expense.description || "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {expense.created_at ? new Date(expense.created_at).toLocaleDateString() : "—"}
                  </td>
                  {canManage && (
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              id: expense.id,
                              title: "Delete expense?",
                              message: "This expense record will be removed.",
                            })
                          }
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
          setIsEditing(false);
        }}
        departments={departments}
        expense={selectedExpense}
        isEditing={isEditing}
        onCreated={fetchData}
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
