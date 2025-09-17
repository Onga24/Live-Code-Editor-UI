import { createContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // helper generic request
  const apiRequest = async (url, method = "GET", data = null) => {
    try {
      const res = await axiosInstance({ url, method, data });
      return res.data;
    } catch (err) {
      return err.response?.data || { success: false };
    }
  };

  const checkAuth = async () => {
    setLoadingAuth(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthUser(null);
      setLoadingAuth(false);
      return;
    }

    try {
      const res = await axiosInstance.get("/my-profile"); 
      setAuthUser(res.data.user);
    } catch (err) {
      setAuthUser(null);
      localStorage.removeItem("token");
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

const login = async (email, password) => {
  try {
    const res = await axiosInstance.post("/login", { email, password });

    if (res?.data?.token) {
      localStorage.setItem("token", res.data.token);

      if (res.data.user) {
        setAuthUser(res.data.user);
        return res.data.user; 
      }

      await checkAuth();
      return authUser;
    }

    throw new Error("No token returned from server"); 
  } catch (err) {
    console.error("Login error:", err.response?.data);
    throw err; 
  }
};







  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (err) {
    } finally {
      localStorage.removeItem("token");
      setAuthUser(null);
    }
  };

  const updateProfile = async (formData) => {
    setIsUpdatingProfile(true);
    try {
      const res = await axiosInstance.post("/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === 200) {
        toast.success(res.data.message || "Profile updated!");
        // backend returns user object in res.data.user or res.data.user: { name, profile_picture }
        // to be safe, merge whatever returned
        if (res.data.user) {
          setAuthUser((prev) => ({ ...prev, ...res.data.user }));
        } else {
          await checkAuth();
        }
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

