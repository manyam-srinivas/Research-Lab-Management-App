import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import {
  createProcurementRequest,
  updateProcurementRequest,
} from "../../services/procurementService";

import { showError, showSuccess } from "../../utils/toast";

function CreateProcurementModal({
  isOpen,
  onClose,
  vendors,
  request,
  isEditing,
  onCreated,
}) {
  const [formData, setFormData] = useState({
    item_name: "",
    vendor_id: "",
    quantity: "",
    estimated_cost: "",
    justification: "",
  });
  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && request) {
    setFormData({
      item_name: request.item_name || "",
      vendor_id: request.vendor_id || "",
      quantity: request.quantity || "",
      estimated_cost: request.estimated_cost || "",
      justification: request.justification || "",
    });
  } else {
    setFormData({
      item_name: "",
      vendor_id: "",
      quantity: "",
      estimated_cost: "",
      justification: "",
    });
  }
}, [isOpen, isEditing, request]);

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  try {
    const token = localStorage.getItem("token");

    const payload = {
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
    };

    if (isEditing) {
      await updateProcurementRequest(
        token,
        request.id,
        payload
      );

      showSuccess("Procurement request updated successfully!");
    } else {
      await createProcurementRequest(
        token,
        payload
      );

      showSuccess("Procurement request created successfully!");
    }

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

    showError(
      error.response?.data?.message ||
      (isEditing
        ? "Failed to update request"
        : "Failed to create request")
    );
  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={
      isEditing
        ? "Edit Procurement Request"
        : "New Procurement Request"
    }
    size="max-w-xl"
  >
    <div className="space-y-4">

      <Input
        label="Item Name"
        name="item_name"
        placeholder="Item Name"
        value={formData.item_name}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Vendor
        </label>

        <select
          name="vendor_id"
          value={formData.vendor_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
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
      </div>

      <Input
        label="Quantity"
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={handleChange}
      />

      <Input
        label="Estimated Cost"
        type="number"
        step="0.01"
        name="estimated_cost"
        placeholder="Estimated Cost"
        value={formData.estimated_cost}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Justification
        </label>

        <textarea
          name="justification"
          placeholder="Justification"
          value={formData.justification}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing
            ? "Update Request"
            : "Create Request"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateProcurementModal;