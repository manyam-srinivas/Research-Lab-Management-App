import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { showSuccess, showError } from "../../utils/toast";
import {
  createEquipment,
  updateEquipment,
} from "../../services/equipmentService";

function CreateEquipmentModal({
  isOpen,
  onClose,
  equipment,
  isEditing,
  onEquipmentCreated,
}) {
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    serial_number: "",
    purchase_date: "",
    location: "",
    status: "Available",
  });

  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && equipment) {
    setFormData({
      name: equipment.name || "",
      description: equipment.description || "",
      category: equipment.category || "",
      serial_number: equipment.serial_number || "",
      purchase_date: equipment.purchase_date || "",
      location: equipment.location || "",
      status: equipment.status || "Available",
    });
  } else {
    setFormData({
      name: "",
      description: "",
      category: "",
      serial_number: "",
      purchase_date: "",
      location: "",
      status: "Available",
    });
  }
}, [isOpen, isEditing, equipment]);
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    if (isEditing) {
      await updateEquipment(
        token,
        equipment.id,
        formData
      );

      showSuccess("Equipment updated successfully!");
    } else {
      await createEquipment(
        token,
        formData
      );

      showSuccess("Equipment created successfully!");
    }

    setFormData({
      name: "",
      description: "",
      category: "",
      serial_number: "",
      purchase_date: "",
      location: "",
      status: "Available",
    });

    onClose();
    onEquipmentCreated();

  } catch (error) {
    showError(
      error.response?.data?.message ||
      (isEditing
        ? "Failed to update equipment"
        : "Failed to create equipment")
    );
  }
};
  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Equipment" : "Add Equipment"}
    size="max-w-xl"
  >
    <div className="space-y-4">

      <Input
        label="Equipment Name"
        name="name"
        placeholder="Equipment Name"
        value={formData.name}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      <Input
        label="Category"
        name="category"
        placeholder="Category"
        value={formData.category}
        onChange={handleChange}
      />

      <Input
        label="Serial Number"
        name="serial_number"
        placeholder="Serial Number"
        value={formData.serial_number}
        onChange={handleChange}
      />

      <Input
        label="Purchase Date"
        type="date"
        name="purchase_date"
        value={formData.purchase_date}
        onChange={handleChange}
      />

      <Input
        label="Location"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        >
          <option>Available</option>
          <option>Booked</option>
          <option>Under Maintenance</option>
          <option>Retired</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing ? "Update Equipment" : "Create Equipment"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateEquipmentModal;