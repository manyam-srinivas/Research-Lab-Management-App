import { useEffect, useState } from "react";
import {
  getAllBookings,
  getMyBookings,
  deleteBooking,
  updateBookingStatus,
} from "../../services/equipmentBookingService";

import { getEquipment } from "../../services/equipmentService";
import { getUsers } from "../../services/userService";

import CreateBookingModal from "./CreateBookingModal";

export default function EquipmentBookings() {
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    try {
      const [
        bookingRes,
        equipmentRes,
        userRes,
      ] = await Promise.all([
        user.role === "Admin" || user.role === "Lab Staff"
          ? getAllBookings(token)
          : getMyBookings(token),

        getEquipment(token),
        getUsers(token),
      ]);

      setBookings(bookingRes.bookings || []);
      setEquipment(equipmentRes.equipment || []);
      setUsers(userRes.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const equipmentName = (id) => {
    return (
      equipment.find((e) => e.id === id)?.name || "-"
    );
  };

  const userName = (id) => {
    return (
      users.find((u) => u.id === id)?.full_name || "-"
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete booking?")) return;

    try {
      await deleteBooking(token, id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Unable to delete booking");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(
        token,
        id,
        status
      );

      loadData();
    } catch (err) {
      console.error(err);
      alert("Unable to update booking");
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">
          Equipment Bookings
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book Equipment
        </button>
      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>
            <th className="border p-2">Equipment</th>
            <th className="border p-2">Requested By</th>
            <th className="border p-2">Start</th>
            <th className="border p-2">End</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>

        </thead>

        <tbody>

          {bookings.map((booking) => (

            <tr key={booking.id}>

              <td className="border p-2">
                {equipmentName(booking.equipment_id)}
              </td>

              <td className="border p-2">
                {userName(booking.requested_by)}
              </td>

              <td className="border p-2">
                {booking.start_time}
              </td>

              <td className="border p-2">
                {booking.end_time}
              </td>

              <td className="border p-2">
                {booking.status}
              </td>

              <td className="border p-2 space-x-2">

                {(user.role === "Admin" ||
                  user.role === "Lab Staff") &&
                  booking.status === "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatus(
                            booking.id,
                            "Approved"
                          )
                        }
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleStatus(
                            booking.id,
                            "Rejected"
                          )
                        }
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                {(user.role === "Admin" ||
                  user.role === "Lab Staff") &&
                  booking.status === "Approved" && (
                    <button
                      onClick={() =>
                        handleStatus(
                          booking.id,
                          "Completed"
                        )
                      }
                      className="bg-indigo-600 text-white px-2 py-1 rounded"
                    >
                      Complete
                    </button>
                  )}

                <button
                  onClick={() =>
                    handleDelete(booking.id)
                  }
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <CreateBookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        refresh={loadData}
      />

    </div>
  );
}