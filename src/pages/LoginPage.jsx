
// import React, { useState, useContext } from "react";
// import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { AuthContext } from "../context/AuthContext"; 
// import AuthImagePattern from "../components/AuthImagePattern";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const { login, authUser } = useContext(AuthContext); 
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [errors, setErrors] = useState({});

//   const validateForm = () => {
//     let newErrors = {};
//     if (!formData.email) newErrors.email = "Email is required";
//     else if (!formData.email.includes("@")) newErrors.email = "Enter a valid email";
//     if (!formData.password) newErrors.password = "Password is required";
//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validateForm();
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     setErrors({});
//     setLoading(true);

//     try {
//       // call login from context
//       await login(formData.email, formData.password);
//       toast.success("Login successful!");

//       if (authUser?.role === "admin") {
//         navigate("/admin");
//       } else {
//         navigate("/profile");
//       }
//     } catch (err) {
//       console.error("❌ Login Error:", err.response?.data);
//       setErrors({ api: err.response?.data?.message || "Invalid credentials" });
//       toast.error(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen grid lg:grid-cols-2">
//       <div className="flex flex-col justify-center items-center p-6 sm:p-12">
//         <div className="w-full max-w-md space-y-8">
//           <div className="text-center mb-8">
//             <div className="flex flex-col items-center gap-2 group">
//               <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
//                 <MessageSquare className="size-6 text-primary" />
//               </div>
//               <h1 className="text-2xl font-bold mt-2">Sign In</h1>
//               <p className="text-base-content/60">Welcome back!</p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Email</span>
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 text-base-content/40" />
//                 <input
//                   type="email"
//                   className="input input-bordered w-full pl-10"
//                   placeholder="you@example.com"
//                   value={formData.email}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                 />
//               </div>
//               {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
//             </div>

//             {/* Password */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text font-medium">Password</span>
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 text-base-content/40" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="input input-bordered w-full pl-10"
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="size-5 text-base-content/40" />
//                   ) : (
//                     <Eye className="size-5 text-base-content/40" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-red-500 text-sm">{errors.password}</p>
//               )}
//             </div>

//             {/* API Error */}
//             {errors.api && (
//               <p className="text-red-500 text-sm text-center">{errors.api}</p>
//             )}

//             <button
//               type="submit"
//               className="btn btn-primary w-full"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="size-5 animate-spin" /> Loading...
//                 </>
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </form>

//           <div className="text-center">
//             <p className="text-base-content/60">
//               Don’t have an account?{" "}
//               <Link to="/signup" className="link link-primary">
//                 Sign up
//               </Link>
//             </p>
//             <p className="mt-2">
//               <Link to="/forgot-password" className="link link-primary">
//                 Forgot password?
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//       <AuthImagePattern
//         title="Join our community"
//         subtitle="Connect with friends, share Projects, and stay in touch with each other."
//       />
//     </div>
//   );
// };

// export default LoginPage;











import React, { useState, useContext } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; 
import AuthImagePattern from "../components/AuthImagePattern";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!formData.email.includes("@")) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // login بيرجع اليوزر
      const user = await login(formData.email, formData.password);
      toast.success("Login successful!");

      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data);
      setErrors({ api: err.response?.data?.message || "Invalid credentials" });
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Sign In</h1>
              <p className="text-base-content/60">Welcome back!</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* API Error */}
            {errors.api && (
              <p className="text-red-500 text-sm text-center">{errors.api}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don’t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
            <p className="mt-2">
              <Link to="/forgot-password" className="link link-primary">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share Projects, and stay in touch with each other."
      />
    </div>
  );
};

export default LoginPage;
