import { useState } from "react";
import { createEquipment } from "../../services/equipmentService";

function CreateEquipmentModal({
  isOpen,
  onClose,
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

      await createEquipment(token, formData);

      alert("Equipment created successfully!");

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
      alert(
        error.response?.data?.message ||
        "Failed to create equipment"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Add Equipment
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

        <div className="flex justify-end gap-3 mt-6">

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
            Create Equipment
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateEquipmentModal;