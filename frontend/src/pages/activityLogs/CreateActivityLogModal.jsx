import { useState } from "react";
import activityLogService from "../../services/activityLogService";

const CreateActivityLogModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    action: "",
    entity_type: "",
    entity_id: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await activityLogService.createActivityLog({
        ...formData,
        entity_id: formData.entity_id
          ? Number(formData.entity_id)
          : null,
      });

      alert("Activity log created successfully.");

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to create activity log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">

        <h2 className="text-xl font-bold mb-4">
          Create Activity Log
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-medium">
              Action
            </label>

            <input
              type="text"
              name="action"
              value={formData.action}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Created Project"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Entity Type
            </label>

            <input
              type="text"
              name="entity_type"
              value={formData.entity_type}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Project"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Entity ID
            </label>

            <input
              type="number"
              name="entity_id"
              value={formData.entity_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateActivityLogModal;