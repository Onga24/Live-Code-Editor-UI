import { createContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  //  check auth user
  // apiRequest function
  const apiRequest = async (url, method = "GET", data = null) => {
    try {
      const res = await axiosInstance({ url, method, data });
      return res.data;
    } catch (err) {
      return err.response?.data || { success: false };
    }
  };

  // ✅ check auth user
  const checkAuth = async () => {
    setLoadingAuth(true);
    try {
      const res = await axiosInstance.get("/my-profile");
      setAuthUser(res.data.user);
    } catch (err) {
      setAuthUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

// login
const login = async (email, password) => {
  const res = await axiosInstance.post("/login", { email, password });
  localStorage.setItem("token", res.data.token);

  const profileRes = await axiosInstance.get("/my-profile");
  setAuthUser(profileRes.data.user);
};

  // logout
  const logout = async () => {
    await axiosInstance.post("/logout");
    localStorage.removeItem("token");
    setAuthUser(null);
  };

  //  update profile
  const updateProfile = async (formData) => {
    setIsUpdatingProfile(true);
    try {
      const res = await axiosInstance.post("/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === 200) {
        toast.success(res.data.message || "Profile updated!");
        setAuthUser((prev) => ({
          ...prev,
          ...res.data.user,
        }));
        return { success: true };
      } else {
        return { success: false, errors: res.data.errors };
      }
    } catch (err) {
      if (err.response?.status === 400) {
        return { success: false, errors: err.response.data.errors };
      }
      toast.error("Failed to update profile");
      return { success: false };
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        login,
        logout,
        checkAuth,
        loadingAuth,
        isUpdatingProfile,
        updateProfile,
        apiRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};




