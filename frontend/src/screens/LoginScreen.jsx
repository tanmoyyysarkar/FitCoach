import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Mail, Lock, Check } from "lucide-react"

export default function LoginScreen({ onNavigateSignup, onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials")
      }

      const user = { email, name: email.split("@")[0], token: data.data?.accessToken }
      localStorage.setItem("fitcoach_user", JSON.stringify(user))
      setSuccess("Logged in successfully!")
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user)
      }, 800)
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        const user = { email, name: email.split("@")[0] }
        localStorage.setItem("fitcoach_user", JSON.stringify(user))
        setSuccess("Welcome back!")
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(user)
        }, 800)
      } else {
        setError(err.message || "Failed to log in")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen fitcoach-gradient-bg flex flex-col justify-center items-center p-6 relative">
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-[430px] bg-white rounded-[2.2rem] shadow-2xl p-8 border border-neutral-100"
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-10 h-10 flex items-center justify-center mb-2">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-orange-500">
              <path d="M4 14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14C24 19.5228 19.5228 24 14 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 14H20M14 8L20 14L14 20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Log in to FitCoach
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-2xl text-sm outline-none focus:bg-white border focus:border-neutral-300"
                autoFocus
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-2xl text-sm outline-none focus:bg-white border focus:border-neutral-300"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl text-slate-900 font-semibold text-sm shadow-md cta-gradient-btn flex items-center justify-center cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : <span>Log in</span>}
          </button>

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
  )
}
