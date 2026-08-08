import { useEffect, useState } from "react";
import { FaBell, FaPlus, FaCheckDouble } from "react-icons/fa";
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "../../services/notificationService";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import CreateNotificationModal from "./CreateNotificationModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { showError } from "../../utils/toast";

export default function Notifications() {
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(token);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleRead = async (id) => {
    try {
      await markAsRead(token, id);
      loadNotifications();
    } catch (err) {
      console.error(err);
      showError("Unable to mark notification as read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead(token);
      loadNotifications();
    } catch (err) {
      console.error(err);
      showError("Unable to mark notifications as read");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNotification(token, confirm.id);
      setConfirm(null);
      loadNotifications();
    } catch (err) {
      console.error(err);
      showError("Unable to delete notification");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Notifications
          </h1>
          {!loading && unread > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {unread} unread
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:border-blue-400 transition"
            >
              <FaCheckDouble /> Mark all read
            </button>
          )}

          {hasRole(...PERMISSIONS.NOTIFICATION_CREATE) && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              <FaPlus /> Create Notification
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaBell />}
            title="No notifications"
            description="Important updates and booking decisions will appear here."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[800px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Message</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created</th>
                <th className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr
                  key={notification.id}
                  className={`border-t border-slate-100 dark:border-slate-800 transition ${
                    !notification.is_read
                      ? "bg-blue-50/50 dark:bg-blue-500/5"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-100">
                    {notification.title}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {notification.message}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {notification.type}
                  </td>
                  <td className="p-3">
                    <StatusBadge
                      status={notification.is_read ? "Read" : "Unread"}
                      size="sm"
                    />
                  </td>
                  <td className="p-3 text-sm text-slate-500 dark:text-slate-400">
                    {notification.created_at}
                  </td>
                  <td className="p-3 space-x-2 text-center">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleRead(notification.id)}
                        className="bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition"
                      >
                        Mark Read
                      </button>
                    )}

                    {hasRole(...PERMISSIONS.NOTIFICATION_MANAGE) && (
                      <button
                        onClick={() =>
                          setConfirm({
                            id: notification.id,
                            title: "Delete notification?",
                            message: `\"${notification.title}\" will be permanently removed.`,
                          })
                        }
                        className="bg-red-600 text-white px-2.5 py-1 rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasRole(...PERMISSIONS.NOTIFICATION_CREATE) && (
        <CreateNotificationModal
          open={showModal}
          onClose={() => setShowModal(false)}
          refresh={loadNotifications}
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
    </div>
  );
}
