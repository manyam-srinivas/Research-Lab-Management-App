import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import { getProjectFinance } from "../../services/projectService";
import { showError } from "../../utils/toast";

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function ProjectFinanceModal({
  isOpen,
  onClose,
  project,
}) {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !project) return;

    const token = localStorage.getItem("token");

    const load = async () => {
      setLoading(true);
      setFinance(null);

      try {
        const response = await getProjectFinance(token, project.id);
        setFinance(response.finance);
      } catch (error) {
        console.error(error);
        showError("Failed to load project finance");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, project]);

  const summary = finance?.summary || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Finance — ${project?.title || "Project"}`}
      size="max-w-3xl"
    >
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !finance ? (
        <p className="text-center text-slate-500 py-10">
          No finance data available.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-700 font-medium">
                Total Allocated
              </p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {formatINR(summary.total_allocated)}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-sm text-red-700 font-medium">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-red-800 mt-1">
                {formatINR(summary.total_spent)}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-sm text-green-700 font-medium">
                Remaining
              </p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {formatINR(summary.remaining)}
              </p>
            </div>
          </div>

          {/* Budgets */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Budgets
            </h3>

            {finance.budgets.length === 0 ? (
              <p className="text-sm text-slate-500">
                No budgets linked to this project.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="p-3">Financial Year</th>
                      <th className="p-3">Allocated</th>
                      <th className="p-3">Spent</th>
                      <th className="p-3">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finance.budgets.map((b) => (
                      <tr key={b.id} className="border-t hover:bg-slate-50">
                        <td className="p-3">{b.financial_year || "-"}</td>
                        <td className="p-3">{formatINR(b.allocated_amount)}</td>
                        <td className="p-3">{formatINR(b.spent_amount)}</td>
                        <td className="p-3 font-medium text-green-700">
                          {formatINR(b.remaining_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Expenses */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Expenses
            </h3>

            {finance.expenses.length === 0 ? (
              <p className="text-sm text-slate-500">
                No expenses recorded for this project.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finance.expenses.map((e) => (
                      <tr key={e.id} className="border-t hover:bg-slate-50">
                        <td className="p-3 font-medium">{formatINR(e.amount)}</td>
                        <td className="p-3">{e.expense_type || "-"}</td>
                        <td className="p-3">{e.description || "-"}</td>
                        <td className="p-3 text-slate-500">
                          {e.created_at?.slice(0, 10) || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Procurement */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Procurement
            </h3>

            {finance.procurement.length === 0 ? (
              <p className="text-sm text-slate-500">
                No procurement requests linked to this project.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Est. Cost</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finance.procurement.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-slate-50">
                        <td className="p-3">{p.item_name}</td>
                        <td className="p-3">{p.quantity || "-"}</td>
                        <td className="p-3">{formatINR(p.estimated_cost)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
