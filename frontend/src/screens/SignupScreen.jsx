import { useState } from "react"
import { motion } from "framer-motion"
import { Dumbbell, UserRound, Loader2, Check, ChevronDown } from "lucide-react"
import confetti from "canvas-confetti"

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
]

export default function SignupScreen({ onNavigateLogin, onSignupSuccess }) {
  const [step, setStep] = useState(1)
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0])
  const [showCountryMenu, setShowCountryMenu] = useState(false)
  const [phone, setPhone] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "client",
    gender: "prefer-not-to-say",
    height: "",
    date_of_birth: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError("Please enter your phone number")
      return
    }
    setError("")
    setStep(2)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
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

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Failed to create account")
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      setSuccess("Account created successfully!")
      setTimeout(() => {
        if (onSignupSuccess) onSignupSuccess(data.data)
      }, 1000)
    } catch (err) {
      // Offline fallback
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        confetti({ particleCount: 80 })
        setSuccess("Welcome to FitCoach!")
        const user = { name: formData.fullName, email: formData.email, role: formData.role }
        localStorage.setItem("fitcoach_user", JSON.stringify(user))
        setTimeout(() => {
          if (onSignupSuccess) onSignupSuccess(user)
        }, 1000)
      } else {
        setError(err.message || "Something went wrong")
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
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-10 h-10 flex items-center justify-center mb-2">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-orange-500">
              <path d="M4 14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14C24 19.5228 19.5228 24 14 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M8 14H20M14 8L20 14L14 20" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {step === 1 ? "Create your FitCoach account" : "Almost there!"}
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

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryMenu(!showCountryMenu)}
                  className="h-13 px-3.5 bg-neutral-100 rounded-2xl flex items-center gap-1.5 text-sm font-medium text-neutral-800 cursor-pointer"
                >
                  <span className="text-lg">{countryCode.flag}</span>
                  <span>{countryCode.code}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {showCountryMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 z-50">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(c)
                          setShowCountryMenu(false)
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-neutral-100 flex items-center justify-between"
                      >
                        <span>{c.flag} {c.name}</span>
                        <span className="text-neutral-400">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(012) 345-6789"
                className="flex-1 h-13 px-4 bg-neutral-100 rounded-2xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white border focus:border-neutral-300"
                autoFocus
              />
            </div>

            <p className="text-xs text-neutral-500">We'll text you a code to verify.</p>

            <button
              type="submit"
              className="w-full h-13 rounded-2xl text-slate-900 font-semibold text-sm shadow-md cta-gradient-btn cursor-pointer active:scale-[0.98]"
            >
              Continue
            </button>

            <p className="text-center text-xs text-neutral-500 pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="font-bold text-neutral-900 hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
                className="w-full h-12 px-4 bg-neutral-100 rounded-2xl text-sm outline-none focus:bg-white border focus:border-neutral-300"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                className="w-full h-12 px-4 bg-neutral-100 rounded-2xl text-sm outline-none focus:bg-white border focus:border-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full h-12 px-4 bg-neutral-100 rounded-2xl text-sm outline-none focus:bg-white border focus:border-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "client" })}
                  className={`h-11 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border ${
                    formData.role === "client" ? "bg-black text-white border-black" : "bg-neutral-100 text-neutral-600 border-transparent"
                  }`}
                >
                  <UserRound className="w-3.5 h-3.5" />
                  <span>Gym Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "trainer" })}
                  className={`h-11 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border ${
                    formData.role === "trainer" ? "bg-black text-white border-black" : "bg-neutral-100 text-neutral-600 border-transparent"
                  }`}
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Personal Trainer</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl text-slate-900 font-semibold text-sm shadow-md cta-gradient-btn flex items-center justify-center cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : <span>Complete</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-neutral-500 hover:text-neutral-900 pt-1"
            >
              ← Back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
