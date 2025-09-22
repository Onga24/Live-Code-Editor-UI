// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../lib/axios";
// import toast from "react-hot-toast";

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState([]);
//   const [meta, setMeta] = useState({});
//   const [q, setQ] = useState("");
//   const [role, setRole] = useState("");
//   const [page, setPage] = useState(1);
//   const [trashed, setTrashed] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.get("/admin/users", {
//         params: { q: q || undefined, role: role || undefined, page, trashed: trashed ? true : undefined, per_page: 12 },
//       });
//       setUsers(res.data.data || []);
//       setMeta({
//         total: res.data.total,
//         per_page: res.data.per_page,
//         current_page: res.data.current_page,
//         last_page: res.data.last_page,
//       });
//     } catch {
//       toast.error("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, [q, role, page, trashed]);

//   const changeRole = async (userId, newRole) => {
//     const toastId = toast.loading("Updating role...");
//     try {
//       await axiosInstance.put(`/admin/users/${userId}`, { role: newRole });
//       toast.success("Role updated", { id: toastId });
//       fetchUsers();
//     } catch {
//       toast.error("Failed to update role", { id: toastId });
//     }
//   };

//   const softDelete = async (userId) => {
//     const toastId = toast(
//       (t) => (
//         <div className="flex items-center justify-between gap-4">
//           <span>User deleted</span>
//           <button
//             className="text-blue-600 font-bold"
//             onClick={async () => {
//               toast.dismiss(t.id);
//               try {
//                 await restore(userId);
//                 toast.success("Undo successful");
//               } catch {
//                 toast.error("Failed to undo");
//               }
//             }}
//           >
//             Undo
//           </button>
//         </div>
//       ),
//       { duration: 5000 }
//     );

//     try {
//       await axiosInstance.delete(`/admin/users/${userId}`);
//       fetchUsers();
//     } catch {
//       toast.dismiss(toastId);
//       toast.error("Failed to delete");
//     }
//   };

//   const restore = async (userId) => {
//     const toastId = toast.loading("Restoring user...");
//     try {
//       await axiosInstance.post(`/admin/users/${userId}/restore`);
//       toast.success("User restored", { id: toastId });
//       fetchUsers();
//     } catch {
//       toast.error("Failed to restore", { id: toastId });
//     }
//   };

//   const forceDelete = async (userId) => {
//     const toastId = toast.loading("Permanently deleting user...");
//     try {
//       await axiosInstance.delete(`/admin/users/${userId}/force`);
//       toast.success("User permanently deleted", { id: toastId });
//       fetchUsers();
//     } catch {
//       toast.error("Failed to permanently delete", { id: toastId });
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//         <div className="flex gap-2 items-center flex-wrap">
//           <input
//             value={q}
//             onChange={(e) => { setQ(e.target.value); setPage(1); }}
//             placeholder="Search by name or email"
//             className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//           />
//           <select
//             value={role}
//             onChange={(e)=>{setRole(e.target.value); setPage(1);}}
//             className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//           >
//             <option value="">All roles</option>
//             <option value="user">User</option>
//             <option value="admin">Admin</option>
//           </select>
//           <label className="flex items-center gap-1 text-gray-600">
//             <input
//               type="checkbox"
//               checked={trashed}
//               onChange={(e)=>{setTrashed(e.target.checked); setPage(1);}}
//               className="w-4 h-4"
//             />
//             Show trashed
//           </label>
//         </div>
//       </div>

