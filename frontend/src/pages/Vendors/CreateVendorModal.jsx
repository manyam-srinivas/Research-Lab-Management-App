import { useState } from "react";

import { createVendor } from "../../services/vendorService";

function CreateVendorModal({
  isOpen,
  onClose,
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

      await createVendor(token, formData);

      alert("Vendor created successfully!");

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

      alert(
        error.response?.data?.message ||
        "Failed to create vendor"
      );

    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

      <div className="bg-white w-full max-w-xl rounded-xl p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Add Vendor
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
            Create Vendor
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateVendorModal;