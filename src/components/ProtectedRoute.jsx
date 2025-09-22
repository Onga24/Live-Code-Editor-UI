import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// export const ProtectedRoute = ({ children, role }) => {
//   const { authUser, loadingAuth } = useContext(AuthContext);

//   if (loadingAuth) return <div>Loading...</div>;

//   if (!authUser) {
//     return <Navigate to="/login" />;
//   }

//   if (role && authUser.role !== role) {
//     return <Navigate to="/not-authorized" />; 
//   }

//   return children;
// };

// export const GuestRoute = ({ children }) => {
//   const { authUser, loadingAuth } = useContext(AuthContext);

//   if (loadingAuth) return <div>Loading...</div>;

//   return !authUser ? children : <Navigate to="/profile" />;
// };




export const ProtectedRoute = ({ children, role }) => {
  const { authUser, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>;

  if (!authUser) {
    return <Navigate to="/" />;
  }

  if (role && authUser.role !== role) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
};

export const GuestRoute = ({ children }) => {
  const { authUser, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>;

  return !authUser ? children : <Navigate to="/" />;
};

