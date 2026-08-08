import { useEffect, useState } from "react";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getProcurementRequests,
  deleteProcurementRequest,
} from "../../services/procurementService";
import { getProjects } from "../../services/projectService";
import { getVendors } from "../../services/vendorService";
import CreateProcurementModal from "./CreateProcurementModal";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const money = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

export default function Procurement() {
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();

      const [requestResponse, vendorResponse, projectResponse] =
        await Promise.all([
          getProcurementRequests(token, qs ? `?${qs}` : ""),
          getVendors(token),
          getProjects(token),
        ]);

      setRequests(requestResponse.requests || []);
      setVendors(vendorResponse.vendors || []);
      setProjects(projectResponse.projects || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load procurement requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const getProjectTitle = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : "-";
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.vendor_name : "-";
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProcurementRequest(token, confirm.id);
      setConfirm(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const canCreate = hasRole(...PERMISSIONS.PROCUREMENT_CREATE);
  const canManage = hasRole(...PERMISSIONS.PROCUREMENT_MANAGE);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Procurement
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Purchase requests for lab equipment and supplies
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setSelectedRequest(null);
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> New Request
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search items..."
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
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Purchased">Purchased</option>
        </select>
      </div>

      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Requests</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {requests.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaShoppingCart />}
            title="No procurement requests"
            description="Requests track purchases from lab vendors."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Item</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Project</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vendor</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quantity</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cost</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                {canManage && (
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {request.item_name}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {getProjectTitle(request.project_id)}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {getVendorName(request.vendor_id)}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {request.quantity}
                  </td>
                  <td className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {money(request.estimated_cost)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={request.status} size="sm" />
                  </td>
                  {canManage && (
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(request)}
                          className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              id: request.id,
                              title: "Delete request?",
                              message: `\"${request.item_name}\" request will be removed.`,
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

      <CreateProcurementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
          setIsEditing(false);
        }}
        vendors={vendors}
        request={selectedRequest}
        isEditing={isEditing}
        onCreated={fetchData}
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
