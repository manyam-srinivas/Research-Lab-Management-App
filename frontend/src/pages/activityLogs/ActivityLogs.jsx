import { useEffect, useState } from "react";
import activityLogService from "../../services/activityLogService";
import CreateActivityLogModal from "./CreateActivityLogModal";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showSuccess, showError } from "../../utils/toast";
const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity log?")) return;

    try {
      await activityLogService.deleteActivityLog(id);
      fetchLogs();
    } catch (error) {
      console.error(error);
      showError("Failed to delete activity log.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity Logs</h1>

        {hasRole(...PERMISSIONS.ACTIVITY_LOG_MANAGE) && (
  <button
    onClick={() => setShowModal(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Create Activity Log
  </button>
)}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">User ID</th>
                <th className="border p-2">Action</th>
                <th className="border p-2">Entity Type</th>
                <th className="border p-2">Entity ID</th>
                <th className="border p-2">IP Address</th>
                <th className="border p-2">Created At</th>
                {hasRole(...PERMISSIONS.ACTIVITY_LOG_MANAGE) && (
  <th className="border p-2">Actions</th>
)}
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={
  hasRole(...PERMISSIONS.ACTIVITY_LOG_MANAGE)
    ? 8
    : 7
}
                    className="text-center p-4"
                  >
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="border p-2">{log.id}</td>
                    <td className="border p-2">{log.user_id}</td>
                    <td className="border p-2">{log.action}</td>
                    <td className="border p-2">{log.entity_type}</td>
                    <td className="border p-2">{log.entity_id}</td>
                    <td className="border p-2">{log.ip_address}</td>
                    <td className="border p-2">{log.created_at}</td>

                    {hasRole(...PERMISSIONS.ACTIVITY_LOG_MANAGE) && (
  <td className="border p-2">
    <button
      onClick={() => handleDelete(log.id)}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
    >
      Delete
    </button>
  </td>
)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;