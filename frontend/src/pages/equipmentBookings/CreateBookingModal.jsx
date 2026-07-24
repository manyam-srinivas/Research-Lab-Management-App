import { useEffect, useState } from "react";
import { getEquipment } from "../../services/equipmentService";
import { createBooking } from "../../services/equipmentBookingService";

export default function CreateBookingModal({
  open,
  onClose,
  refresh,
}) {
  const token = localStorage.getItem("token");

  const [equipment, setEquipment] = useState([]);

  const [formData, setFormData] = useState({
    equipment_id: "",
    start_time: "",
    end_time: "",
    purpose: "",
  });

  useEffect(() => {
    if (!open) return;

    const loadEquipment = async () => {
      try {
        const res = await getEquipment(token);
        setEquipment(res.equipment || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadEquipment();
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
      await createBooking(token, {
        ...formData,
        equipment_id: Number(formData.equipment_id),
      });

      refresh();

      setFormData({
        equipment_id: "",
        start_time: "",
        end_time: "",
        purpose: "",
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create booking");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white p-6 rounded w-[500px]">

        <h2 className="text-xl font-bold mb-4">
          Book Equipment
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <select
            name="equipment_id"
            value={formData.equipment_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">
              Select Equipment
            </option>

            {equipment.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="Purpose"
            className="w-full border p-2 rounded"
            rows={4}
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
              Book
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}