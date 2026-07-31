import { useEffect, useState } from "react";

import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import {
  createVendor,
  updateVendor,
} from "../../services/vendorService";

import { showError, showSuccess } from "../../utils/toast";
function CreateVendorModal({
  isOpen,
  onClose,
  vendor,
  isEditing,
  onVendorCreated,
}) {

  const [formData, setFormData] = useState({
    vendor_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    rating: "",
  });
  useEffect(() => {
  if (!isOpen) return;

  if (isEditing && vendor) {
    setFormData({
      vendor_name: vendor.vendor_name || "",
      contact_person: vendor.contact_person || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      rating: vendor.rating || "",
    });
  } else {
    setFormData({
      vendor_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      rating: "",
    });
  }
}, [isOpen, isEditing, vendor]);
  

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
      await updateVendor(
        token,
        vendor.id,
        formData
      );

      showSuccess("Vendor updated successfully!");
    } else {
      await createVendor(
        token,
        formData
      );

      showSuccess("Vendor created successfully!");
    }

    setFormData({
      vendor_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      rating: "",
    });

    onClose();
    onVendorCreated();

  } catch (error) {

    showError(
      error.response?.data?.message ||
      (isEditing
        ? "Failed to update vendor"
        : "Failed to create vendor")
    );

  }
};

  return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={isEditing ? "Edit Vendor" : "Add Vendor"}
    size="max-w-xl"
  >
    <div className="space-y-4">

      <Input
        label="Vendor Name"
        name="vendor_name"
        placeholder="Vendor Name"
        value={formData.vendor_name}
        onChange={handleChange}
      />

      <Input
        label="Contact Person"
        name="contact_person"
        placeholder="Contact Person"
        value={formData.contact_person}
        onChange={handleChange}
      />

      <Input
        label="Phone"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Address
        </label>

        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      <Input
        label="Rating"
        type="number"
        step="0.1"
        min="0"
        max="5"
        name="rating"
        placeholder="Rating (0-5)"
        value={formData.rating}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-3 pt-2">

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit}>
          {isEditing ? "Update Vendor" : "Create Vendor"}
        </Button>

      </div>

    </div>
  </Modal>
);
}

export default CreateVendorModal;