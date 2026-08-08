import { useEffect, useState } from "react";
import { FaTools, FaPlus, FaFileCsv } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getEquipment,
  deleteEquipment,
  exportEquipmentCsv,
} from "../../services/equipmentService";
import CreateEquipmentModal from "./CreateEquipmentModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();

      const response = await getEquipment(token, qs ? `?${qs}` : "");
      setEquipment(response.equipment || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search, statusFilter]);

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEquipment(token, confirm.id);
      setConfirm(null);
      fetchEquipment();
    } catch (error) {
      console.error(error);
      showError("Failed to delete equipment");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportEquipmentCsv(token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "equipment.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showError("Failed to export equipment");
    }
  };

  const canManage = hasRole(...PERMISSIONS.EQUIPMENT_MANAGE);

  const availableCount = equipment.filter((i) => i.status === "Available").length;
  const bookedCount = equipment.filter((i) => i.status === "Booked").length;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Equipment
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Lab instruments, tools and their availability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition"
          >
            <FaFileCsv /> Export CSV
          </button>

          {canManage && (
            <button
              onClick={() => {
                setSelectedEquipment(null);
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
            >
              <FaPlus /> Add Equipment
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {!loading && equipment.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total items</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {equipment.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {availableCount}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Booked</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {bookedCount}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : equipment.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaTools />}
            title="No equipment yet"
            description="Add lab equipment to manage bookings and availability."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Serial No.</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Location</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {equipment.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {item.name}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.category}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.serial_number || "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.location || "-"}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  {canManage && (
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              id: item.id,
                              title: "Delete equipment?",
                              message: `\"${item.name}\" will be removed from the lab inventory.`,
                            })
                          }
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateEquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEquipment(null);
          setIsEditing(false);
        }}
        equipment={selectedEquipment}
        isEditing={isEditing}
        onEquipmentCreated={fetchEquipment}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
