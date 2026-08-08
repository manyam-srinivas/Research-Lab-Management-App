import { useEffect, useState } from "react";
import {
  FaPlus,
  FaListUl,
  FaCalendarAlt,
} from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getAllBookings,
  getMyBookings,
  deleteBooking,
  updateBookingStatus,
} from "../../services/equipmentBookingService";

import { getEquipment } from "../../services/equipmentService";
import { getUsers } from "../../services/userService";

import CreateBookingModal from "./CreateBookingModal";
import BookingCalendar from "../../components/booking/BookingCalendar";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function EquipmentBookings() {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("list");
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingRes, equipmentRes, userRes] =
        await Promise.all([
          hasRole(...PERMISSIONS.BOOKING_APPROVE)
            ? getAllBookings(token)
            : getMyBookings(token),

          getEquipment(token),
          getUsers().catch(() => ({ users: [] })),
        ]);

      setBookings(bookingRes.bookings || []);
      setEquipment(equipmentRes.equipment || []);
      setUsers(userRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBooking(token, confirm.id);
      setConfirm(null);
      loadData();
    } catch (err) {
      console.error(err);
      showError("Unable to delete booking");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(token, id, status);
      loadData();
    } catch (err) {
      console.error(err);
      showError("Unable to update booking");
    }
  };

  const canApprove = hasRole(...PERMISSIONS.BOOKING_APPROVE);
  const canComplete = hasRole(...PERMISSIONS.BOOKING_COMPLETE);
  const canDelete = hasRole(...PERMISSIONS.BOOKING_DELETE);
  const showActions = canApprove || canComplete || canDelete;

  const viewBtn =
    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Equipment Bookings
        </h1>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
            <button
              onClick={() => setView("list")}
              className={`${viewBtn} ${
                view === "list"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <FaListUl /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`${viewBtn} ${
                view === "calendar"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <FaCalendarAlt /> Calendar
            </button>
          </div>

          {hasRole(...PERMISSIONS.EQUIPMENT_BOOKING_CREATE) && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              <FaPlus /> Book Equipment
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : view === "calendar" ? (
        <BookingCalendar bookings={bookings} equipment={equipment} />
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaCalendarAlt />}
            title="No bookings yet"
            description="Book equipment for your research to see it here."
            action={
              hasRole(...PERMISSIONS.EQUIPMENT_BOOKING_CREATE) ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  + Book Equipment
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Equipment</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Requested By</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Start</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">End</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                {showActions && (
                  <th className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-100">
                    {equipmentName(booking.equipment_id)}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {userName(booking.requested_by)}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                    {booking.start_time}
                  </td>
                  <td className="p-3 text-sm text-slate-600 dark:text-slate-300">
                    {booking.end_time}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={booking.status} size="sm" />
                  </td>

                  {showActions && (
                    <td className="p-3 space-x-2 text-center">
                      {canApprove && booking.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(booking.id, "Approved")}
                            className="bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(booking.id, "Rejected")}
                            className="bg-red-600 text-white px-2.5 py-1 rounded-lg hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {canComplete && booking.status === "Approved" && (
                        <button
                          onClick={() => handleStatus(booking.id, "Completed")}
                          className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition"
                        >
                          Complete
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() =>
                            setConfirm({
                              id: booking.id,
                              title: "Delete booking?",
                              message: "This booking will be permanently removed.",
                            })
                          }
                          className="bg-gray-700 text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateBookingModal
        open={showModal}
        onClose={() => setShowModal(false)}
        refresh={loadData}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
