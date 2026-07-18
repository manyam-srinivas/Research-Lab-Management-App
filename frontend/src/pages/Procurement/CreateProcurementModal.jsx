import { useState } from "react";

import { createProcurementRequest } from "../../services/procurementService";

function CreateProcurementModal({
  isOpen,
  onClose,
  vendors,
  onCreated,
}) {
  const [formData, setFormData] = useState({
    item_name: "",
    vendor_id: "",
    quantity: "",
    estimated_cost: "",
    justification: "",
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

      await createProcurementRequest(token, {
        ...formData,
        vendor_id: formData.vendor_id
          ? Number(formData.vendor_id)
          : null,
        quantity: formData.quantity
          ? Number(formData.quantity)
          : null,
        estimated_cost: formData.estimated_cost
          ? Number(formData.estimated_cost)
          : null,
      });

      alert("Procurement request created successfully!");

      setFormData({
        item_name: "",
        vendor_id: "",
        quantity: "",
        estimated_cost: "",
        justification: "",
      });

      onClose();
      onCreated();

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create request"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            New Procurement Request
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            name="item_name"
            placeholder="Item Name"
            value={formData.item_name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              Select Vendor (Optional)
            </option>

            {vendors.map((vendor) => (
              <option
                key={vendor.id}
                value={vendor.id}
              >
                {vendor.vendor_name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            step="0.01"
            name="estimated_cost"
            placeholder="Estimated Cost"
            value={formData.estimated_cost}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="justification"
            placeholder="Justification"
            value={formData.justification}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            rows="4"
          />

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
            Create Request
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateProcurementModal;