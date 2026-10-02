import { useNavigate } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import CreateWorkoutScreen from "./screens/CreateWorkoutScreen";
import LogSessionScreen from "./screens/LogSessionScreen";
import { useAuth } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const { user, setAuthenticatedUser, logout } = useAuth();

  const handleAuthSuccess = (userData) => {
    setAuthenticatedUser(userData);
    navigate(userData?.role === "client" ? "/dashboard" : "/home");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] font-sans selection:bg-orange-500/40 selection:text-white">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <HomeScreen
              onOpenSignup={() => navigate("/register")}
              onOpenLogin={() => navigate("/login")}
              user={user}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            user?.role === "client" ? (
              <DashboardScreen user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            user?.role === "client" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginScreen
                onNavigateSignup={() => navigate("/register")}
                onNavigateHome={() => navigate("/home")}
                onLoginSuccess={handleAuthSuccess}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            user?.role === "client" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignupScreen
                onNavigateLogin={() => navigate("/login")}
                onNavigateHome={() => navigate("/home")}
                onSignupSuccess={handleAuthSuccess}
              />
            )
          }
        />
        <Route
          path="/create-workout"
          element={
            user ? (
              <CreateWorkoutScreen />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/log-session/:workoutId?"
          element={
            user ? <LogSessionScreen /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;
