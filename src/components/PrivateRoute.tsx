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
  
  // Show loading during ANY loading state to prevent premature decisions
  if (loading || staffLoading || customerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If no user, redirect to appropriate login
  if (!user) {
    if (requireCustomer) {
      return <Navigate to="/customer/login" replace state={{ from: location }} />
    }
    if (requireStaff) {
      return <Navigate to="/staff/login" replace state={{ from: location }} />
    }
    return <Navigate to="/customer/login" replace state={{ from: location }} />
  }

  // Handle staff routes - require staff authentication
  if (requireStaff && !isStaff) {
    return <Navigate to="/staff/login" replace state={{ from: location }} />
  }

  // Handle customer routes - require customer authentication
  if (requireCustomer && !isCustomer) {
    return <Navigate to="/customer/login" replace state={{ from: location }} />
  }

  // Default: allow access if user is authenticated
  return <>{children}</>
}
