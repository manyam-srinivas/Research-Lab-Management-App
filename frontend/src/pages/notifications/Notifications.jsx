import { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../../services/notificationService";

import CreateNotificationModal from "./CreateNotificationModal";

export default function Notifications() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications(token);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markAsRead(token, id);
      loadNotifications();
    } catch (err) {
      console.error(err);
      alert("Unable to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete notification?")) return;

    try {
      await deleteNotification(token, id);
      loadNotifications();
    } catch (err) {
      console.error(err);
      alert("Unable to delete notification");
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">
          Notifications
        </h1>

        {user.role === "Admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Notification
          </button>
        )}
      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>

          {notifications.map((notification) => (

            <tr key={notification.id}>

              <td className="border p-2">
                {notification.title}
              </td>

              <td className="border p-2">
                {notification.message}
              </td>

              <td className="border p-2">
                {notification.type}
              </td>

              <td className="border p-2">

                {notification.is_read ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    Read
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Unread
                  </span>
                )}

              </td>

              <td className="border p-2">
                {notification.created_at}
              </td>

              <td className="border p-2 space-x-2">

                {!notification.is_read && (
                  <button
                    onClick={() => handleRead(notification.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() => handleDelete(notification.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {user.role === "Admin" && (
        <CreateNotificationModal
          open={showModal}
          onClose={() => setShowModal(false)}
          refresh={loadNotifications}
        />
      )}

    </div>
  );
}