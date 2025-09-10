import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { authUser, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>;

  return authUser ? children : <Navigate to="/login" />;
};

export const GuestRoute = ({ children }) => {
  const { authUser, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>;

  return !authUser ? children : <Navigate to="/profile" />;
};
