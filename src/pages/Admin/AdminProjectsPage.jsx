// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../lib/axios";
// import toast from "react-hot-toast";

// export default function AdminProjectsPage() {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetch = async () => {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.get("/admin/projects", { params: { per_page: 12 } });
//       setProjects(res.data.data || []);
//     } catch (err) {
//       toast.error("Failed to load projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetch(); }, []);

//   const softDelete = async (id) => {
//     if (!confirm("Soft delete project?")) return;
//     try {
//       await axiosInstance.delete(`/admin/projects/${id}`);
//       toast.success("Project deleted");
//       fetch();
//     } catch (err) {
//       toast.error("Failed to delete");
//     }
//   };

//   return (
//     <div className="bg-white rounded shadow p-6">
//       <h2 className="text-xl font-semibold mb-4">Projects</h2>
//       {loading ? <div>Loading...</div> : projects.length === 0 ? <div>No projects</div> : (
//         <div className="grid gap-4">
//           {projects.map(p => (
//             <div key={p.id} className="p-4 border rounded flex justify-between items-center">
//               <div>
//                 <div className="font-semibold">{p.name}</div>
//                 <div className="text-sm text-muted">{p.owner?.name || "—"}</div>
//               </div>
//               <div className="flex gap-2">
//                 <button className="btn btn-xs" onClick={()=> alert(JSON.stringify(p, null, 2))}>View</button>
//                 <button className="btn btn-xs btn-warning" onClick={()=>softDelete(p.id)}>Delete</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({});
  const [q, setQ] = useState("");
  const [trashed, setTrashed] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/projects", {
        params: {
          q: q || undefined,
          trashed: trashed ? true : undefined,
          page,
          per_page: 12,
        },
      });
      setProjects(res.data.data || []);
      setMeta({
        total: res.data.total,
        per_page: res.data.per_page,
        current_page: res.data.current_page,
        last_page: res.data.last_page,
      });
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [q, trashed, page]);

  const softDelete = async (projectId) => {
    const toastId = toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span>Project deleted</span>
          <button
            className="text-blue-600 font-bold"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await restore(projectId);
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
      await axiosInstance.delete(`/admin/projects/${projectId}`);
      fetchProjects();
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to delete project");
    }
  };

  const restore = async (projectId) => {
    const toastId = toast.loading("Restoring project...");
    try {
      await axiosInstance.post(`/admin/projects/${projectId}/restore`);
      toast.success("Project restored", { id: toastId });
      fetchProjects();
    } catch {
      toast.error("Failed to restore project", { id: toastId });
    }
  };

  const forceDelete = async (projectId) => {
    const toastId = toast.loading("Permanently deleting project...");
    try {
      await axiosInstance.delete(`/admin/projects/${projectId}/force`);
      toast.success("Project permanently deleted", { id: toastId });
      fetchProjects();
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || "Failed to permanently delete", { id: toastId });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Management</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by project name"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
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
              <th className="px-4 py-3 font-medium text-gray-700">Owner</th>
              <th className="px-4 py-3 font-medium text-gray-700">Members</th>
              <th className="px-4 py-3 font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500">Loading...</td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-500">No projects found</td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.owner?.name}</td>
                  <td className="px-4 py-3">{p.members?.length}</td>
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right flex flex-wrap justify-end gap-2">
                    {p.deleted_at ? (
                      <>
                        <button
                          type="button"
                          onClick={()=>restore(p.id)}
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={()=>forceDelete(p.id)}
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
                        >
                          Force Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={()=>softDelete(p.id)}
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
        <div className="text-gray-600 text-sm">Total Projects: {meta.total ?? 0}</div>
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

