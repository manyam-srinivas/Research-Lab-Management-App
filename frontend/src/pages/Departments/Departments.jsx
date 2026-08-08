import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaPlus,
  FaProjectDiagram,
  FaWallet,
} from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getDepartmentsOverview,
  getDepartments,
  deleteDepartment,
} from "../../services/departmentService";

import CreateDepartmentModal from "./CreateDepartmentModal";
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

function BudgetBar({ allocated, remaining }) {
  const alloc = Number(allocated || 0);
  const remain = Number(remaining || 0);
  const used = Math.max(0, alloc - remain);
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

function DepartmentCard({ department, canManage, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const hasProjects = department.projects && department.projects.length > 0;
  const hasBudget = Number(department.budget?.allocated || 0) > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 flex flex-col">
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
              {department.project_count} project{department.project_count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(department)}
              className="rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(department)}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
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

        {hasBudget ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-center mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Allocated</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {money(department.budget.allocated)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Committed to projects</p>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {money(department.budget.committed)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Spent</p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {money(department.budget.spent)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Available</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {money(department.budget.remaining)}
                </p>
              </div>
            </div>
            <BudgetBar
              allocated={department.budget.allocated}
              remaining={department.budget.remaining}
            />
          </>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No budget allocated yet
          </p>
        )}
      </div>

      {/* Projects in the department */}
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
            {expanded ? "Hide" : `Show (${department.project_count})`}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-2.5">
            {hasProjects ? (
              department.projects.map((project) => (
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
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Allocated:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {money(project.budget?.allocated)}
                      </span>
                    </span>
                    <span>
                      Spent:{" "}
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {money(project.budget?.spent)}
                      </span>
                    </span>
                    <span>
                      Remaining:{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {money(project.budget?.remaining)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <BudgetBar
                      allocated={project.budget?.allocated}
                      spent={project.budget?.spent}
                    />
                  </div>
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

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      try {
        // Prefer the overview endpoint (department budgets + projects).
        const response = await getDepartmentsOverview(token);
        setDepartments(response.departments || []);
      } catch (err) {
        // Fall back to the basic list if the overview endpoint is not
        // available, but tell the user so it never looks like the
        // departments are silently empty.
        console.error(err);
        showError("Couldn't load department budgets and projects");

        const response = await getDepartments(token);
        setDepartments(
          (response.departments || []).map((d) => ({
            ...d,
            project_count: 0,
            budget: { allocated: 0, spent: 0, remaining: 0 },
            projects: [],
          }))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await deleteDepartment(token, confirm.id);
      setConfirm(null);
      fetchDepartments();
    } catch (error) {
      console.error(error);
      showError("Failed to delete department");
    } finally {
      setDeleting(false);
    }
  };

  const canManage = hasRole(...PERMISSIONS.DEPARTMENT_MANAGE);

  const totalAllocated = departments.reduce(
    (sum, d) => sum + Number(d.budget?.allocated || 0),
    0
  );
  const totalProjects = departments.reduce(
    (sum, d) => sum + (d.project_count || 0),
    0
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Departments
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Department budgets with their projects and project budgets
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedDepartment(null);
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> Add Department
          </button>
        )}
      </div>

      {/* Summary stats */}
      {!loading && departments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Departments</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {departments.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total department budget</p>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {money(totalAllocated)}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Projects across departments</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {totalProjects}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <CardSkeleton count={3} className="sm:grid-cols-2 xl:grid-cols-3" />
      ) : departments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaBuilding />}
            title="No departments yet"
            description="Departments organize research groups, projects and budgets."
            action={
              canManage ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  + Add Department
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={(d) =>
                setConfirm({
                  id: d.id,
                  title: "Delete department?",
                  message: `"${d.name}" and its budget records will be removed.`,
                })
              }
            />
          ))}
        </div>
      )}

      <CreateDepartmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDepartment(null);
          setIsEditing(false);
        }}
        onDepartmentCreated={fetchDepartments}
        department={selectedDepartment}
        isEditing={isEditing}
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
