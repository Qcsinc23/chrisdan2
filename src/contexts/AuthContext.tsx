import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
}

interface UserRoleContextType {
  isStaff: boolean
  isCustomer: boolean
  staffLoading: boolean
  customerLoading: boolean
  customerAccount: any
  updateCustomerAccount: (account: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Enhanced session refresh with error handling
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      setSession(newSession)
      setUser(newSession?.user ?? null)
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        setLoading(true)
        
        // Set a timeout to prevent infinite loading during initialization
        const timeoutId = setTimeout(() => {
          console.warn('Auth initialization timed out')
          if (mounted) {
            setLoading(false)
            setUser(null)
            setSession(null)
          }
        }, 15000) // 15 second timeout
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        clearTimeout(timeoutId)
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'TOKEN_REFRESHED') {
            // Session refreshed successfully
            console.log('Token refreshed successfully')
          }
        }
      }
    )

    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession && new Date(currentSession.expires_at * 1000) < new Date()) {
        await refreshSession()
      }
    }, 30000) // Check every 30 seconds

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [refreshSession])

  // Enhanced sign in with proper error handling
  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        let errorMessage = 'Failed to sign in'
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Invalid email or password'
            break
          case 'Email not confirmed':
            errorMessage = 'Please check your email to confirm your account'
            break
          case 'Too many requests':
            errorMessage = 'Too many login attempts. Please try again later'
            break
          default:
            errorMessage = error.message || 'Failed to sign in'
        }
        
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }

      if (data.user) {
        toast.success('Welcome back!')
        return { success: true }
      }

      return { success: false, error: 'Unknown error occurred' }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error)
      const errorMessage = 'An unexpected error occurred. Please try again.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Enhanced sign up with email verification handling
  const signUp = useCallback(async (email: string, password: string, metadata: any = {}): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            full_name: metadata.fullName || email.split('@')[0],
            phone: metadata.phone || ''
          },
          emailRedirectTo: `${window.location.origin}/customer/login?message=Account created successfully. Please check your email to verify your account.`
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        let errorMessage = 'Failed to create account'
        
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'An account with this email already exists'
            break
          case 'Password should be at least 6 characters':
            errorMessage = 'Password must be at least 6 characters'
            break
          default:
            errorMessage = error.message || 'Failed to create account'
        }
        
        toast.error(errorMessage)
        return { success: false, error: errorMessage }
      }

      if (data.user) {
        if (data.session) {
          // Email verification disabled - user is logged in
          // Automatically create customer account
          try {
            const { error: accountError } = await supabase.functions.invoke('manage-customer-account', {
              body: {
                action: 'create_account',
                accountData: {
                  fullName: metadata.fullName || metadata.full_name || data.user.email?.split('@')[0] || 'Customer',
                  phone: metadata.phone || '',
                  whatsappNotifications: true,
                  emailNotifications: true,
                  smsNotifications: false
                }
              }
            })

            if (accountError) {
              console.error('Error creating customer account:', accountError)
              toast.success('Account created! Please complete your profile in settings.')
            } else {
              console.log('Customer account created successfully')
              toast.success('Account created successfully!')
            }
          } catch (error) {
            console.error('Error creating customer account:', error)
            toast.success('Account created! Please complete your profile in settings.')
          }
        } else {
          // Email verification enabled - user needs to check email
          toast.success('Account created! Please check your email to verify your account')
        }
        return { success: true }
      }

      return { success: false, error: 'Unknown error occurred' }
    } catch (error: any) {
      console.error('Unexpected sign up error:', error)
      const errorMessage = 'An unexpected error occurred. Please try again.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Enhanced sign out with cleanup
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        toast.error(error.message || 'Failed to sign out')
        throw error
      }

      // Clear local state
      setUser(null)
      setSession(null)
      
      toast.success('Signed out successfully!')
    } catch (error) {
      console.error('Error during sign out:', error)
      throw error
    }
  }, [])

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      <UserRoleProvider user={user}>
        {children}
      </UserRoleProvider>
    </AuthContext.Provider>
  )
}

