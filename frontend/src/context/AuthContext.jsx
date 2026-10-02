import { createContext, useContext, useEffect, useState } from "react"
import api, { refreshSession } from "@/api/axios"

const AUTH_STORAGE_KEY = "fitcoach_user"
const AuthContext = createContext(null)

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const storedUser = readStoredUser()

      if (!storedUser) {
        if (isMounted) setIsRestoring(false)
        return
      }

      try {
        await refreshSession()
        if (isMounted) setUser(storedUser)
      } catch (error) {
        // Only drop the stored session when the server rejected it.
        // Transient failures (e.g. backend restarting) must not log the user out.
        if (error.response?.status === 401) {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          if (isMounted) setUser(null)
        }
      } finally {
        if (isMounted) setIsRestoring(false)
      }
    }

    restoreSession()
    return () => {
      isMounted = false
    }
  }, [])

  const setAuthenticatedUser = (userData) => {
    setUser(userData)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await api.post("/users/logout")
    } catch {
      // The local session must still be cleared when the API is unavailable.
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isRestoring, setAuthenticatedUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
