



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

  // ✅ image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImg(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("profile_picture", file);
    const res = await updateProfile(formData);
    if (!res.success && res.errors) setErrors(res.errors);
  };

  // ✅ form submit
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
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          {/* profile header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profile_picture || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
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
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* update form */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Update Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* name */}
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border bg-base-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
              </div>

              {/* password */}
              <div>
                <label className="block text-sm mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg border bg-base-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isUpdatingProfile}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
              </div>

              {/* confirm password */}
              <div>
                <label className="block text-sm mb-1">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded-lg border bg-base-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdatingProfile}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;