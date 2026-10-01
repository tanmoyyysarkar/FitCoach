import { useState, useRef } from "react"
import HeroSection from "./components/custom/HeroSection"
import ExploreSection from "./components/custom/ExploreSection"
import SignupOnboardingModal from "./components/custom/SignupOnboardingModal"

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState("signup") // "signup" | "login"
  const [user, setUser] = useState(() => {
    // Lazy init: read the persisted session once instead of in an effect
    try {
      const savedUser = localStorage.getItem("fitcoach_user")
      return savedUser ? JSON.parse(savedUser) : null
    } catch (e) {
      console.error(e)
      return null
    }
  })
  const exploreRef = useRef(null)

  const handleOpenSignup = () => {
    setAuthModalMode("signup")
    setIsAuthModalOpen(true)
  }

  const handleOpenLogin = () => {
    setAuthModalMode("login")
    setIsAuthModalOpen(true)
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setIsAuthModalOpen(false)
  }

  const handleScrollToExplore = () => {
    if (exploreRef.current) {
      exploreRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] font-sans selection:bg-orange-500/40 selection:text-white">
      {/* 1. Hero Section (Screenshot 1) */}
      <HeroSection 
        onOpenSignup={handleOpenSignup}
        onOpenLogin={handleOpenLogin}
        onExploreClick={handleScrollToExplore}
      />

      {/* 2. Explore Experiences Feed (Screenshot 4) */}
      <div ref={exploreRef}>
        <ExploreSection 
          onOpenSignup={handleOpenSignup}
          user={user}
        />
      </div>

      {/* 3. Onboarding & Sign Up / Login Modal Flow (Screenshot 2 & Screenshot 3) */}
      <SignupOnboardingModal
        key={isAuthModalOpen ? authModalMode : "closed"}
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
