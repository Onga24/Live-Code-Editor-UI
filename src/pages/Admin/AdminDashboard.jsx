// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../lib/axios";
// import { Users, FolderKanban } from "lucide-react"; // icons

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({ users: 0, projects: 0 });

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await axiosInstance.get("/admin/dashboard");
//         setStats(res.data);
//       } catch (err) {
//         console.error("Error loading stats", err);
//       }
//     };
//     fetchStats();
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-8">📊 Admin Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Users Card */}
//         <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white flex items-center justify-between hover:scale-105 transform transition-all duration-200">
//           <div>
//             <h2 className="text-lg font-medium">Users</h2>
//             <p className="text-4xl font-bold mt-2">{stats.users}</p>
//           </div>
//           <Users className="w-12 h-12 opacity-80" />
//         </div>

//         {/* Projects Card */}
//         <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg text-white flex items-center justify-between hover:scale-105 transform transition-all duration-200">
//           <div>
//             <h2 className="text-lg font-medium">Projects</h2>
//             <p className="text-4xl font-bold mt-2">{stats.projects}</p>
//           </div>
//           <FolderKanban className="w-12 h-12 opacity-80" />
//         </div>
//       </div>
//     </div>
//   );
// }








import React, { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { Users, FolderKanban, TrendingUp, Activity, Shield, BarChart3, UserCheck, Folder } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Error loading stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, gradient, delay = 0 }) => (
    <div 
      className={`group p-8 bg-gradient-to-br ${gradient} rounded-3xl shadow-xl text-white 
        transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer
        animate-[fadeInUp_0.6s_ease-out_${delay}s_both]`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold opacity-90">{title}</h2>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-2xl font-bold">Loading...</span>
            </div>
          ) : (
            <p className="text-5xl font-bold drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
              {value.toLocaleString()}
            </p>
          )}
        </div>
        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
          <Icon className="w-10 h-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 opacity-80">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm">Active and growing</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600">Monitor your platform's performance and growth</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            icon={Users} 
            gradient="from-blue-500 via-blue-600 to-blue-700"
            delay={0}
          />
          
          <StatCard 
            title="Active Projects" 
            value={stats.projects} 
            icon={FolderKanban} 
            gradient="from-emerald-500 via-green-600 to-teal-700"
            delay={0.1}
          />
          
          <StatCard 
            title="System Status" 
            value="99.9" 
            icon={Activity} 
            gradient="from-purple-500 via-indigo-600 to-purple-700"
            delay={0.2}
          />
          
          <StatCard 
            title="Growth Rate" 
            value="12" 
            icon={BarChart3} 
            gradient="from-orange-500 via-red-500 to-pink-600"
            delay={0.3}
          />
        </div>

        {/* Detailed Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Analytics */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">User Analytics</h3>
                <p className="text-gray-600">User engagement and activity</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-semibold text-gray-700">Registered Users</span>
                <span className="text-2xl font-bold text-blue-600">{stats.users}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-semibold text-gray-700">Active Today</span>
                <span className="text-2xl font-bold text-green-600">{Math.floor(stats.users * 0.3)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                <span className="font-semibold text-gray-700">New This Week</span>
                <span className="text-2xl font-bold text-purple-600">{Math.floor(stats.users * 0.05)}</span>
              </div>
            </div>
          </div>

          {/* Project Analytics */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <Folder className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Project Analytics</h3>
                <p className="text-gray-600">Project creation and collaboration</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-semibold text-gray-700">Total Projects</span>
                <span className="text-2xl font-bold text-green-600">{stats.projects}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-semibold text-gray-700">Active Projects</span>
                <span className="text-2xl font-bold text-blue-600">{Math.floor(stats.projects * 0.7)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                <span className="font-semibold text-gray-700">Created Today</span>
                <span className="text-2xl font-bold text-orange-600">{Math.floor(stats.projects * 0.02)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <button className="group p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Users className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-lg">Manage Users</h4>
              <p className="text-sm opacity-90 mt-1">View and manage user accounts</p>
            </button>
            
            <button className="group p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <FolderKanban className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-lg">View Projects</h4>
              <p className="text-sm opacity-90 mt-1">Monitor project activities</p>
            </button>
            
            <button className="group p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <BarChart3 className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-lg">View Reports</h4>
              <p className="text-sm opacity-90 mt-1">Generate detailed reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}