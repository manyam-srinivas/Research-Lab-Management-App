import { useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import activityLogService from "../../services/activityLogService";
import { showSuccess, showError } from "../../utils/toast";
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

      showSuccess("Activity log created successfully.");

      onSuccess();
    } catch (error) {
      console.error(error);
      showError("Failed to create activity log.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <Modal
    isOpen={true}
    onClose={onClose}
    title="Create Activity Log"
    size="max-w-md"
  >
    <form onSubmit={handleSubmit} className="space-y-4">

      <Input
        label="Action"
        type="text"
        name="action"
        value={formData.action}
        onChange={handleChange}
        placeholder="Created Project"
        required
      />

      <Input
        label="Entity Type"
        type="text"
        name="entity_type"
        value={formData.entity_type}
        onChange={handleChange}
        placeholder="Project"
        required
      />

      <Input
        label="Entity ID"
        type="number"
        name="entity_id"
        value={formData.entity_id}
        onChange={handleChange}
        placeholder="1"
      />

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>

      </div>

    </form>
  </Modal>
);
};

export default CreateActivityLogModal;