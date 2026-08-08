import { useEffect, useState } from "react";
import { FaHistory, FaPlus } from "react-icons/fa";
import activityLogService from "../../services/activityLogService";
import CreateActivityLogModal from "./CreateActivityLogModal";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

function Chip({ children, color = "slate" }) {
  const colors = {
    slate:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors[color] || colors.slate}`}
    >
      {children}
    </span>
  );
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await activityLogService.getActivityLogs();
      setLogs(response.logs || []);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      showError("Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await activityLogService.deleteActivityLog(confirm.id);
      setConfirm(null);
      fetchLogs();
    } catch (error) {
      console.error(error);
      showError("Failed to delete activity log.");
    } finally {
      setDeleting(false);
    }
  };

  const canManage = hasRole(...PERMISSIONS.ACTIVITY_LOG_MANAGE);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Activity Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Audit trail of actions across the platform
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> Create Activity Log
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaHistory />}
            title="No activity logs"
            description="Actions performed in the system will appear here."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">ID</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">User ID</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Action</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Entity</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Entity ID</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">IP Address</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created At</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    #{log.id}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {log.user_id}
                  </td>
                  <td className="p-4">
                    <Chip color="blue">{log.action}</Chip>
                  </td>
                  <td className="p-4">
                    <Chip color="violet">{log.entity_type}</Chip>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {log.entity_id || "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {log.ip_address || "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                  </td>
                  {canManage && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setConfirm({
                            id: log.id,
                            title: "Delete activity log?",
                            message: `Log #${log.id} will be removed.`,
                          })
                        }
                        className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CreateActivityLogModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchLogs();
          }}
        />
      )}

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
