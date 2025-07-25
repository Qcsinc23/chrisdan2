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
  isStaff: boolean
  isCustomer: boolean
  staffLoading: boolean
  customerLoading: boolean
  customerAccount: any
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStaff, setIsStaff] = useState(false)
  const [isCustomer, setIsCustomer] = useState(false)
  const [staffLoading, setStaffLoading] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerAccount, setCustomerAccount] = useState(null)

  // Enhanced session refresh with error handling
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      setSession(newSession)
      setUser(newSession?.user ?? null)
      
      if (newSession?.user) {
        await Promise.all([
          checkStaffStatus(newSession.user.email!),
          checkCustomerStatus(newSession.user.id)
        ])
      }
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
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting initial session:', sessionError)
          return
        }

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          
          if (initialSession?.user) {
            await Promise.all([
              checkStaffStatus(initialSession.user.email!),
              checkCustomerStatus(initialSession.user.id)
            ])
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
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
          
          if (event === 'SIGNED_IN' && session?.user) {
            await Promise.all([
              checkStaffStatus(session.user.email!),
              checkCustomerStatus(session.user.id)
            ])
          } else if (event === 'SIGNED_OUT') {
            setIsStaff(false)
            setIsCustomer(false)
            setCustomerAccount(null)
          } else if (event === 'TOKEN_REFRESHED') {
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
  }, [])

  // Enhanced staff status check with better error handling
  const checkStaffStatus = async (email: string) => {
    if (!email) return
    
    setStaffLoading(true)
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('id, email, is_active, role')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking staff status:', error)
        setIsStaff(false)
        return
      }
      
      const staffStatus = !!data
      setIsStaff(staffStatus)
      console.log('Staff status check:', { email, staffStatus, data })
      
    } catch (error) {
      console.error('Error checking staff status:', error)
      setIsStaff(false)
    } finally {
      setStaffLoading(false)
    }
  }

  // Enhanced customer status check with race condition prevention
  const checkCustomerStatus = async (userId: string): Promise<boolean> => {
    if (!userId) return false
    
    setCustomerLoading(true)
    try {
      // First, check if customer account exists
      const { data: existingAccount, error: fetchError } = await supabase
        .from('customer_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking customer status:', fetchError)
        setIsCustomer(false)
        setCustomerAccount(null)
        return false
      }

      if (existingAccount) {
        setIsCustomer(true)
        setCustomerAccount(existingAccount)
        return true
      }

      // If no account exists, check if we can create one
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setIsCustomer(false)
        setCustomerAccount(null)
        return false
      }

      // Try to create customer account
      try {
        const { data: createData, error: createError } = await supabase.functions.invoke('manage-customer-account', {
          body: {
            action: 'create_account',
            accountData: {
              fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Customer',
              phone: authUser.user_metadata?.phone || '',
              whatsappNotifications: true,
              emailNotifications: true,
              smsNotifications: false
            }
          }
        })

        if (createError) {
          console.error('Error creating customer account:', createError)
          setIsCustomer(false)
          setCustomerAccount(null)
          return false
        }

        if (createData?.data) {
          setIsCustomer(true)
          setCustomerAccount(createData.data)
          return true
        }
      } catch (createError) {
        console.error('Error in customer account creation:', createError)
      }

      setIsCustomer(false)
      setCustomerAccount(null)
      return false
      
    } catch (error) {
      console.error('Error checking customer status:', error)
      setIsCustomer(false)
      setCustomerAccount(null)
      return false
    } finally {
      setCustomerLoading(false)
    }
  }

  // Enhanced sign in with proper error handling
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
  }

  // Enhanced sign up with email verification handling
  const signUp = async (email: string, password: string, metadata: any = {}): Promise<{ success: boolean; error?: string }> => {
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
          toast.success('Account created successfully!')
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
  }

  // Enhanced sign out with cleanup
  const signOut = async () => {
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
      setIsStaff(false)
      setIsCustomer(false)
      setCustomerAccount(null)
      
      toast.success('Signed out successfully!')
    } catch (error) {
      console.error('Error during sign out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isStaff,
    isCustomer,
    staffLoading,
    customerLoading,
    customerAccount,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
