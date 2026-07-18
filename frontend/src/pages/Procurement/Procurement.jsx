import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getProcurementRequests,
  deleteProcurementRequest,
} from "../../services/procurementService";

import { getVendors } from "../../services/vendorService";

import CreateProcurementModal from "./CreateProcurementModal";

function Procurement() {
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [requestResponse, vendorResponse] =
        await Promise.all([
          getProcurementRequests(token),
          getVendors(token),
        ]);

      setRequests(requestResponse.requests);
      setVendors(vendorResponse.vendors);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(
      (v) => v.id === vendorId
    );

    return vendor
      ? vendor.vendor_name
      : "-";
  };

  const getStatusColor = (status) => {

    switch (status) {

      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Purchased":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Delete this procurement request?"
      )
    )
      return;

    try {

      await deleteProcurementRequest(
        token,
        id
      );

      fetchData();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
          "Delete failed"
      );

    }
  };

  return (
    <DashboardLayout>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Procurement
        </h1>

        <button
          onClick={() =>
            setIsModalOpen(true)
          }
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Request
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Item
              </th>

              <th className="p-4 text-left">
                Vendor
              </th>

              <th className="p-4 text-left">
                Quantity
              </th>

              <th className="p-4 text-left">
                Cost
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {requests.length > 0 ? (

              requests.map((request) => (

                <tr
                  key={request.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4">
                    {request.item_name}
                  </td>

                  <td className="p-4">
                    {getVendorName(
                      request.vendor_id
                    )}
                  </td>

                  <td className="p-4">
                    {request.quantity}
                  </td>

                  <td className="p-4">
                    ₹
                    {request.estimated_cost}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>

                  </td>

                  <td className="p-4 text-center">

                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          request.id
                        )
                      }
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
                  No Procurement Requests
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <CreateProcurementModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        vendors={vendors}
        onCreated={fetchData}
      />

    </DashboardLayout>
  );
}

export default Procurement;