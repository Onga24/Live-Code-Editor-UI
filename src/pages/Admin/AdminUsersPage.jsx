import React, { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [trashed, setTrashed] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { q: q || undefined, role: role || undefined, page, trashed: trashed ? true : undefined, per_page: 12 },
      });
      setUsers(res.data.data || []);
      setMeta({
        total: res.data.total,
        per_page: res.data.per_page,
        current_page: res.data.current_page,
        last_page: res.data.last_page,
      });
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [q, role, page, trashed]);

  const changeRole = async (userId, newRole) => {
    const toastId = toast.loading("Updating role...");
    try {
      await axiosInstance.put(`/admin/users/${userId}`, { role: newRole });
      toast.success("Role updated", { id: toastId });
      fetchUsers();
    } catch {
      toast.error("Failed to update role", { id: toastId });
    }
  };

  const softDelete = async (userId) => {
    const toastId = toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span>User deleted</span>
          <button
            className="text-blue-600 font-bold"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await restore(userId);
                toast.success("Undo successful");
              } catch {
                toast.error("Failed to undo");
              }
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000 }
    );

    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to delete");
    }
  };

  const restore = async (userId) => {
    const toastId = toast.loading("Restoring user...");
    try {
      await axiosInstance.post(`/admin/users/${userId}/restore`);
      toast.success("User restored", { id: toastId });
      fetchUsers();
    } catch {
      toast.error("Failed to restore", { id: toastId });
    }
  };

  const forceDelete = async (userId) => {
    const toastId = toast.loading("Permanently deleting user...");
    try {
      await axiosInstance.delete(`/admin/users/${userId}/force`);
      toast.success("User permanently deleted", { id: toastId });
      fetchUsers();
    } catch {
      toast.error("Failed to permanently delete", { id: toastId });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by name or email"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
          <select
            value={role}
            onChange={(e)=>{setRole(e.target.value); setPage(1);}}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          >
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label className="flex items-center gap-1 text-gray-600">
            <input
              type="checkbox"
              checked={trashed}
              onChange={(e)=>{setTrashed(e.target.checked); setPage(1);}}
              className="w-4 h-4"
            />
            Show trashed
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 font-medium text-gray-700">Role</th>
              <th className="px-4 py-3 font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right flex flex-wrap justify-end gap-2">
                    {u.deleted_at ? (
                      <>
                        <button
                          onClick={()=>restore(u.id)}
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
                        >
                          Restore
                        </button>
                        <button
                          onClick={()=>forceDelete(u.id)}
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
                        >
                          Force Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={()=>changeRole(u.id, u.role === "admin" ? "member" : "admin")}
                          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
                        >
                          {u.role === "admin" ? "Demote" : "Promote"}
                        </button>
                        <button
                          onClick={()=>softDelete(u.id)}
                          className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded-lg shadow hover:bg-yellow-500 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-600 text-sm">Total Users: {meta.total ?? 0}</div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
            onClick={()=>setPage(p=>Math.max(1,p-1))}
            disabled={page<=1}
          >
            Prev
          </button>
          <span className="text-gray-700 font-medium">Page {meta.current_page ?? page} / {meta.last_page ?? "-"}</span>
          <button
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
            onClick={()=>setPage(p=> (meta.last_page ? Math.min(meta.last_page, p+1) : p+1))}
            disabled={meta.last_page && page>=meta.last_page}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
