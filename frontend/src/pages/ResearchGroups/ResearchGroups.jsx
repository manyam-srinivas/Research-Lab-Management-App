import { useEffect, useState } from "react";
import { FaFlask, FaPlus } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getResearchGroups,
  deleteResearchGroup,
} from "../../services/researchGroupService";
import { getDepartments } from "../../services/departmentService";
import CreateResearchGroupModal from "./CreateResearchGroupModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

function GroupCard({ group, departmentName, canManage, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
            <FaFlask />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {group.name}
            </h3>
            <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              {departmentName}
            </span>
          </div>
        </div>

        {canManage && (
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(group)}
              className="rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(group)}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {group.description && (
        <p className="mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
          {group.description}
        </p>
      )}
    </div>
  );
}

export default function ResearchGroups() {
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [groupResponse, departmentResponse] = await Promise.all([
        getResearchGroups(token),
        getDepartments(token),
      ]);

      setGroups(groupResponse.groups || []);
      setDepartments(departmentResponse.departments || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load research groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDepartmentName = (departmentId) => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : "N/A";
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await deleteResearchGroup(token, confirm.id);
      setConfirm(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showError("Failed to delete research group");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const canManage = hasRole(...PERMISSIONS.RESEARCH_GROUP_MANAGE);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Research Groups
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Research groups organized under departments
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> Add Research Group
          </button>
        )}
      </div>

      {loading ? (
        <CardSkeleton count={3} className="sm:grid-cols-2 xl:grid-cols-3" />
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaFlask />}
            title="No research groups yet"
            description="Research groups connect departments to projects."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              departmentName={getDepartmentName(group.department_id)}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={(g) =>
                setConfirm({
                  id: g.id,
                  title: "Delete research group?",
                  message: `\"${g.name}\" and its records will be removed.`,
                })
              }
            />
          ))}
        </div>
      )}

      <CreateResearchGroupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGroup(null);
          setIsEditing(false);
        }}
        onGroupCreated={fetchData}
        group={selectedGroup}
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
