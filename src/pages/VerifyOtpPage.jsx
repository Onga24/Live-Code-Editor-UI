import React, { useState, useEffect } from "react";
import { Loader2, KeyRound, MessageSquare, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AuthImagePattern from "../components/AuthImagePattern";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/verify-otp", {
        email,
        otp_code: otp,
      });
      console.log("✅ OTP Verified:", res.data);
      toast.success("Account verified successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/api/resend-otp", { email });
      toast.success(res.data.message || "OTP resent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
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
              <h1 className="text-2xl font-bold mt-2">Verify OTP</h1>
              <p className="text-base-content/60">Enter the code sent to your email</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-base-content/70">
                <Mail className="size-4" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">OTP Code</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-base-content/40" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Enter code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline w-full mt-2"
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend OTP
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

export default VerifyOtpPage;
