import { useEffect, useState } from "react";
import { FaUserCog, FaUserCheck, FaUserClock } from "react-icons/fa";
import {
  getUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  changeUserRole,
  activateUser,
  deactivateUser,
} from "../../services/userService";
import { showError, showSuccess } from "../../utils/toast";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { TableSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [acting, setActing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter) params.set("role", roleFilter);
      const qs = params.toString();

      const response = await getUsers(qs ? `?${qs}` : "");
      setUsers(response.users || []);

      const roles = {};
      (response.users || []).forEach((user) => {
        roles[user.id] = user.role;
      });
      setSelectedRoles(roles);
    } catch (error) {
      console.error(error);
      showError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await getPendingUsers();
      setPendingUsers(response.users || []);
    } catch (error) {
      console.error(error);
      showError("Failed to load pending users.");
    }
  };

  const handleApprove = async () => {
    setActing(true);
    try {
      const { user } = confirm;
      await approveUser(user.id, user.requested_role);
      showSuccess("User approved successfully.");
      setConfirm(null);
      fetchPendingUsers();
      fetchUsers();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to approve user.");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      const { user } = confirm;
      await rejectUser(user.id);
      showSuccess("User rejected successfully.");
      setConfirm(null);
      fetchPendingUsers();
      fetchUsers();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to reject user.");
    } finally {
      setActing(false);
    }
  };

  const handleRoleUpdate = async (user) => {
    try {
      await changeUserRole(user.id, selectedRoles[user.id]);
      showSuccess("User role updated successfully.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Failed to update role.");
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      if (user.status === "Active") {
        await deactivateUser(user.id);
        showSuccess("User deactivated successfully.");
      } else {
        await activateUser(user.id);
        showSuccess("User activated successfully.");
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Operation failed.");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, [search, statusFilter, roleFilter]);

  const activeCount = users.filter((u) => u.status === "Active").length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          User Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Approve registrations and manage user roles
        </p>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total users</p>
            <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
              {users.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending approvals</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingUsers.length}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 shadow p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active users</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </p>
          </div>
        </div>
      )}

      {/* Pending approvals */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FaUserClock className="text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Pending Approvals
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow">
            <EmptyState
              icon={<FaUserCheck />}
              title="No pending approvals"
              description="New registrations will appear here for review."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-slate-900 rounded-xl shadow p-5 flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-lg font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    {(user.full_name || "?")[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {user.full_name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {user.requested_role}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() =>
                      setConfirm({
                        user,
                        action: "approve",
                        title: "Approve user?",
                        message: `${user.full_name} will be granted the ${user.requested_role} role.`,
                      })
                    }
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      setConfirm({
                        user,
                        action: "reject",
                        title: "Reject user?",
                        message: `${user.full_name} will be rejected and cannot sign in.`,
                      })
                    }
                    className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All users */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-5">
          <FaUserCog className="text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            All Users
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
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
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-4 py-2.5 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Faculty">Faculty</option>
            <option value="Research Scholar">Research Scholar</option>
            <option value="Student">Student</option>
            <option value="Lab Staff">Lab Staff</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={<FaUserCog />}
            title="No users found"
            description="Try adjusting the search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          {(user.full_name || "?")[0]}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {user.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <select
                        value={selectedRoles[user.id] || ""}
                        onChange={(e) =>
                          setSelectedRoles({
                            ...selectedRoles,
                            [user.id]: e.target.value,
                          })
                        }
                        className="rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 px-2 py-1.5 text-sm outline-none transition focus:border-blue-500"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Research Scholar">Research Scholar</option>
                        <option value="Student">Student</option>
                        <option value="Lab Staff">Lab Staff</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={user.status} size="sm" />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleRoleUpdate(user)}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition"
                        >
                          Update Role
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`rounded-lg px-3 py-1 text-xs font-medium text-white transition ${
                            user.status === "Active"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmText={confirm?.action === "approve" ? "Approve" : "Reject"}
        tone={confirm?.action === "approve" ? "success" : "danger"}
        loading={acting}
        onConfirm={confirm?.action === "approve" ? handleApprove : handleReject}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
