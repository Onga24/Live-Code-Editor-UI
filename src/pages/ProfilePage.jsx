import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PlusCircle, Users, LogIn, Pencil, Trash2, X } from "lucide-react";

const ProjectsPage = () => {
  const { apiRequest } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errors, setErrors] = useState({});

  const [editProject, setEditProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteProject, setDeleteProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/projects", "GET");
      if (res.success) setProjects(res.projects || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await apiRequest("/projects", "POST", { name });
    if (res.success) {
      setProjects([...projects, res.project]);
      setName("");
      setShowCreateForm(false);
    } else {
      setErrors(res.errors || {});
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const res = await apiRequest("/projects/join", "POST", { invite_code: inviteCode });
    if (res.success) {
      setProjects([...projects, res.project]);
      setInviteCode("");
      setShowJoinForm(false);
    } else {
      setErrors(res.errors || {});
    }
  };

  const confirmDelete = async () => {
    if (!deleteProject) return;
    const res = await apiRequest(`/projects/${deleteProject.id}`, "DELETE");
    if (res.success) {
      setProjects(projects.filter((p) => p.id !== deleteProject.id));
      setDeleteProject(null);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const res = await apiRequest(`/projects/${editProject.id}`, "PUT", { name: editName });
    if (res.success) {
      setProjects(projects.map((p) => (p.id === editProject.id ? { ...p, name: editName } : p)));
      setEditProject(null);
      setEditName("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-sky-400">My</span> Projects
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 transition shadow-md"
            >
              <PlusCircle size={18} /> Create
            </button>
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition shadow-md"
            >
              <LogIn size={18} /> Join
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-5 bg-gray-800/80 backdrop-blur rounded-xl space-y-3 border border-gray-700 shadow-lg"
          >
            <input
              type="text"
              placeholder="Project name"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-sky-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name[0]}</p>}
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:opacity-90 transition shadow"
            >
              Create
            </button>
          </form>
        )}

        {/* Join Form */}
        {showJoinForm && (
          <form
            onSubmit={handleJoin}
            className="mb-6 p-5 bg-gray-800/80 backdrop-blur rounded-xl space-y-3 border border-gray-700 shadow-lg"
          >
            <input
              type="text"
              placeholder="Invite code"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            {errors.invite_code && <p className="text-red-400 text-sm">{errors.invite_code[0]}</p>}
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:opacity-90 transition shadow"
            >
              Join
            </button>
          </form>
        )}

        {/* Projects List */}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400">No projects yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all p-6 flex flex-col"
              >
                <h2 className="text-2xl font-semibold text-sky-400 mb-1">{p.name}</h2>
                <p className="text-sm text-gray-400 mb-4">Invite: {p.invite_code}</p>

                <div className="flex items-center gap-2 text-gray-300 text-sm mb-6">
                  <Users size={18} />
                  <span>{p.members?.length || 1} Members</span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <a
                    href={`/code-editor?project_id=${p.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-lg hover:opacity-90 transition text-center"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => {
                      setEditProject(p);
                      setEditName(p.name);
                    }}
                    className="px-3 py-2 bg-yellow-500/90 hover:bg-yellow-600 rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteProject(p)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editProject && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-700 animate-scale">
              <h2 className="text-2xl font-bold text-sky-400 mb-4">Edit Project</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditProject(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:opacity-90 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteProject && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 animate-fade">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-700 text-center animate-scale">
              <Trash2 className="mx-auto text-red-500 mb-3" size={40} />
              <h2 className="text-2xl font-bold text-red-400">Delete Project?</h2>
              <p className="text-gray-300 mt-2">
                Are you sure you want to delete <span className="font-semibold">{deleteProject.name}</span>?
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setDeleteProject(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 rounded-lg hover:opacity-90 transition"
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
