import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { PlusCircle, Users, LogIn } from "lucide-react";

const ProjectsPage = () => {
    const { authUser, apiRequest } = useContext(AuthContext);
    const [ projects, setProjects ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ showCreateForm, setShowCreateForm ] = useState(false);
    const [ showJoinForm, setShowJoinForm ] = useState(false);

    const [ name, setName ] = useState("");
    const [ inviteCode, setInviteCode ] = useState("");
    const [ errors, setErrors ] = useState("");

    // fetch user projects
    const fetchProjects = async() => {
        setLoading(true);
        try{
            const res = await apiRequest('/projects', 'GET');
            if( res.success ) setProjects( res.projects || [] );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // create project
    const handleCreate = async(e) => {
        e.preventDefault();
        setErrors({})
        const res = await apiRequest('/projects', 'POST', { name });
        if ( res.success ) {
            setProjects([...projects, res.project]);
            setName("");
            setShowCreateForm(false);
        } else {
            setErrors(res.errors || {});
        }
    };

    // join project
    const handleJoin = async(e) => {
        e.preventDefault();
        setErrors({});
        const res = await apiRequest('/projects/join', 'POST', { 'invite_code': inviteCode });
        if ( res.success ) {
            setProjects([...projects, res.project]);
            setInviteCode("");
            setShowJoinForm(false);
        } else {
            setErrors(res.errors || {});
        }
    };
    return (
        <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto p-4">
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
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
};

export default ProjectsPage;