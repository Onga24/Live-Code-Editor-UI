

// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../lib/axios";
// import toast from "react-hot-toast";

// export default function AdminProjectsPage() {
//   const [projects, setProjects] = useState([]);
//   const [meta, setMeta] = useState({});
//   const [q, setQ] = useState("");
//   const [trashed, setTrashed] = useState(false);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const fetchProjects = async () => {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.get("/admin/projects", {
//         params: {
//           q: q || undefined,
//           trashed: trashed ? true : undefined,
//           page,
//           per_page: 12,
//         },
//       });
//       setProjects(res.data.data || []);
//       setMeta({
//         total: res.data.total,
//         per_page: res.data.per_page,
//         current_page: res.data.current_page,
//         last_page: res.data.last_page,
//       });
//     } catch {
//       toast.error("Failed to load projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, [q, trashed, page]);

//   const softDelete = async (projectId) => {
//     const toastId = toast(
//       (t) => (
//         <div className="flex items-center justify-between gap-4">
//           <span>Project deleted</span>
//           <button
//             className="text-blue-600 font-bold"
//             onClick={async () => {
//               toast.dismiss(t.id);
//               try {
//                 await restore(projectId);
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
//       await axiosInstance.delete(`/admin/projects/${projectId}`);
//       fetchProjects();
//     } catch {
//       toast.dismiss(toastId);
//       toast.error("Failed to delete project");
//     }
//   };

//   const restore = async (projectId) => {
//     const toastId = toast.loading("Restoring project...");
//     try {
//       await axiosInstance.post(`/admin/projects/${projectId}/restore`);
//       toast.success("Project restored", { id: toastId });
//       fetchProjects();
//     } catch {
//       toast.error("Failed to restore project", { id: toastId });
//     }
//   };

//   const forceDelete = async (projectId) => {
//     const toastId = toast.loading("Permanently deleting project...");
//     try {
//       await axiosInstance.delete(`/admin/projects/${projectId}/force`);
//       toast.success("Project permanently deleted", { id: toastId });
//       fetchProjects();
//     } catch (err) {
//       console.error(err.response?.data);
//       toast.error(err.response?.data?.message || "Failed to permanently delete", { id: toastId });
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Management</h2>

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//         <div className="flex gap-2 items-center flex-wrap">
//           <input
//             value={q}
//             onChange={(e) => { setQ(e.target.value); setPage(1); }}
//             placeholder="Search by project name"
//             className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
//           />
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
//               <th className="px-4 py-3 font-medium text-gray-700">Owner</th>
//               <th className="px-4 py-3 font-medium text-gray-700">Members</th>
//               <th className="px-4 py-3 font-medium text-gray-700">Created</th>
//               <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="5" className="text-center py-12 text-gray-500">Loading...</td>
//               </tr>
//             ) : projects.length === 0 ? (
//               <tr>
//                 <td colSpan="5" className="text-center py-12 text-gray-500">No projects found</td>
//               </tr>
//             ) : (
//               projects.map((p) => (
//                 <tr key={p.id} className="hover:bg-gray-50 transition">
//                   <td className="px-4 py-3">{p.name}</td>
//                   <td className="px-4 py-3">{p.owner?.name}</td>
//                   <td className="px-4 py-3">{p.members?.length}</td>
//                   <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
//                   <td className="px-4 py-3 text-right flex flex-wrap justify-end gap-2">
//                     {p.deleted_at ? (
//                       <>
//                         <button
//                           type="button"
//                           onClick={()=>restore(p.id)}
//                           className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
//                         >
//                           Restore
//                         </button>
//                         <button
//                           type="button"
//                           onClick={()=>forceDelete(p.id)}
//                           className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
//                         >
//                           Force Delete
//                         </button>
//                       </>
//                     ) : (
//                       <>
//                         <button
//                           type="button"
//                           onClick={()=>softDelete(p.id)}
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
//         <div className="text-gray-600 text-sm">Total Projects: {meta.total ?? 0}</div>
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
import { FolderKanban, Search, User, Users, Calendar, Trash2, RotateCcw, UserX, Eye, EyeOff, ChevronLeft, ChevronRight, Code, Folder } from "lucide-react";

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

  const getActionButton = (action, project) => {
    const baseClasses = "px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2";
    
    switch (action) {
      case 'delete':
        return (
          <button
            onClick={() => softDelete(project.id)}
            className={`${baseClasses} bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700`}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        );
      case 'restore':
        return (
          <button
            onClick={() => restore(project.id)}
            className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700`}
          >
            <RotateCcw className="w-4 h-4" />
            Restore
          </button>
        );
      case 'force-delete':
        return (
          <button
            onClick={() => forceDelete(project.id)}
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
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Project Management
              </h2>
              <p className="text-gray-600 text-lg">Monitor and manage all projects</p>
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
                placeholder="Search by project name..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 font-medium"
              />
            </div>

            {/* Trashed Toggle */}
            <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={trashed}
                onChange={(e) => { setTrashed(e.target.checked); setPage(1); }}
                className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
              />
              <div className="flex items-center gap-2 font-medium text-gray-700">
                {trashed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Show trashed
              </div>
            </label>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Project</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Owner</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Members</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Created</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Loading projects...</p>
                      </div>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <FolderKanban className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-lg">No projects found</p>
                        <p className="text-gray-400">Try adjusting your search filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr 
                      key={project.id} 
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 ${
                        project.deleted_at ? 'opacity-60 bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <Code className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{project.name}</p>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Folder className="w-4 h-4" />
                              <span>Project ID: {project.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {project.owner?.name?.charAt(0).toUpperCase() || 'N'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{project.owner?.name || 'No Owner'}</p>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <User className="w-3 h-3" />
                              <span>Owner</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{project.members?.length || 0}</p>
                            <p className="text-gray-500 text-sm">Members</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {project.deleted_at ? (
                            <>
                              {getActionButton('restore', project)}
                              {getActionButton('force-delete', project)}
                            </>
                          ) : (
                            <>
                              {getActionButton('delete', project)}
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
              <FolderKanban className="w-5 h-5" />
              <span>Total Projects: {meta.total ?? 0}</span>
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
              
              <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
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