//       <div className="overflow-x-auto rounded-lg shadow bg-white">
//         <table className="w-full text-left">
//           <thead className="bg-gray-100 border-b">
//             <tr>
//               <th className="px-4 py-3 font-medium text-gray-700">Name</th>
//               <th className="px-4 py-3 font-medium text-gray-700">Email</th>
//               <th className="px-4 py-3 font-medium text-gray-700">Role</th>
//               <th className="px-4 py-3 font-medium text-gray-700">Created</th>
//               <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="5" className="text-center py-12 text-gray-500">Loading...</td>
//               </tr>
//             ) : users.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center py-12 text-gray-500">No users found</td>
//               </tr>
//             ) : (
//               users.map((u) => (
//                 <tr key={u.id} className="hover:bg-gray-50 transition">
//                   <td className="px-4 py-3">{u.name}</td>
//                   <td className="px-4 py-3">{u.email}</td>
//                   <td className="px-4 py-3 capitalize">{u.role}</td>
//                   <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
//                   <td className="px-4 py-3 text-right flex flex-wrap justify-end gap-2">
//                     {u.deleted_at ? (
//                       <>
//                         <button
//                           onClick={()=>restore(u.id)}
//                           className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
//                         >
//                           Restore
//                         </button>
//                         <button
//                           onClick={()=>forceDelete(u.id)}
//                           className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
//                         >
//                           Force Delete
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           onClick={()=>changeRole(u.id, u.role === "admin" ? "member" : "admin")}
//                           className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
//                         >
//                           {u.role === "admin" ? "Demote" : "Promote"}
//                         </button>
//                         <button
//                           onClick={()=>softDelete(u.id)}
//                           className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded-lg shadow hover:bg-yellow-500 transition"
//                         >
//                           Delete
//                         </button>
//                       </>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
//         <div className="text-gray-600 text-sm">Total Users: {meta.total ?? 0}</div>
//         <div className="flex items-center gap-2">
//           <button
//             className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
//             onClick={()=>setPage(p=>Math.max(1,p-1))}
//             disabled={page<=1}
//           >
//             Prev
//           </button>
//           <span className="text-gray-700 font-medium">Page {meta.current_page ?? page} / {meta.last_page ?? "-"}</span>
//           <button
//             className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
//             onClick={()=>setPage(p=> (meta.last_page ? Math.min(meta.last_page, p+1) : p+1))}
//             disabled={meta.last_page && page>=meta.last_page}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }






import React, { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { Users, Search, Filter, UserCheck, UserX, Trash2, RotateCcw, Crown, ShieldCheck, ChevronLeft, ChevronRight, Calendar, Mail, Eye, EyeOff } from "lucide-react";

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

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
          <Crown className="w-3 h-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
        <UserCheck className="w-3 h-3" />
        User
      </span>
    );
  };

  const getActionButton = (action, user) => {
    const baseClasses = "px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2";
    
    switch (action) {
      case 'promote':
        return (
          <button
            onClick={() => changeRole(user.id, "admin")}
            className={`${baseClasses} bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700`}
          >
            <Crown className="w-4 h-4" />
            Promote
          </button>
        );
      case 'demote':
        return (
          <button
            onClick={() => changeRole(user.id, "member")}
            className={`${baseClasses} bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700`}
          >
            <UserCheck className="w-4 h-4" />
            Demote
          </button>
        );
      case 'delete':
        return (
          <button
            onClick={() => softDelete(user.id)}
            className={`${baseClasses} bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700`}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        );
      case 'restore':
        return (
          <button
            onClick={() => restore(user.id)}
            className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700`}
          >
            <RotateCcw className="w-4 h-4" />
            Restore
          </button>
        );
      case 'force-delete':
        return (
          <button
            onClick={() => forceDelete(user.id)}
            className={`${baseClasses} bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900`}
          >
            <UserX className="w-4 h-4" />
            Force Delete
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                User Management
              </h2>
              <p className="text-gray-600 text-lg">Manage users, roles and permissions</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Role Filter */}
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => { setRole(e.target.value); setPage(1); }}
                  className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-6 py-3 pr-12 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                >
                  <option value="">All roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Trashed Toggle */}
              <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={trashed}
                  onChange={(e) => { setTrashed(e.target.checked); setPage(1); }}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  {trashed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Show trashed
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-lg">No users found</p>
                        <p className="text-gray-400">Try adjusting your search filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                        user.deleted_at ? 'opacity-60 bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Mail className="w-4 h-4" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        {getRoleBadge(user.role)}
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {user.deleted_at ? (
                            <>
                              {getActionButton('restore', user)}
                              {getActionButton('force-delete', user)}
                            </>
                          ) : (
                            <>
                              {user.role === "admin" 
                                ? getActionButton('demote', user)
                                : getActionButton('promote', user)
                              }
                              {getActionButton('delete', user)}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Users className="w-5 h-5" />
              <span>Total Users: {meta.total ?? 0}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                <span className="font-bold text-gray-700">
                  Page {meta.current_page ?? page} of {meta.last_page ?? "-"}
                </span>
              </div>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                onClick={() => setPage(p => (meta.last_page ? Math.min(meta.last_page, p + 1) : p + 1))}
                disabled={meta.last_page && page >= meta.last_page}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}