import { useState, useEffect } from 'react'
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom'
import { Package, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function StaffLoginPage() {
  const { signIn, user, isStaff, staffLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Enhanced redirect logic with proper staff status check
  useEffect(() => {
    if (user && !staffLoading && !loading) {
      const from = (location.state as any)?.from?.pathname || '/staff/dashboard'
      
      if (isStaff) {
        console.log('Staff authenticated, redirecting to dashboard...', { user: user.email, staffLoading, loading })
        navigate(from, { replace: true })
      } else {
        // User is authenticated but doesn't have staff access
        console.log('User authenticated but not staff, staying on login page...')
      }
    }
  }, [user, isStaff, staffLoading, loading, location.state, navigate])

  // If user is authenticated but not staff, show access denied message
  if (user && !staffLoading && !isStaff && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have staff access permissions. Please contact your administrator.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking staff status
  if (user && staffLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  // Redirect if already logged in as staff
  if (user && isStaff && !staffLoading) {
    const from = (location.state as any)?.from?.pathname || '/staff/dashboard'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    
    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        // Redirect will be handled by useEffect above
      } else {
        // Error is already shown by signIn function
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Staff Login</h2>
            <p className="mt-2 text-gray-600">
              Access the Chrisdan Enterprises staff dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your staff email"
                  disabled={loading}
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Staff Access</h3>
            <p className="text-xs text-blue-800">
              This portal is for authorized staff members only. Contact your administrator if you need access credentials.
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need help? Contact IT support</p>
            <p className="font-medium">718-738-1490</p>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center">
          <a 
            href="/" 
            className="text-blue-200 hover:text-white transition-colors text-sm"
          >
            ← Back to main website
          </a>
        </div>
      </div>
    </div>
  )
}
