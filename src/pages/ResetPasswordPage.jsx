import React, { useState } from "react";
import { Lock, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
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
      await axios.post("http://127.0.0.1:8000/api/reset-password", {
        email,
        otp_code: otp,
        password,
        password_confirmation: confirmPassword,
      });
      toast.success("Password reset successfully. Please login.");
      navigate("/login");
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP */}
            <div className="form-control">
              <label className="label">OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 ${errors.otp && "input-error"}`}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 ${errors.password && "input-error"}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-5 text-base-content/40" /> : <Eye className="size-5 text-base-content/40" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 ${errors.confirmPassword && "input-error"}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="size-5 text-base-content/40" /> : <Eye className="size-5 text-base-content/40" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* API Error */}
            {errors.api && <p className="text-red-500 text-sm text-center">{errors.api}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><Loader2 className="size-5 animate-spin" /> Resetting...</> : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share Projects, and stay in touch with each other."
      />
    </div>
  );
};

export default ResetPasswordPage;
