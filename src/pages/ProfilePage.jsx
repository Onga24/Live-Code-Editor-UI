



// import { useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { Camera } from "lucide-react";

// const ProfilePage = () => {
//   const { authUser, isUpdatingProfile, updateProfile } = useContext(AuthContext);
//   const [selectedImg, setSelectedImg] = useState(null);
//   const [name, setName] = useState(authUser?.name || "");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errors, setErrors] = useState({});

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setSelectedImg(URL.createObjectURL(file));

//     const formData = new FormData();
//     formData.append("profile_picture", file);
//     const res = await updateProfile(formData);
//     if (!res.success && res.errors) setErrors(res.errors);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     const formData = new FormData();
//     if (name) formData.append("name", name);
//     if (password) {
//       formData.append("password", password);
//       formData.append("password_confirmation", confirmPassword);
//     }

//     const res = await updateProfile(formData);

//     if (!res.success && res.errors) {
//       setErrors(res.errors);
//     } else {
//       setPassword("");
//       setConfirmPassword("");
//     }
//   };

//   return (
//     <div className="h-screen pt-20">
//       <div className="max-w-2xl mx-auto p-4 py-8">
//         <div className="bg-base-300 rounded-xl p-6 space-y-8">
//       <div className="text-center">
//             <h1 className="text-2xl font-semibold">Profile</h1>
//             <p className="mt-2">Your profile information</p>
//           </div>

//           <div className="flex flex-col items-center gap-4">
//             <div className="relative">
//               <img
//                 src={selectedImg || authUser?.profile_picture || "/avatar.png"}
//                 alt="Profile"
//                 className="size-32 rounded-full object-cover border-4"
//               />
//               <label
//                 htmlFor="avatar-upload"
//                 className={`absolute bottom-0 right-0 bg-base-content hover:scale-105
//                   p-2 rounded-full cursor-pointer transition-all duration-200
//                   ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
//                 `}
//               >
//                 <Camera className="w-5 h-5 text-base-200" />
//                 <input
//                   type="file"
//                   id="avatar-upload"
//                   className="hidden"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   disabled={isUpdatingProfile}
//                 />
//               </label>
//             </div>
//             <p className="text-sm text-zinc-400">
//               {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
//             </p>
//           </div>

//           <div className="mt-6 bg-base-300 rounded-xl p-6">
//             <h2 className="text-lg font-medium mb-4">Update Profile</h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   className="w-full px-3 py-2 rounded-lg border bg-base-200"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   disabled={isUpdatingProfile}
//                 />
//                 {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
//               </div>

//               {/* password */}
//               <div>
//                 <label className="block text-sm mb-1">New Password</label>
//                 <input
//                   type="password"
//                   className="w-full px-3 py-2 rounded-lg border bg-base-200"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   disabled={isUpdatingProfile}
//                 />
//                 {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
//               </div>

//               {/* confirm password */}
//               <div>
//                 <label className="block text-sm mb-1">Confirm Password</label>
//                 <input
//                   type="password"
//                   className="w-full px-3 py-2 rounded-lg border bg-base-200"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   disabled={isUpdatingProfile}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
//                 disabled={isUpdatingProfile}
//               >
//                 {isUpdatingProfile ? "Updating..." : "Update Profile"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default ProfilePage;





import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Camera } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImg(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profile_picture", file);
    const res = await updateProfile(formData);
    if (!res.success && res.errors) setErrors(res.errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    if (name) formData.append("name", name);
    if (password) {
      formData.append("password", password);
      formData.append("password_confirmation", confirmPassword);
    }

    const res = await updateProfile(formData);

    if (!res.success && res.errors) {
      setErrors(res.errors);
    } else {
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="relative">
                    <img
                      src={selectedImg || authUser?.profile_picture || "/avatar.png"}
                      alt="Profile"
                      className="size-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20"></div>
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                      p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl
                      ${isUpdatingProfile ? "animate-pulse pointer-events-none opacity-50" : ""}
                    `}
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                
                <h1 className="mt-6 text-2xl font-bold text-gray-900">{authUser?.name || "Your Name"}</h1>
                <p className="mt-2 text-gray-500">
                  {isUpdatingProfile ? (
                    <span className="inline-flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      Uploading...
                    </span>
                  ) : (
                    "Click the camera to update your photo"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white">Update Profile</h2>
                <p className="text-blue-100 mt-1">Keep your information up to date</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 transition-all duration-200
                            focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none
                            ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
                            ${isUpdatingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isUpdatingProfile}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          {errors.name[0]}
                        </p>
                      )}
                    </div>

                    {/* Password Section */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        Change Password
                      </h3>
                      
                      {/* New Password */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all duration-200
                            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none
                            ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
                            ${isUpdatingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isUpdatingProfile}
                          placeholder="Enter new password"
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.password[0]}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-all duration-200
                            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none
                            ${password !== confirmPassword && confirmPassword ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'}
                            ${isUpdatingProfile ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isUpdatingProfile}
                          placeholder="Confirm new password"
                        />
                        {password !== confirmPassword && confirmPassword && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            Passwords don't match
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={isUpdatingProfile}
                      className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 transform
                        ${isUpdatingProfile 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] hover:shadow-lg'
                        }
                      `}
                    >
                      {isUpdatingProfile ? (
                        <span className="inline-flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </span>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;




