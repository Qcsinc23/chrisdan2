import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isStaff: boolean
  isCustomer: boolean
  staffLoading: boolean
  customerLoading: boolean
  customerAccount: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStaff, setIsStaff] = useState(false)
  const [isCustomer, setIsCustomer] = useState(false)
  const [staffLoading, setStaffLoading] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerAccount, setCustomerAccount] = useState(null)

  useEffect(() => {
    // Get initial user
    async function getInitialUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await Promise.all([
            checkStaffStatus(user.email!),
            checkCustomerStatus(user.id)
          ])
        } else {
          setStaffLoading(false)
          setCustomerLoading(false)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        setStaffLoading(false)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user || null)
        
        if (session?.user) {
          Promise.all([
            checkStaffStatus(session.user.email!),
            checkCustomerStatus(session.user.id)
          ])
        } else {
          setIsStaff(false)
          setIsCustomer(false)
          setCustomerAccount(null)
          setStaffLoading(false)
          setCustomerLoading(false)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function checkStaffStatus(email: string) {
    setStaffLoading(true)
    
    try {
      const { data } = await supabase
        .from('staff_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle()
      
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

  async function checkCustomerStatus(userId: string) {
    setCustomerLoading(true)
    
    try {
      const { data } = await supabase
        .from('customer_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      
      let customerStatus = !!data
      let customerData = data
      
      // If no customer account exists, try to create one using auth user metadata
      if (!data) {
        try {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user && userData.user.user_metadata) {
            const { error: createError } = await supabase.functions.invoke('manage-customer-account', {
              body: {
                action: 'create_account',
                accountData: {
                  fullName: userData.user.user_metadata.full_name || userData.user.email?.split('@')[0] || 'Customer',
                  phone: userData.user.user_metadata.phone || '',
                  whatsappNotifications: true,
                  emailNotifications: true,
                  smsNotifications: false
                }
              }
            })
            
            if (!createError) {
              // Retry fetching the customer account
              const { data: newData } = await supabase
                .from('customer_accounts')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()
              
              customerStatus = !!newData
              customerData = newData
            }
          }
        } catch (createError) {
          console.error('Error auto-creating customer account:', createError)
        }
      }
      
      setIsCustomer(customerStatus)
      setCustomerAccount(customerData)
      
      console.log('Customer status check:', { userId, customerStatus, data: customerData })
      
    } catch (error) {
      console.error('Error checking customer status:', error)
      setIsCustomer(false)
      setCustomerAccount(null)
    } finally {
      setCustomerLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      toast.error(error.message)
      throw error
    }

    toast.success('Signed in successfully!')
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error(error.message)
      throw error
    }

    toast.success('Signed out successfully!')
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isStaff,
    isCustomer,
    staffLoading,
    customerLoading,
    customerAccount
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