import React, { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { Users, FolderKanban } from "lucide-react"; // icons

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, projects: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Error loading stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users Card */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white flex items-center justify-between hover:scale-105 transform transition-all duration-200">
          <div>
            <h2 className="text-lg font-medium">Users</h2>
            <p className="text-4xl font-bold mt-2">{stats.users}</p>
          </div>
          <Users className="w-12 h-12 opacity-80" />
        </div>

        {/* Projects Card */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg text-white flex items-center justify-between hover:scale-105 transform transition-all duration-200">
          <div>
            <h2 className="text-lg font-medium">Projects</h2>
            <p className="text-4xl font-bold mt-2">{stats.projects}</p>
          </div>
          <FolderKanban className="w-12 h-12 opacity-80" />
        </div>
      </div>
    </div>
  );
}