function UserRoleProvider({ children, user }: { children: React.ReactNode; user: User | null }) {
  const [isStaff, setIsStaff] = useState(false)
  const [isCustomer, setIsCustomer] = useState(false)
  const [staffLoading, setStaffLoading] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerAccount, setCustomerAccount] = useState(null)

  // Enhanced staff status check with better error handling
  const checkStaffStatus = useCallback(async (email: string) => {
    if (!email) {
      setStaffLoading(false)
      return
    }
    
    setStaffLoading(true)
    
    // Set a longer timeout to prevent premature failures
    const timeoutId = setTimeout(() => {
      console.warn('Staff status check timed out')
      setStaffLoading(false)
      setIsStaff(false)
    }, 10000) // Increased to 10 second timeout
    
    try {
      // Try with approval_status first, fallback if column doesn't exist
      let data: any = null
      let error: any = null
      
      try {
        const result = await supabase
          .from('staff_users')
          .select('id, email, is_active, role, approval_status')
          .eq('email', email)
          .maybeSingle()
        
        data = result.data
        error = result.error
      } catch (e: any) {
        // If approval_status column doesn't exist, try without it
        if (e.message?.includes('approval_status') || (error && error.message?.includes('approval_status'))) {
          console.log('approval_status column not found, falling back to basic check')
          const fallbackResult = await supabase
            .from('staff_users')
            .select('id, email, is_active, role')
            .eq('email', email)
            .eq('is_active', true)
            .maybeSingle()
          
          data = fallbackResult.data
          error = fallbackResult.error
        } else {
          throw e
        }
      }
      
      clearTimeout(timeoutId)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking staff status:', error)
        // Don't immediately set to false - retry once
        setTimeout(() => {
          checkStaffStatus(email)
        }, 1000)
        return
      }
      
      // Check staff status - if approval_status exists, check it; otherwise just check is_active
      let staffStatus = false
      if (data) {
        if (data.approval_status !== undefined) {
          // New approval system
          staffStatus = !!(data.is_active && data.approval_status === 'approved')
          
          // Show specific message for pending approval
          if (data.approval_status === 'pending') {
            console.log('Staff account pending approval')
          } else if (data.approval_status === 'rejected') {
            console.log('Staff account rejected')
          }
        } else {
          // Legacy system - just check is_active
          staffStatus = !!data.is_active
        }
        
        if (!data.is_active) {
          console.log('Staff account inactive')
        }
      }
      
      setIsStaff(staffStatus)
      console.log('Staff status check:', { email, staffStatus, data })
      setStaffLoading(false)
      
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Error checking staff status:', error)
      // Retry once on network errors
      setTimeout(() => {
        setIsStaff(false)
        setStaffLoading(false)
      }, 1000)
    }
  }, [])

  // Enhanced customer status check with race condition prevention
  const checkCustomerStatus = useCallback(async (userId: string): Promise<boolean> => {
    if (!userId) {
      setCustomerLoading(false)
      return false
    }
    
    setCustomerLoading(true)
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Customer status check timed out')
      setCustomerLoading(false)
      // Allow access even if customer check times out - user can complete profile later
      setIsCustomer(true)
      setCustomerAccount(null)
    }, 5000) // Reduced to 5 second timeout
    
    try {
      // First, check if customer account exists
      const { data: existingAccount, error: fetchError } = await supabase
        .from('customer_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      clearTimeout(timeoutId)
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking customer status:', fetchError)
        // Allow access even if there's an error - user can complete profile later
        setIsCustomer(true)
        setCustomerAccount(null)
        setCustomerLoading(false)
        return true
      }

      if (existingAccount) {
        setIsCustomer(true)
        setCustomerAccount(existingAccount)
        setCustomerLoading(false)
        return true
      }

      // If no customer account exists, still allow access - user can complete profile later
      setIsCustomer(true)
      setCustomerAccount(null)
      setCustomerLoading(false)
      return true
      
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Error checking customer status:', error)
      // Allow access even if there's an error - user can complete profile later
      setIsCustomer(true)
      setCustomerAccount(null)
      setCustomerLoading(false)
      return true
    }
  }, [])

  // Check user roles when user changes
  useEffect(() => {
    if (user?.email) {
      Promise.all([
        checkStaffStatus(user.email),
        checkCustomerStatus(user.id)
      ])
    } else {
      setIsStaff(false)
      setIsCustomer(false)
      setCustomerAccount(null)
      setStaffLoading(false)
      setCustomerLoading(false)
    }
  }, [user, checkStaffStatus, checkCustomerStatus])

  // Update customer account state
  const updateCustomerAccount = useCallback((account: any) => {
    setCustomerAccount(account)
  }, [])

  const value = {
    isStaff,
    isCustomer,
    staffLoading,
    customerLoading,
    customerAccount,
    updateCustomerAccount
  }

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider')
  }
  return context
}

// Combined hook for backward compatibility
export function useAuthWithRole() {
  const auth = useAuth()
  const role = useUserRole()
  
  return {
    ...auth,
    ...role
  }
}
