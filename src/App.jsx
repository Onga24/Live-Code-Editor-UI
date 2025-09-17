import './App.css'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProjectsPage from './pages/ProjectsPage'
import ProfilePage from './pages/ProfilePage'
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import VerifyOtpPage from './pages/VerifyOtpPage'
import { Toaster } from "react-hot-toast";
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NotAuthorized from "./pages/NotAuthorized";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsersPage from './pages/Admin/AdminUsersPage'
import AdminProjectsPage from './pages/Admin/AdminProjectsPage'
import AdminLayout from './pages/Admin/AdminLayout';

import CodeEditor from './pages/CodeEditor';
import Chat from './pages/Chat'




function App() {
  const { authUser } = useContext(AuthContext);
  return (
    <>

      <div>
        <Navbar />
        <main className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-8 flex flex-col">

          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route
              path="/projects/:id/chat"
              element={
                <ProtectedRoute>
                  <Chat user={authUser} />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/code-editor" element={<ProtectedRoute><CodeEditor /></ProtectedRoute>} />

            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />

            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
            <Route path="/otp" element={<GuestRoute><VerifyOtpPage /></GuestRoute>} />

          </Routes>
    
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
      </Route>
            {/* Not Authorized Page */}
            <Route path="/not-authorized" element={<NotAuthorized />} />

        </Routes>
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

    </>
  )
}

export default App
