import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PlusCircle, Users, LogIn, Pencil, Trash2 } from "lucide-react";

const ProjectsPage = () => {
  const { id } = useParams();
  const { apiRequest } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errors, setErrors] = useState({});

  // Edit project state
  const [editProject, setEditProject] = useState(null);
  const [editName, setEditName] = useState("");

  // fetch user projects
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

  // create project
  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});
    const res = await apiRequest("/projects", "POST", { name });
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
    const res = await apiRequest("/projects/join", "POST", { invite_code: inviteCode });
    if (res.success) {
      setProjects([...projects, res.project]);
      setInviteCode("");
      setShowJoinForm(false);
    } else {
      setErrors(res.errors || {});
    }
  };

  // delete project
  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    const res = await apiRequest(`/projects/${projectId}`, "DELETE");
    if (res.success) {
      setProjects(projects.filter((p) => p.id !== projectId));
    }
  };

  // open edit modal
  const startEdit = (project) => {
    setEditProject(project);
    setEditName(project.name);
  };

  // save edit
  const handleEdit = async (e) => {
    e.preventDefault();
    const res = await apiRequest(`/projects/${editProject.id}`, "PUT", { name: editName });
    if (res.success) {
      setProjects(
        projects.map((p) => (p.id === editProject.id ? { ...p, name: editName } : p))
      );
      setEditProject(null);
      setEditName("");
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} /> Create
            </button>
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <LogIn size={18} /> Join
            </button>
          </div>
        </div>

        {/* Create project form */}
        {showCreateForm && (
          <form onSubmit={handleCreate} className="mb-6 p-4 bg-base-300 rounded-lg space-y-3">
            <label className="block text-sm">Project Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border bg-base-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name[0]}</p>}
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Create
            </button>
          </form>
        )}

        {/* Join project form */}
        {showJoinForm && (
          <form onSubmit={handleJoin} className="mb-6 p-4 bg-base-300 rounded-lg space-y-3">
            <label className="block text-sm">Invite Code</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border bg-base-200"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            {errors.invite_code && <p className="text-red-500 text-sm">{errors.invite_code[0]}</p>}
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Join
            </button>
          </form>
        )}

        {/* project list */}
        {loading ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-zinc-500">You don't have any projects yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-base-300 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="text-sm text-zinc-400">Invite: {p.invite_code}</p>

                <div className="flex items-center gap-2 mt-2">
                  <Users size={18} className="text-zinc-500" />
                  <span className="text-sm">{p.members?.length || 1} Members</span>
                </div>

                {/* Members Avatars */}
                <div className="flex items-center mt-4">
                  <h3 className="text-sm font-semibold mr-2">Members:</h3>
                  <div className="flex -space-x-2 overflow-hidden">
                    {p.members &&
                      p.members.map((member) => (
                        <img
                          key={member.id}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                          src={member.profile_picture_url || "/default-avatar.png"}
                          title={member.name}
                        />
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <a
                    href={`/code-editor?project_id=${p.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => startEdit(p)}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Project</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditProject(null)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
