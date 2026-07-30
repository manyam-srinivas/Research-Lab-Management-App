import { useEffect, useState } from "react";
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            {isEditing ? "Edit Vendor" : "Add Vendor"}
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>

        <div className="space-y-4">

          <input
            name="vendor_name"
            placeholder="Vendor Name"
            value={formData.vendor_name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="contact_person"
            placeholder="Contact Person"
            value={formData.contact_person}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            name="rating"
            placeholder="Rating (0-5)"
            value={formData.rating}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
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
            {isEditing ? "Update Vendor" : "Create Vendor"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateVendorModal;