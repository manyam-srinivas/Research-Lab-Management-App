import { useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaWallet,
  FaPlus,
  FaFileCsv,
  FaProjectDiagram,
} from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  deleteBudget,
  exportBudgetsCsv,
} from "../../services/budgetService";
import { getDepartmentsOverview } from "../../services/departmentService";
import CreateBudgetModal from "./CreateBudgetModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const money = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

function BudgetBar({ allocated, spent }) {
  const alloc = Number(allocated || 0);
  const used = Number(spent || 0);
  const pct = alloc > 0 ? Math.min(100, (used / alloc) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
        <span>Budget utilization</span>
        <span className="font-medium">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct > 90
              ? "bg-red-500"
              : pct > 60
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BudgetRecordRow({ record, canManage, onEdit, onDelete }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {record.financial_year || "FY"}
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {money(record.allocated)}
        </span>
        <span className="text-xs text-red-600 dark:text-red-400">
          spent {money(record.spent)}
        </span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          left {money(record.remaining)}
        </span>
      </div>

      {canManage && (
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(record)}
            className="rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(record)}
            className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function DepartmentCard({
  department,
  canManage,
  onEditRecord,
  onDeleteRecord,
  onAddProjectBudget,
}) {
  const [expanded, setExpanded] = useState(false);
  const records = department.budget_records || [];
  const projects = department.projects || [];
  const hasDeptBudget = Number(department.budget?.allocated || 0) > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <FaBuilding />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {department.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {hasDeptBudget && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {money(department.budget.remaining)} left
          </span>
        )}
      </div>

      {department.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {department.description}
        </p>
      )}

      {/* Department-level budget */}
      <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
          <FaWallet className="text-slate-400" />
          Department Budget
        </div>

        {records.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-center mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Allocated</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {money(department.budget.allocated)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Committed to projects</p>
                <p className="mt-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {money(department.budget.committed)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Spent</p>
                <p className="mt-0.5 text-sm font-semibold text-red-600 dark:text-red-400">
                  {money(department.budget.spent)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Available</p>
                <p className="mt-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {money(department.budget.remaining)}
                </p>
              </div>
            </div>
            <BudgetBar
              allocated={department.budget.allocated}
              spent={
                Number(department.budget.spent || 0) +
                Number(department.budget.committed || 0)
              }
            />
            <div className="mt-3 space-y-2">
              {records.map((record) => (
                <BudgetRecordRow
                  key={record.id}
                  record={record}
                  canManage={canManage}
                  onEdit={() => onEditRecord(record, department.id, null)}
                  onDelete={() => onDeleteRecord(record)}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No department budget yet
          </p>
        )}
      </div>

      {/* Projects & their budgets */}
      <div className="mt-4 flex-1">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <span className="flex items-center gap-2">
            <FaProjectDiagram className="text-slate-400" />
            Projects & their budgets
          </span>
          <span className="text-xs text-slate-400">
            {expanded ? "Hide" : `Show (${projects.length})`}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-2.5">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {project.title}
                    </p>
                    <StatusBadge status={project.status} size="sm" />
                  </div>

                  {project.budget_records?.length > 0 ? (
                    <>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Allocated:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {money(project.budget.allocated)}
                          </span>
                        </span>
                        <span>
                          Spent:{" "}
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {money(project.budget.spent)}
                          </span>
                        </span>
                        <span>
                          Remaining:{" "}
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {money(project.budget.remaining)}
                          </span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <BudgetBar
                          allocated={project.budget.allocated}
                          spent={project.budget.spent}
                        />
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {project.budget_records.map((record) => (
                          <BudgetRecordRow
                            key={record.id}
                            record={record}
                            canManage={canManage}
                            onEdit={() => onEditRecord(record, department.id, project.id)}
                            onDelete={() => onDeleteRecord(record)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        No project budget allocated
                      </p>
                      {canManage && (
                        <button
                          onClick={() => onAddProjectBudget(project, department.id)}
                          className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 transition"
                        >
                          + Add budget
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                No projects in this department
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Budget() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState("department");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const overviewResponse = await getDepartmentsOverview(token);
      setDepartments(overviewResponse.departments || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departments;

    return departments
      .map((dept) => {
        const matchedProjects = (dept.projects || []).filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.budget_records || []).some((r) =>
              (r.financial_year || "").toLowerCase().includes(q)
            )
        );
        const deptMatches =
          dept.name.toLowerCase().includes(q) ||
          (dept.budget_records || []).some((r) =>
            (r.financial_year || "").toLowerCase().includes(q)
          );

        if (!deptMatches && matchedProjects.length === 0) return null;
        return {
          ...dept,
          projects: deptMatches ? dept.projects : matchedProjects,
        };
      })
      .filter(Boolean);
  }, [departments, search]);

  const openCreateModal = (type) => {
    setSelectedBudget(null);
    setIsEditing(false);
    setModalDefaultType(type || "department");
    setIsModalOpen(true);
  };

  const handleEditRecord = (record, departmentId, projectId) => {
    setSelectedBudget({
      id: record.id,
      department_id: departmentId,
      project_id: projectId,
      financial_year: record.financial_year,
      allocated_amount: record.allocated,
    });
    setIsEditing(true);
    setModalDefaultType(projectId ? "project" : "department");
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBudget(token, confirm.id);
      setConfirm(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to delete budget");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportBudgetsCsv(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "budgets.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showError("Failed to export budgets");
    }
  };

  const canManage = hasRole(...PERMISSIONS.BUDGET_MANAGE);

  const totalAllocated = departments.reduce(
    (s, d) => s + Number(d.budget?.allocated || 0),
    0
  );
  const totalSpent = departments.reduce(
    (s, d) => s + Number(d.budget?.spent || 0),
    0
  );
  const totalRemaining = departments.reduce(
    (s, d) => s + Number(d.budget?.remaining || 0),
    0
  );

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Budget Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Department budgets with each project's budget breakdown
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition"
          >
            <FaFileCsv /> Export CSV
          </button>

          {canManage && (
            <button
              onClick={() => openCreateModal("department")}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
            >
              <FaPlus /> Create Budget
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search department, project or financial year..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      {!loading && departments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total allocated</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {money(totalAllocated)}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total spent</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {money(totalSpent)}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total remaining</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {money(totalRemaining)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <CardSkeleton count={3} className="sm:grid-cols-2 xl:grid-cols-3" />
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaBuilding />}
            title={search ? "No matching departments" : "No budgets yet"}
            description={
              search
                ? "Try a different search term."
                : "Create a department budget, then assign budgets to its projects."
            }
            action={
              canManage && !search ? (
                <button
                  onClick={() => openCreateModal("department")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  + Create Budget
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              canManage={canManage}
              onEditRecord={handleEditRecord}
              onDeleteRecord={(record) =>
                setConfirm({
                  id: record.id,
                  title: "Delete budget?",
                  message: `${record.financial_year ? record.financial_year + " budget" : "Budget"} of ${money(record.allocated)} will be removed.`,
                })
              }
              onAddProjectBudget={(project, departmentId) => {
                setSelectedBudget({
                  ...project,
                  project_id: project.id,
                  department_id: departmentId,
                });
                setIsEditing(false);
                setModalDefaultType("project");
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <CreateBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
          setIsEditing(false);
        }}
        departments={departments}
        defaultType={modalDefaultType}
        budget={selectedBudget}
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
