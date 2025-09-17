import React, { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function AdminLayout() {
  const { authUser, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-base-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xl font-bold">Admin</Link>
            <nav className="hidden md:flex gap-2">
              <Link to="/admin" className="px-3 py-1 rounded hover:bg-base-200">Dashboard</Link>
              <Link to="/admin/users" className="px-3 py-1 rounded hover:bg-base-200">Users</Link>
              <Link to="/admin/projects" className="px-3 py-1 rounded hover:bg-base-200">Projects</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">Signed as <strong>{authUser?.name}</strong></div>
            <button onClick={logout} className="btn btn-sm btn-ghost">Logout</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white rounded shadow p-4">
          <ul className="space-y-2">
            <li><Link to="/admin" className="block py-2 px-3 rounded hover:bg-base-200">Overview</Link></li>
            <li><Link to="/admin/users" className="block py-2 px-3 rounded hover:bg-base-200">Users</Link></li>
            <li><Link to="/admin/projects" className="block py-2 px-3 rounded hover:bg-base-200">Projects</Link></li>
          </ul>
        </aside>

        <main className="md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
