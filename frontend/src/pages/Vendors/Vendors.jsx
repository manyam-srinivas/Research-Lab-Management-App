import { useEffect, useState } from "react";
import {
  FaTruck,
  FaPlus,
  FaPhone,
  FaEnvelope,
  FaStar,
} from "react-icons/fa";
import { hasRole } from "../../utils/permissions";
import { PERMISSIONS } from "../../utils/rbac";
import { showError } from "../../utils/toast";
import {
  getVendors,
  deleteVendor,
} from "../../services/vendorService";
import CreateVendorModal from "./CreateVendorModal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { CardSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

function RatingStars({ rating }) {
  const value = Math.round(Number(rating || 0));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar
          key={i}
          className={
            i < value
              ? "text-amber-400"
              : "text-slate-300 dark:text-slate-600"
          }
        />
      ))}
    </div>
  );
}

function VendorCard({ vendor, canManage, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <FaTruck />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {vendor.vendor_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {vendor.contact_person || "-"}
            </p>
          </div>
        </div>
        <RatingStars rating={vendor.rating} />
      </div>

      <div className="mt-4 space-y-2.5 text-sm flex-1">
        <p className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
          <FaPhone className="text-slate-400" />
          {vendor.phone || "-"}
        </p>
        <p className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 break-all">
          <FaEnvelope className="text-slate-400" />
          {vendor.email || "-"}
        </p>
      </div>

      {canManage && (
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => onEdit(vendor)}
            className="flex-1 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(vendor)}
            className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await getVendors(token);
      setVendors(response.vendors || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await deleteVendor(token, confirm.id);
      setConfirm(null);
      fetchVendors();
    } catch (error) {
      console.error(error);
      showError("Failed to delete vendor");
    } finally {
      setDeleting(false);
    }
  };

  const canManage = hasRole(...PERMISSIONS.VENDOR_MANAGE);

  const avgRating = vendors.length
    ? vendors.reduce((s, v) => s + Number(v.rating || 0), 0) / vendors.length
    : 0;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Vendors
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Suppliers and equipment vendors for the lab
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedVendor(null);
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
          >
            <FaPlus /> Add Vendor
          </button>
        )}
      </div>

      {!loading && vendors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Vendors</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {vendors.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Average rating</p>
            <div className="mt-1.5 flex items-center gap-2">
              <RatingStars rating={Math.round(avgRating)} />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {avgRating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Rated 4+ stars</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {vendors.filter((v) => Number(v.rating || 0) >= 4).length}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <CardSkeleton count={3} className="sm:grid-cols-2 xl:grid-cols-3" />
      ) : vendors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
          <EmptyState
            icon={<FaTruck />}
            title="No vendors yet"
            description="Add vendors to track suppliers used in procurement."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={(v) =>
                setConfirm({
                  id: v.id,
                  title: "Delete vendor?",
                  message: `\"${v.vendor_name}\" and its records will be removed.`,
                })
              }
            />
          ))}
        </div>
      )}

      <CreateVendorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVendor(null);
          setIsEditing(false);
        }}
        vendor={selectedVendor}
        isEditing={isEditing}
        onVendorCreated={fetchVendors}
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
