import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { getEquipment } from "../../services/equipmentService";
import { createBooking } from "../../services/equipmentBookingService";
import { showError } from "../../utils/toast";
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
      showError("Failed to create booking");
    }
  };

  

  return (
  <Modal
    isOpen={open}
    onClose={onClose}
    title="Book Equipment"
    size="max-w-lg"
  >
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Equipment
        </label>

        <select
          name="equipment_id"
          value={formData.equipment_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
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
      </div>

      <Input
        label="Start Time"
        type="datetime-local"
        name="start_time"
        value={formData.start_time}
        onChange={handleChange}
        required
      />

      <Input
        label="End Time"
        type="datetime-local"
        name="end_time"
        value={formData.end_time}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Purpose
        </label>

        <textarea
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Purpose"
          rows={4}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          Book
        </Button>

      </div>

    </form>
  </Modal>
);
}