import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'

interface PrivateRouteProps {
  children: React.ReactNode
  requireStaff?: boolean
  requireCustomer?: boolean
}

export default function PrivateRoute({ children, requireStaff = false, requireCustomer = false }: PrivateRouteProps) {
  const { user, loading, isStaff, isCustomer, staffLoading, customerLoading } = useAuth()
  const location = useLocation()
  
  const isStaffRoute = location.pathname.startsWith('/staff/')
  const isCustomerRoute = location.pathname.startsWith('/customer/')

  console.log('PrivateRoute state:', { 
    user: !!user, 
    loading, 
    isStaff, 
    isCustomer, 
    staffLoading, 
    customerLoading,
    isStaffRoute,
    isCustomerRoute,
    path: location.pathname
  })

  // Show loading during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If no user, redirect to appropriate login
  if (!user) {
    if (isCustomerRoute) {
      return <Navigate to="/customer/login" replace />
    }
    return <Navigate to="/staff/login" replace />
  }

  // Show loading while checking user type
  if (staffLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Handle staff routes
  if (isStaffRoute || requireStaff) {
    if (!isStaff) {
      return <Navigate to="/staff/login" replace />
    }
    return <>{children}</>
  }

  // Handle customer routes
  if (isCustomerRoute || requireCustomer) {
    if (!isCustomer) {
      return <Navigate to="/customer/login" replace />
    }
    return <>{children}</>
  }

  // Default: allow access if user is authenticated
  return <>{children}</>
}