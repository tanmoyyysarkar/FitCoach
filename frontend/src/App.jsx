import { useNavigate, useParams, Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { useAuth } from "./context/AuthContext";

function LogSessionRedirect({ user }) {
  const { workoutId } = useParams();
  if (!user) return <Navigate to="/login" replace />;
  const target = workoutId
    ? `/dashboard?tab=log-session&workoutId=${workoutId}`
    : "/dashboard?tab=log-session";
  return <Navigate to={target} replace />;
}

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
    <div className="min-h-screen bg-black font-sans selection:bg-orange-500/40 selection:text-white">
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
              <Navigate to="/dashboard?tab=create-workout" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/log-session/:workoutId?"
          element={<LogSessionRedirect user={user} />}
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;
