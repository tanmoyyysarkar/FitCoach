import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { useAuth } from "./context/AuthContext";

function App() {
  const [currentScreen, setCurrentScreen] = useState("home"); // "home" | "login" | "signup" | "dashboard"
  const { user, isRestoring, setAuthenticatedUser, logout } = useAuth();

  const visibleScreen = isRestoring
    ? "home"
    : user?.role === "client" &&
        (currentScreen === "home" || currentScreen === "dashboard")
      ? "dashboard"
      : currentScreen;

  const handleAuthSuccess = (userData) => {
    setAuthenticatedUser(userData);
    setCurrentScreen(userData?.role === "client" ? "dashboard" : "home");
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen("home");
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] font-sans selection:bg-orange-500/40 selection:text-white">
      <AnimatePresence mode="wait">
        {visibleScreen === "home" && (
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
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {visibleScreen === "dashboard" && user?.role === "client" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <DashboardScreen user={user} onLogout={handleLogout} />
          </motion.div>
        )}

        {visibleScreen === "login" && (
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

        {visibleScreen === "signup" && (
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
  );
}

export default App;
