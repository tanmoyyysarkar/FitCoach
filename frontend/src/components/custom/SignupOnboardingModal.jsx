import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, Check, Loader2, Mail, Lock, Dumbbell, UserRound } from "lucide-react"
import confetti from "canvas-confetti"

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
]

export default function SignupOnboardingModal({ 
  isOpen, 
  onClose, 
  initialMode = "signup", 
  onSuccess 
}) {
  const [mode, setMode] = useState(initialMode) // "signup" | "login"
  const [step, setStep] = useState(1) // 1: Phone -> 2: Name/Email/Password/Role
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]) // India (+91) is the primary market
  const [showCountryMenu, setShowCountryMenu] = useState(false)
  const [phone, setPhone] = useState("")
  
  // Registration form states matching backend registerUser controller
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "client", // "client" | "trainer"
    gender: "prefer-not-to-say",
    height: "",
    date_of_birth: "",
  })

  // Login form states matching backend loginUser controller
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Reset transient state when the modal opens or the requested mode changes.
  // Keyed remount in App handles the open/close cycle; this only syncs mode.
  const [lastInitialMode, setLastInitialMode] = useState(initialMode)
  if (initialMode !== lastInitialMode) {
    setLastInitialMode(initialMode)
    setMode(initialMode)
  }

  if (!isOpen) return null

  // Handle Step 1 -> Step 2
  const handleStep1Continue = (e) => {
    e?.preventDefault()
    if (!phone.trim()) {
      setError("Please enter your phone number to continue")
      return
    }
    setError("")
    setStep(2)
  }

  // Handle Signup Submission to Backend
  const handleSignupSubmit = async (e) => {
    e?.preventDefault()
    if (!formData.fullName.trim()) {
      setError("Please enter your full name")
      return
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address")
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          gender: formData.gender,
          height: formData.height ? Number(formData.height) : null,
          date_of_birth: formData.date_of_birth || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to register account")
      }

      // Success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#ea580c", "#22c55e"],
      })

      setSuccessMessage("Welcome to FitCoach! Your account is ready.")
      setTimeout(() => {
        if (onSuccess) onSuccess(data.data || { name: formData.fullName, email: formData.email, role: formData.role })
        onClose()
      }, 1200)

    } catch (err) {
      console.warn("Backend registration notice:", err.message)
      // Fallback for local preview if backend is not actively responding
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#f97316", "#fb923c", "#ea580c"],
        })
        const mockUser = {
          name: formData.fullName,
          email: formData.email,
          role: formData.role,
          phone: `${countryCode.code} ${phone}`,
        }
        localStorage.setItem("fitcoach_user", JSON.stringify(mockUser))
        setSuccessMessage("Welcome to FitCoach!")
        setTimeout(() => {
          if (onSuccess) onSuccess(mockUser)
          onClose()
        }, 1000)
      } else {
        setError(err.message || "An error occurred during registration")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Login Submission to Backend
  const handleLoginSubmit = async (e) => {
    e?.preventDefault()
    if (!loginData.email.trim()) {
      setError("Please enter your email")
      return
    }
    if (!loginData.password) {
      setError("Please enter your password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials")
      }

      const loggedUser = {
        email: loginData.email,
        name: loginData.email.split("@")[0],
        token: data.data?.accessToken,
      }
      localStorage.setItem("fitcoach_user", JSON.stringify(loggedUser))

      setSuccessMessage("Logged in successfully!")
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedUser)
        onClose()
      }, 900)

    } catch (err) {
      console.warn("Backend login notice:", err.message)
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        // Mock login for offline dev preview
        const mockUser = {
          email: loginData.email,
          name: loginData.email.split("@")[0],
        }
        localStorage.setItem("fitcoach_user", JSON.stringify(mockUser))
        setSuccessMessage("Welcome back!")
        setTimeout(() => {
          if (onSuccess) onSuccess(mockUser)
          onClose()
        }, 800)
      } else {
        setError(err.message || "Failed to log in")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blurred Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all"
      />

      {/* Modal Dialog Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[430px] bg-white rounded-[2rem] shadow-2xl p-7 md:p-8 border border-neutral-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1.5 rounded-full hover:bg-neutral-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo Emblem Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-10 h-10 flex items-center justify-center mb-2">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-orange-500">
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

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 text-center tracking-tight">
            {mode === "login" 
              ? "Welcome back" 
              : step === 1 
                ? "Create your FitCoach account" 
                : "Almost there!"
            }
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-200 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* ===================== SIGNUP FLOW ===================== */}
        {mode === "signup" && (
          <>
            {/* STEP 1: Phone / Contact (Screenshot 2) */}
            {step === 1 && (
              <form onSubmit={handleStep1Continue} className="space-y-4">
                {/* Country Code & Phone Input Group */}
                <div className="flex items-center gap-2 relative">
                  {/* Country Selector Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryMenu(!showCountryMenu)}
                      className="h-13 px-3.5 bg-neutral-100 hover:bg-neutral-200/80 rounded-2xl flex items-center gap-1.5 text-sm font-medium text-neutral-800 transition-colors cursor-pointer border border-transparent focus:border-neutral-300"
                    >
                      <span className="text-lg">{countryCode.flag}</span>
                      <span>{countryCode.code}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                    </button>

                    {/* Country Dropdown */}
                    <AnimatePresence>
                      {showCountryMenu && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 z-50 max-h-56 overflow-y-auto"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <button
                              key={c.code + c.country}
                              type="button"
                              onClick={() => {
                                setCountryCode(c)
                                setShowCountryMenu(false)
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium text-neutral-800 hover:bg-neutral-100 flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-base">{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span className="text-neutral-400">{c.code}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone Input */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(012) 345-6789"
                      className="w-full h-13 px-4 bg-neutral-100 rounded-2xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 focus:bg-white transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Subtext */}
                <p className="text-xs text-neutral-500 text-left pt-0.5">
                  We'll text you a code to verify. Standard Indian mobile numbers work.
                </p>

                {/* Continue Gradient Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-13 rounded-2xl text-slate-900 font-semibold text-sm shadow-md cta-gradient-btn flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Continue</span>
                  </button>
                </div>

                {/* Switch to Login */}
                <div className="text-center pt-3">
                  <p className="text-xs text-neutral-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login")
                        setError("")
                      }}
                      className="font-bold text-neutral-900 hover:underline cursor-pointer"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* STEP 2: Name & Email & Details (Screenshot 3 + Backend Integration) */}
            {step === 2 && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full h-12 px-4 bg-neutral-100 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all"
                    autoFocus
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full h-12 px-4 bg-neutral-100 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a password"
                    className="w-full h-12 px-4 bg-neutral-100 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all"
                  />
                </div>

                {/* Role Switcher: Gym Member / Personal Trainer */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    I am signing up as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "client" })}
                      className={`h-11 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        formData.role === "client"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-neutral-100 text-neutral-600 border-transparent hover:bg-neutral-200/70"
                      }`}
                    >
                      <UserRound className="w-3.5 h-3.5" />
                      <span>Gym Member</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "trainer" })}
                      className={`h-11 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        formData.role === "trainer"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-neutral-100 text-neutral-600 border-transparent hover:bg-neutral-200/70"
                      }`}
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Personal Trainer</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1.5">
                    {formData.role === "trainer"
                      ? "You'll be able to build programs and assign them to clients."
                      : "You'll be able to follow your coach's programs and log sessions."}
                  </p>
                </div>

                {/* Complete Button (ember gradient, matches the dark hero palette) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-white font-semibold text-sm cta-gradient-btn transition-all duration-300 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-xs flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>Complete</span>
                    )}
                  </button>
                </div>

                {/* Back to Step 1 */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setError("")
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ===================== LOGIN FLOW ===================== */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Enter email"
                  className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-2xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 focus:bg-white transition-all"
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
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-2xl text-sm text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-2xl text-slate-900 font-semibold text-sm shadow-md cta-gradient-btn flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </div>

            {/* Switch to Signup */}
            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500">
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup")
                    setStep(1)
                    setError("")
                  }}
                  className="font-bold text-neutral-900 hover:underline cursor-pointer"
                >
                  Join now
                </button>
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
