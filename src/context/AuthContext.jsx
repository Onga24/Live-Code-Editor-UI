// import { createContext, useState, useEffect } from "react";
// import axiosInstance from "../lib/axios";
// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authUser, setAuthUser] = useState(null);

//   const checkAuth = async () => {
//     try {
//       const res = await axiosInstance.get("/me"); 
//       setAuthUser(res.data.user);
//     } catch (err) {
//       setAuthUser(null);
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const login = async (email, password) => {
//     const res = await axiosInstance.post("/login", { email, password });
//     localStorage.setItem("token", res.data.token);
//     setAuthUser(res.data.data);
//   };

//   const logout = async () => {
//     await axiosInstance.post("/logout");
//     localStorage.removeItem("token");
//     setAuthUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ authUser, login, logout, checkAuth }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



import { createContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // ✅ Track loading state

  const checkAuth = async () => {
    setLoadingAuth(true);
    try {
      const res = await axiosInstance.get("/me"); 
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

  const login = async (email, password) => {
    const res = await axiosInstance.post("/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setAuthUser(res.data.data);
  };

  const logout = async () => {
    await axiosInstance.post("/logout");
    localStorage.removeItem("token");
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ authUser, login, logout, checkAuth, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

