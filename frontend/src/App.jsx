import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HomeScreen from "./screens/HomeScreen"
import LoginScreen from "./screens/LoginScreen"
import SignupScreen from "./screens/SignupScreen"

function App() {
  const [currentScreen, setCurrentScreen] = useState("home") // "home" | "login" | "signup"
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("fitcoach_user")
      return savedUser ? JSON.parse(savedUser) : null
    } catch (e) {
      console.error(e)
      return null
    }
  })

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setCurrentScreen("home")
  }

  const navigateTo = (screen) => {
    setCurrentScreen(screen)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] font-sans selection:bg-orange-500/40 selection:text-white">
      <AnimatePresence mode="wait">
        {currentScreen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomeScreen
              onOpenSignup={() => navigateTo("signup")}
              onOpenLogin={() => navigateTo("login")}
              user={user}
            />
          </motion.div>
        )}

        {currentScreen === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <LoginScreen
              onNavigateSignup={() => navigateTo("signup")}
              onNavigateHome={() => navigateTo("home")}
              onLoginSuccess={handleAuthSuccess}
            />
          </motion.div>
        )}

        {currentScreen === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <SignupScreen
              onNavigateLogin={() => navigateTo("login")}
              onNavigateHome={() => navigateTo("home")}
              onSignupSuccess={handleAuthSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
