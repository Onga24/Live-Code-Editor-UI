import React, { useState } from "react";
import { Mail, Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email";
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
      await axios.post("http://127.0.0.1:8000/api/forgot-password", { email });
      toast.success("OTP sent to your email. Check inbox.");
      navigate("/reset-password", { state: { email } });
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
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Forgot Password</h1>
              <p className="text-base-content/60">
                Enter your email to receive OTP for password reset
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 ${errors.email && "input-error"}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {errors.api && <p className="text-red-500 text-sm text-center">{errors.api}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><Loader2 className="size-5 animate-spin" /> Sending...</> : "Send OTP"}
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

export default ForgotPasswordPage;
