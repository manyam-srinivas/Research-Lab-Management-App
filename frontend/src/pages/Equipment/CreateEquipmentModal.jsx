import { useEffect, useState } from "react";
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
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">

      <div className="bg-white w-full max-w-xl rounded-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            {isEditing ? "Edit Equipment" : "Add Equipment"}
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            name="name"
            placeholder="Equipment Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="serial_number"
            placeholder="Serial Number"
            value={formData.serial_number}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option>Available</option>
            <option>Booked</option>
            <option>Under Maintenance</option>
            <option>Retired</option>
          </select>

        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            {isEditing ? "Update Equipment" : "Create Equipment"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateEquipmentModal;