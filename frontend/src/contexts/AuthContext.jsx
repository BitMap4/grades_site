import { createContext, useContext, useState, useEffect } from 'react'
import { Toaster, toaster } from '@components/ui/toaster'

// Create and export context
export const AuthContext = createContext(null)

// Hook with named export
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider component with named export
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

    const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/has_login', {
        credentials: 'include'
      })
      if (response.status === 429) {
        // const retryAfter = response.headers.get('x-ratelimit-reset')
        // const retryAfterSeconds = Math.ceil(retryAfter)
        toaster.create({
          title: 'rate limit exceeded',
          // description: `too many auth checks. try again in ${retryAfterSeconds} seconds`,
          type: 'error',
          duration: 5000,
        })
        throw new Error('Rate limit exceeded')
      }
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = () => {
    window.location.href = 'http://localhost:8000/auth/login'
  }

  const logout = () => {
    window.location.href = 'http://localhost:8000/auth/logout'
  }

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      <Toaster />
      {children}
    </AuthContext.Provider>
  )
}