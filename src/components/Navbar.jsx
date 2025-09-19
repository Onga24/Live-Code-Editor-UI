// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";
// import { LogOut, User, Settings } from "lucide-react";
// import toast from "react-hot-toast";
// import { FolderKanban } from "lucide-react";

// const Navbar = () => {
//   const { authUser, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       await logout();
//       toast.success("Logout successful ✅");
//       navigate("/login");
//     } catch (err) {
//       toast.error("Logout failed ❌");
//       console.error("Logout failed:", err);
//     }
//   };

//   return (
//     <header className="bg-white/80 backdrop-blur-md shadow-md fixed w-full top-0 z-50">
//       <div className="container mx-auto px-6 h-16 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="font-extrabold text-xl text-primary">
//           Collab App
//         </Link>

//         {/* Links */}
//         {authUser ? (
//           <div className="flex items-center gap-4">
//             <Link to="/profile" className="flex items-center gap-1 text-gray-700 hover:text-primary transition">
//               <User className="w-4 h-4" /> Profile
//             </Link>
//             <Link to="/projects" className="flex items-center gap-1 text-gray-700 hover:text-primary transition">
//               <FolderKanban className="w-4 h-4" /> Projects
//             </Link>
//             <Link to="/settings" className="flex items-center gap-1 text-gray-700 hover:text-primary transition">
//               <Settings className="w-4 h-4" /> Settings
//             </Link>
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
//             >
//               <LogOut className="w-4 h-4" /> Logout
//             </button>

//           </div>
//         ) : (
//           <div className="flex items-center gap-3">
//             <Link
//               to="/login"
//               className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition"
//             >
//               Login
//             </Link>
//             <Link
//               to="/signup"
//               className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
//             >
//               Sign Up
//             </Link>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Navbar;




import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Settings, FolderKanban, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { authUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout successful ✅");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed ❌");
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="font-extrabold text-xl text-primary">
          Collab App
        </Link>

        {/* Links */}
        {authUser ? (
          <div className="flex items-center gap-4">
            {authUser.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-gray-700 hover:text-primary transition"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            )}

            <Link
              to="/profile"
              className="flex items-center gap-1 text-gray-700 hover:text-primary transition"
            >
              <User className="w-4 h-4" /> Profile
            </Link>

            <Link
              to="/projects"
              className="flex items-center gap-1 text-gray-700 hover:text-primary transition"
            >
              <FolderKanban className="w-4 h-4" /> Projects
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-1 text-gray-700 hover:text-primary transition"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
