import { useEffect, useState } from "react";
import {
  getUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  changeUserRole,
  activateUser,
  deactivateUser,
} from "../../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const fetchUsers = async () => {
    try {
      const response = await getUsers();

setUsers(response.users);

const roles = {};

response.users.forEach((user) => {
  roles[user.id] = user.role;
});

setSelectedRoles(roles);
    } catch (error) {
      console.error(error);
      alert("Failed to load users.");
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await getPendingUsers();
      setPendingUsers(response.users);
    } catch (error) {
      console.error(error);
      alert("Failed to load pending users.");
    }
  };

  const handleApprove = async (user) => {
    const confirmApprove = window.confirm(
      `Approve ${user.full_name}?`
    );

    if (!confirmApprove) return;

    try {
      await approveUser(user.id, user.requested_role);

      alert("User approved successfully.");

      fetchPendingUsers();
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to approve user."
      );
    }
  };

  const handleReject = async (user) => {
    const confirmReject = window.confirm(
      `Reject ${user.full_name}?`
    );

    if (!confirmReject) return;

    try {
      await rejectUser(user.id);

      alert("User rejected successfully.");

      fetchPendingUsers();
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Failed to reject user."
      );
    }
  };
  const handleRoleUpdate = async (user) => {
  try {
    await changeUserRole(
      user.id,
      selectedRoles[user.id]
    );

    alert("User role updated successfully.");

    fetchUsers();
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to update role."
    );
  }
};
const handleStatusToggle = async (user) => {
  try {
    if (user.status === "Active") {
      await deactivateUser(user.id);
      alert("User deactivated successfully.");
    } else {
      await activateUser(user.id);
      alert("User activated successfully.");
    }

    fetchUsers();
  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Operation failed."
    );
  }
};

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          User Management
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Pending Approvals
        </h2>

        <table className="w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Requested Role</th>
              <th className="p-4 text-center">
  Actions
</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-4">
                    {user.full_name}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">
                    {user.requested_role}
                  </td>

                  <td className="p-4">
  {user.status} </td>


                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleApprove(user)}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(user)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-8 text-slate-500"
                >
                  No Pending Users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
  <h2 className="text-xl font-semibold mb-4">
    All Users
  </h2>

  <table className="w-full border-collapse">
    <thead className="bg-slate-100">
      <tr>
        <th className="p-4 text-left">Name</th>
        <th className="p-4 text-left">Email</th>
        <th className="p-4 text-left">Role</th>
        <th className="p-4 text-left">Status</th>
        <th className="p-4 text-center">Actions</th>
      </tr>
    </thead>

    <tbody>
      {users.length > 0 ? (
        users.map((user) => (
          <tr
            key={user.id}
            className="border-t hover:bg-slate-50"
          >
            <td className="p-4">
              {user.full_name}
            </td>

            <td className="p-4">
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
                className="border rounded px-2 py-1"
              >
                <option value="Admin">Admin</option>
                <option value="Faculty">Faculty</option>
                <option value="Research Scholar">
                  Research Scholar
                </option>
                <option value="Student">Student</option>
                <option value="Lab Staff">
                  Lab Staff
                </option>
              </select>
            </td>

            <td className="p-4">
              {user.status}
            </td>

            <td className="p-4 text-center space-x-2">
  <button
    onClick={() => handleRoleUpdate(user)}
    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
  >
    Update Role
  </button>

  {user.status === "Active" ? (
    <button
      onClick={() => handleStatusToggle(user)}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
    >
      Deactivate
    </button>
  ) : (
    <button
      onClick={() => handleStatusToggle(user)}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      Activate
    </button>
  )}
</td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={5}
            className="text-center p-8 text-slate-500"
          >
            No Users Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
    </>
  );
}

export default Users;