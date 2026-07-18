import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getVendors,
  deleteVendor,
} from "../../services/vendorService";

import CreateVendorModal from "./CreateVendorModal";

function Vendors() {

  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVendors = async () => {
    try {

      const token = localStorage.getItem("token");

      const response = await getVendors(token);

      setVendors(response.vendors);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this vendor?")) return;

    try {

      const token = localStorage.getItem("token");

      await deleteVendor(token, id);

      fetchVendors();

    } catch (error) {

      console.error(error);
      alert("Failed to delete vendor");

    }
  };

  return (
    <DashboardLayout>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Vendors
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Vendor
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">Vendor</th>
              <th className="p-4 text-left">Contact Person</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Rating</th>
              <th className="p-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {vendors.length > 0 ? (

              vendors.map((vendor) => (

                <tr
                  key={vendor.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {vendor.vendor_name}
                  </td>

                  <td className="p-4">
                    {vendor.contact_person}
                  </td>

                  <td className="p-4">
                    {vendor.phone}
                  </td>

                  <td className="p-4">
                    {vendor.email}
                  </td>

                  <td className="p-4">
                    {vendor.rating}
                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="text-center p-8 text-slate-500"
                >
                  No Vendors Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateVendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVendorCreated={fetchVendors}
      />

    </DashboardLayout>
  );
}

export default Vendors;