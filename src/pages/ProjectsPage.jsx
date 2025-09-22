import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { PlusCircle, Users, LogIn, FolderOpen, Calendar, Code, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectsPage = () => {
    const { authUser, apiRequest } = useContext(AuthContext);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    const [name, setName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [errors, setErrors] = useState({});

    // For Edit / Delete modals
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);
    const [editName, setEditName] = useState("");

    // fetch user projects
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/projects', 'GET');
            if (res.success) setProjects(res.projects || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // create project
    const handleCreate = async (e) => {
        e.preventDefault();
        setErrors({});
        const res = await apiRequest('/projects', 'POST', { name });
        if (res.success) {
            setProjects([...projects, res.project]);
            setName("");
            setShowCreateForm(false);
        } else {
            setErrors(res.errors || {});
        }
    };

    // join project
    const handleJoin = async (e) => {
        e.preventDefault();
        setErrors({});
        const res = await apiRequest('/projects/join', 'POST', { 'invite_code': inviteCode });
        if (res.success) {
            setProjects([...projects, res.project]);
            setInviteCode("");
            setShowJoinForm(false);
        } else {
            setErrors(res.errors || {});
        }
    };

    // update project
    const handleUpdate = async () => {
        if (!editName || editName === editingProject.name) {
            setEditingProject(null);
            return;
        }
        // prevent duplicate name locally
        if (projects.some(p => p.name.toLowerCase() === editName.toLowerCase() && p.id !== editingProject.id)) {
            setErrors({ name: ["Project name already exists."] });
            return;
        }

        try {
            const res = await apiRequest(`/projects/${editingProject.id}`, "PUT", { name: editName });
            if (res.success) {
                setProjects(projects.map(p => p.id === editingProject.id ? res.project : p));
                setEditingProject(null);
                setErrors({});
            } else {
                alert(res.message || "Failed to update project");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // soft delete project
    const handleDelete = async () => {
        try {
            const res = await apiRequest(`/projects/${deletingProject.id}`, "DELETE");
            if (res.success) {
                setProjects(projects.filter(p => p.id !== deletingProject.id));
                setDeletingProject(null);
            } else {
                alert(res.message || "Failed to delete project");
            }
        } catch (err) {
            console.error(err);
        }
    };


  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Invitation code copied!");
  };



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-20">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                My Projects
                            </h1>
                            <p className="text-gray-600 mt-2">Manage and collaborate on your projects</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <PlusCircle size={20} />
                                Create Project
                            </button>
                            <button
                                onClick={() => setShowJoinForm(!showJoinForm)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <LogIn size={20} />
                                Join Project
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create project form */}
                {showCreateForm && (
                    <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Create New Project</h3>
                            <button onClick={() => setShowCreateForm(false)} className="text-white hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter project name..."
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name[0]}</p>}
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold">
                                    Create Project
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join project form */}
                {showJoinForm && (
                    <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Join Existing Project</h3>
                            <button onClick={() => setShowJoinForm(false)} className="text-white hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleJoin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Invite Code</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        placeholder="Enter invite code..."
                                    />
                                    {errors.invite_code && <p className="text-red-500 text-sm mt-2">{errors.invite_code[0]}</p>}
                                </div>
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold">
                                    Join Project
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Projects List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Code className="w-6 h-6 text-blue-600 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
                            <p className="text-gray-500">Create your first project or join an existing one to get started!</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p) => (
                            <div
                                key={p.id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100 overflow-hidden transform hover:scale-105"
                                onClick={() => navigate(`/projects/${p.id}`)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                            <Code className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                                        {p.name}
                                    </h2>

                                    {/* Show Edit / Delete if current user is owner */}
                                    {p.owner_id === authUser?.id && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingProject(p);
                                                    setEditName(p.name);
                                                }}
                                                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingProject(p);
                                                }}
                                                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500">Invite Code</span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-mono text-sm">
                                                {p.invite_code}
                                            </span>


<button
  onClick={(e) => {
    e.stopPropagation(); 
    copyToClipboard(p.invite_code);
  }}
  className="ml-2 text-blue-600 hover:underline text-sm"
>
  Copy
</button>




                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <Users size={18} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {p.members?.length || 1} Member{(p.members?.length || 1) !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                {editingProject && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg mb-3"
                            />
                            {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name[0]}</p>}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingProject(null)}
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {deletingProject && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Project</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-bold">{deletingProject.name}</span>? 
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setDeletingProject(null)}
                                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;





// import { useState, useEffect, useContext } from "react"
// import { AuthContext } from "../context/AuthContext"
// import { PlusCircle, Users, LogIn, FolderOpen, Calendar, Code, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const ProjectsPage = () => {
//     const { authUser, apiRequest } = useContext(AuthContext);
//     const navigate = useNavigate();

//     const [ projects, setProjects ] = useState([]);
//     const [ loading, setLoading ] = useState(false);
//     const [ showCreateForm, setShowCreateForm ] = useState(false);
//     const [ showJoinForm, setShowJoinForm ] = useState(false);

//     const [ name, setName ] = useState("");
//     const [ inviteCode, setInviteCode ] = useState("");
//     const [ errors, setErrors ] = useState("");

//     // fetch user projects
//     const fetchProjects = async() => {
//         setLoading(true);
//         try{
//             const res = await apiRequest('/projects', 'GET');
//             if( res.success ) setProjects( res.projects || [] );
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchProjects();
//     }, []);

//     // create project
//     const handleCreate = async(e) => {
//         e.preventDefault();
//         setErrors({})
//         const res = await apiRequest('/projects', 'POST', { name });
//         if ( res.success ) {
//             setProjects([...projects, res.project]);
//             setName("");
//             setShowCreateForm(false);
//         } else {
//             setErrors(res.errors || {});
//         }
//     };

//     // join project
//     const handleJoin = async(e) => {
//         e.preventDefault();
//         setErrors({});
//         const res = await apiRequest('/projects/join', 'POST', { 'invite_code': inviteCode });
//         if ( res.success ) {
//             setProjects([...projects, res.project]);
//             setInviteCode("");
//             setShowJoinForm(false);
//         } else {
//             setErrors(res.errors || {});
//         }
//     };

//     // update project
// const handleUpdate = async (project) => {
//     const newName = prompt("Enter new name", project.name);
//     if (!newName || newName === project.name) return;

//     try {
//         const res = await apiRequest(`/projects/${project.id}`, "PUT", { name: newName });
//         if (res.success) {
//             setProjects(projects.map(p => p.id === project.id ? res.project : p));
//         } else {
//             alert(res.message || "Failed to update project");
//         }
//     } catch (err) {
//         console.error(err);
//     }
// };

// // soft delete project
// const handleDelete = async (project) => {
//     if (!window.confirm(`Delete project "${project.name}"?`)) return;

//     try {
//         const res = await apiRequest(`/projects/${project.id}`, "DELETE");
//         if (res.success) {
//             setProjects(projects.filter(p => p.id !== project.id));
//         } else {
//             alert(res.message || "Failed to delete project");
//         }
//     } catch (err) {
//         console.error(err);
//     }
// };


//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-20">
//             <div className="max-w-6xl mx-auto p-6">
//                 {/* Header Section */}
//                 <div className="mb-8">
//                     <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
//                         <div>
//                             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                                 My Projects
//                             </h1>
//                             <p className="text-gray-600 mt-2">Manage and collaborate on your projects</p>
//                         </div>
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setShowCreateForm(!showCreateForm)}
//                                 className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
//                             >
//                                 <PlusCircle size={20} />
//                                 Create Project
//                             </button>
//                             <button
//                                 onClick={() => setShowJoinForm(!showJoinForm)}
//                                 className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
//                             >
//                                 <LogIn size={20} />
//                                 Join Project
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Create project form */}
//                 {showCreateForm && (
//                     <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//                         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
//                             <div className="flex justify-between items-center">
//                                 <h3 className="text-xl font-semibold text-white">Create New Project</h3>
//                                 <button 
//                                     onClick={() => setShowCreateForm(false)}
//                                     className="text-white hover:text-gray-200 transition-colors"
//                                 >
//                                     <X size={24} />
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="p-6">
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Project Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
//                                         value={name}
//                                         onChange={(e) => setName(e.target.value)}
//                                         placeholder="Enter project name..."
//                                     />
//                                     {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name[0]}</p>}
//                                 </div>
//                                 <button 
//                                     onClick={handleCreate}
//                                     className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
//                                 >
//                                     Create Project
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Join project form */}
//                 {showJoinForm && (
//                     <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//                         <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
//                             <div className="flex justify-between items-center">
//                                 <h3 className="text-xl font-semibold text-white">Join Existing Project</h3>
//                                 <button 
//                                     onClick={() => setShowJoinForm(false)}
//                                     className="text-white hover:text-gray-200 transition-colors"
//                                 >
//                                     <X size={24} />
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="p-6">
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Invite Code
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
//                                         value={inviteCode}
//                                         onChange={(e) => setInviteCode(e.target.value)}
//                                         placeholder="Enter invite code..."
//                                     />
//                                     {errors.invite_code && <p className="text-red-500 text-sm mt-2">{errors.invite_code[0]}</p>}
//                                 </div>
//                                 <button 
//                                     onClick={handleJoin}
//                                     className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold"
//                                 >
//                                     Join Project
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Projects List */}
//                 {loading ? (
//                     <div className="flex justify-center items-center py-20">
//                         <div className="relative">
//                             <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <Code className="w-6 h-6 text-blue-600 animate-pulse" />
//                             </div>
//                         </div>
//                     </div>
//                 ) : projects.length === 0 ? (
//                     <div className="text-center py-20">
//                         <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
//                             <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                             <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
//                             <p className="text-gray-500">Create your first project or join an existing one to get started!</p>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {projects.map((p) => (
//                             <div
//                                 key={p.id}
//                                 className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden transform hover:scale-105"
//                                 onClick={() => navigate(`/projects/${p.id}`)}
//                             >
//                                 <div className="p-6">
//                                     <div className="flex items-start justify-between mb-4">
//                                         <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
//                                             <Code className="w-6 h-6 text-blue-600" />
//                                         </div>
//                                         <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                                             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                                         </div>
//                                     </div>
                                    
//                                     <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                                         {p.name}
//                                     </h2>

//                                     <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//   {p.name}
// </h2>

// {/* Show Edit / Delete if current user is owner */}
// {p.owner_id === authUser?.id && (
//   <div className="flex gap-2 mt-3">
//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         handleUpdate(p);
//       }}
//       className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
//     >
//       Edit
//     </button>

//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         handleDelete(p);
//       }}
//       className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
//     >
//       Delete
//     </button>
//   </div>
// )}

                                    
//                                     <div className="space-y-3">
//                                         <div className="flex items-center justify-between">
//                                             <span className="text-sm font-medium text-gray-500">Invite Code</span>
//                                             <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-mono text-sm">
//                                                 {p.invite_code}
//                                             </span>
//                                         </div>
                                        
//                                         <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//                                             <div className="flex items-center gap-2">
//                                                 <Users size={18} className="text-gray-400" />
//                                                 <span className="text-sm text-gray-600">
//                                                     {p.members?.length || 1} Member{(p.members?.length || 1) !== 1 ? 's' : ''}
//                                                 </span>
//                                             </div>
//                                             <div className="flex -space-x-2">
//                                                 {Array.from({ length: Math.min(3, p.members?.length || 1) }).map((_, i) => (
//                                                     <div
//                                                         key={i}
//                                                         className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center"
//                                                     >
//                                                         <span className="text-white text-xs font-semibold">
//                                                             {String.fromCharCode(65 + i)}
//                                                         </span>
//                                                     </div>
//                                                 ))}
//                                                 {(p.members?.length || 1) > 3 && (
//                                                     <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
//                                                         <span className="text-gray-600 text-xs font-semibold">
//                                                             +{(p.members?.length || 1) - 3}
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
                                
//                                 <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-200">
//                                     <div className="flex items-center justify-between">
//                                         <span className="text-sm text-gray-500">Click to open</span>
//                                         <div className="transform group-hover:translate-x-1 transition-transform duration-200">
//                                             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProjectsPage;
