import { useEffect, useState } from "react";
import { getUsers } from "../../services/userService";
import { createNotification } from "../../services/notificationService";

export default function CreateNotificationModal({
  open,
  onClose,
  refresh,
}) {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    user_id: "",
    title: "",
    message: "",
    type: "",
  });

  useEffect(() => {
    if (!open) return;

    const loadUsers = async () => {
      try {
        const res = await getUsers(token);
        setUsers(res.users || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadUsers();
  }, [open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createNotification(token, {
        ...formData,
        user_id: Number(formData.user_id),
      });

      refresh();

      setFormData({
        user_id: "",
        title: "",
        message: "",
        type: "",
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create notification");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-lg p-6 w-[500px]">

        <h2 className="text-xl font-bold mb-4">
          Create Notification
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <select
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">
              Select User
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.full_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="message"
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />

          <input
            type="text"
            name="type"
            placeholder="Type (Task, Budget, Equipment...)"
            value={formData.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <div className="flex justify-end gap-2">

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}