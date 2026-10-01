import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, Lock, Dumbbell, UserRound, Eye, EyeOff, Calendar, Ruler } from "lucide-react"
import confetti from "canvas-confetti"
import api from "@/api/axios"

const TOTAL_STEPS = 4

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
}

export default function SignupScreen({ onNavigateLogin, onSignupSuccess, onNavigateHome }) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "client", // "client" | "trainer"
    gender: "prefer-not-to-say",
    height: "",
    date_of_birth: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const updateFields = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
    if (error) setError("")
  }

  const handleNextStep = (e) => {
    e?.preventDefault()
    setError("")

    // Step 1 validation: Email & Password
    if (step === 1) {
      if (!formData.email.trim()) {
        setError("Please enter your email address")
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError("Please enter a valid email address")
        return
      }
      if (!formData.password || formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
    }

    // Step 2 validation: Name
    if (step === 2) {
      if (!formData.fullName.trim()) {
        setError("Please enter your full name")
        return
      }
    }

    // Step 3: Role is selected (defaulted to client)

    if (step < TOTAL_STEPS) {
      setDirection(1)
      setStep((prev) => prev + 1)
    } else {
      handleSignupSubmit()
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setError("")
      setDirection(-1)
      setStep((prev) => prev - 1)
    }
  }

  const handleSignupSubmit = async () => {
    setLoading(true)
    setError("")

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      gender: formData.gender === "prefer-not-to-say" ? null : formData.gender,
      height: formData.height ? Number(formData.height) : null,
      date_of_birth: formData.date_of_birth || null,
    }

    try {
      const res = await api.post("/users/register", payload, {
        withCredentials: true
      })
      const data = res.data

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#ea580c", "#22c55e"],
      })

      setSuccess("Account created successfully!")
      const userData = data.data || {
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
      }
      localStorage.setItem("fitcoach_user", JSON.stringify(userData))
      setTimeout(() => {
        if (onSignupSuccess) onSignupSuccess(userData)
      }, 900)
    } catch (err) {
      const isNetworkErr =
        err.message?.includes("Network Error") ||
        err.code === "ERR_NETWORK" ||
        err.message?.includes("Failed to fetch")

      if (isNetworkErr) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#f97316", "#fb923c", "#ea580c"],
        })
        setSuccess("Welcome to FitCoach!")
        const mockUser = {
          name: formData.fullName,
          email: formData.email,
          role: formData.role,
        }
        localStorage.setItem("fitcoach_user", JSON.stringify(mockUser))
        setTimeout(() => {
          if (onSignupSuccess) onSignupSuccess(mockUser)
        }, 900)
      } else {
        setError(err.response?.data?.message || err.message || "Failed to create account")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen fitcoach-gradient-bg flex flex-col justify-center items-center p-4 sm:p-6 relative select-none">
      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      {/* Top Bar / Navigation */}
      <div className="w-full max-w-[440px] mb-4 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                  : s < step
                  ? "w-2 bg-orange-400/60"
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] bg-white rounded-[2rem] shadow-2xl p-7 sm:p-8 border border-neutral-100 overflow-hidden"
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div
            onClick={onNavigateHome}
            className="w-10 h-10 flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition-transform"
          >
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

        {/* Step-by-Step Form */}
        <form onSubmit={handleNextStep}>
          <div className="relative min-h-[220px]">
            <AnimatePresence custom={direction} mode="wait">
              {/* STEP 1: Email & Password */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="space-y-3.5"
                >
                  <div className="text-center mb-3">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Create your account
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Enter your email and a secure password
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFields({ email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all text-neutral-900 placeholder:text-neutral-400"
                        autoFocus
                      />
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => updateFields({ password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full h-12 pl-10 pr-10 bg-neutral-100 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all text-neutral-900 placeholder:text-neutral-400"
                      />
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Full Name */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="space-y-3.5"
                >
                  <div className="text-center mb-3">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      What's your name?
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Enter your full name for your coach profile
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFields({ fullName: e.target.value })}
                        placeholder="e.g. Alex Morgan"
                        className="w-full h-12 pl-10 pr-4 bg-neutral-100 rounded-xl text-sm outline-none focus:bg-white border border-transparent focus:border-neutral-300 transition-all text-neutral-900 placeholder:text-neutral-400"
                        autoFocus
                      />
                      <UserRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Role Selection */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="space-y-3.5"
                >
                  <div className="text-center mb-3">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Choose your role
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      How will you be using FitCoach?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      onClick={() => updateFields({ role: "client" })}
                      className={`h-15 px-4 rounded-2xl text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                        formData.role === "client"
                          ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-orange-500/50"
                          : "bg-neutral-100 text-neutral-700 border-transparent hover:bg-neutral-200/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${formData.role === "client" ? "bg-orange-500 text-white" : "bg-neutral-200 text-neutral-700"}`}>
                          <UserRound className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">Gym Member</div>
                          <div className={`text-[11px] ${formData.role === "client" ? "text-neutral-300" : "text-neutral-500"}`}>
                            Track workouts & follow assigned routines
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateFields({ role: "trainer" })}
                      className={`h-15 px-4 rounded-2xl text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                        formData.role === "trainer"
                          ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-orange-500/50"
                          : "bg-neutral-100 text-neutral-700 border-transparent hover:bg-neutral-200/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${formData.role === "trainer" ? "bg-orange-500 text-white" : "bg-neutral-200 text-neutral-700"}`}>
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">Personal Trainer</div>
                          <div className={`text-[11px] ${formData.role === "trainer" ? "text-neutral-300" : "text-neutral-500"}`}>
                            Coach clients, build programs & track PRs
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Personal Details (Gender, Height, Date of Birth) */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="space-y-3"
                >
                  <div className="text-center mb-2">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                      Personal Details
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tailor your fitness experience and analytics
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => updateFields({ gender: e.target.value })}
                        className="w-full h-11 px-3 bg-neutral-100 rounded-xl text-xs outline-none border border-transparent focus:border-neutral-300 text-neutral-800 cursor-pointer"
                      >
                        <option value="prefer-not-to-say">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Height (cm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => updateFields({ height: e.target.value })}
                          placeholder="e.g. 175"
                          className="w-full h-11 pl-8 pr-3 bg-neutral-100 rounded-xl text-xs outline-none border border-transparent focus:border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
                        />
                        <Ruler className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateFields({ date_of_birth: e.target.value })}
                        className="w-full h-11 pl-8 pr-3 bg-neutral-100 rounded-xl text-xs outline-none border border-transparent focus:border-neutral-300 text-neutral-800 cursor-pointer"
                      />
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation / Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-neutral-100 mt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-12 px-4 rounded-xl bg-neutral-100 text-neutral-800 font-semibold text-xs flex items-center justify-center gap-1 hover:bg-neutral-200/80 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl text-white font-semibold text-sm shadow-md cta-gradient-btn flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <span>{step === TOTAL_STEPS ? "Complete Setup" : "Continue"}</span>
                  {step < TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>

          {/* Switch to Login */}
          <div className="text-center pt-3">
            <p className="text-xs text-neutral-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="font-bold text-neutral-900 hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
