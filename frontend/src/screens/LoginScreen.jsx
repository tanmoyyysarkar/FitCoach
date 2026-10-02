import { useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "@/api/axios";

export default function LoginScreen({
  onNavigateSignup,
  onLoginSuccess,
  onNavigateHome,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/users/login",
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          withCredentials: true,
        },
      );

      const data = res.data;
      const user = data.data?.user;
      if (!user?.user_id || !user?.role) {
        throw new Error("The server returned an incomplete user profile");
      }

      setSuccess("Logged in successfully!");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen fitcoach-gradient-bg flex flex-col justify-center items-center p-4 sm:p-6 relative select-none">
      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      {/* Top Bar / Back to Home */}
      <div className="w-full max-w-110 mb-4 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-110 bg-white rounded-[2rem] shadow-2xl p-7 sm:p-8 border border-neutral-100 overflow-hidden"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div
            onClick={onNavigateHome}
            className="w-11 h-11 flex items-center justify-center mb-2.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-orange-500"
            >
              <path
                d="M4 14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14C24 19.5228 19.5228 24 14 24"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M8 14H20M14 8L20 14L14 20"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight text-center">
            Welcome back
          </h1>
          <p className="text-xs text-neutral-500 mt-1 text-center">
            Log in to continue with your FitCoach account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-200 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all text-neutral-900 placeholder:text-neutral-400"
                autoFocus
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 pl-10 pr-10 bg-neutral-100 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all text-neutral-900 placeholder:text-neutral-400"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm cta-gradient-btn flex items-center justify-center cursor-pointer shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span>Log in</span>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-neutral-500 pt-2">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onNavigateSignup}
              className="font-bold text-neutral-900 hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
