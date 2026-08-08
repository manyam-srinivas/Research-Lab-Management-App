import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { getUsers } from "../../services/userService";
import { createNotification } from "../../services/notificationService";
import { showError } from "../../utils/toast";
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
      showError("Failed to create notification");
    }
  };

  

  return (
  <Modal
    isOpen={open}
    onClose={onClose}
    title="Create Notification"
    size="max-w-lg"
  >
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          User
        </label>

        <select
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
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
      </div>

      <Input
        label="Title"
        type="text"
        name="title"
        placeholder="Notification Title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Message
        </label>

        <textarea
          name="message"
          placeholder="Notification Message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          required
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      <Input
        label="Type"
        type="text"
        name="type"
        placeholder="Task, Budget, Equipment..."
        value={formData.type}
        onChange={handleChange}
        required
      />

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          Create
        </Button>

      </div>

    </form>
  </Modal>
);
}