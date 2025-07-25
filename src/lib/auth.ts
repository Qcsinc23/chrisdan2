import { supabase } from './supabase'
import { loginSchema, registerSchema } from './validation'

// Enhanced authentication with refresh tokens
export class AuthService {
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly USER_KEY = 'user'

  // Login with enhanced security
  static async login(email: string, password: string) {
    try {
      // Validate input
      loginSchema.parse({ email, password })

      // Check for rate limiting
      if (!this.checkRateLimit(email)) {
        return { success: false, error: 'Too many login attempts. Please try again later.' }
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Store tokens securely
      if (data.session) {
        this.setTokens(data.session.access_token, data.session.refresh_token)
        this.setUser(data.user)
        this.recordLoginAttempt(email, true)
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      this.recordLoginAttempt(email, false)
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Register with enhanced security
  static async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
  }) {
    try {
      // Validate input
      registerSchema.parse(userData)

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('customers')
        .select('id')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        return { success: false, error: 'User already exists' }
      }

      // Create user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          },
        },
      })

      if (error) throw error

      // Create customer record
      if (data.user) {
        await supabase.from('customers').insert({
          user_id: data.user.id,
          email: userData.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
        })
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Logout with token cleanup
  static async logout() {
    try {
      await supabase.auth.signOut()
      this.clearTokens()
      this.clearUser()
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }

  // Refresh access token
  static async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' }
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      })

      if (error) throw error

      if (data.session) {
        this.setTokens(data.session.access_token, data.session.refresh_token)
      }

      return { success: true, session: data.session }
    } catch (error) {
      console.error('Token refresh error:', error)
      this.clearTokens()
      return { success: false, error: 'Session expired' }
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch {
      return false
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch {
      return null
    }
  }

  // Password reset
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Password update error:', error)
      return { success: false, error: this.handleAuthError(error) }
    }
  }

  // Private methods
  private static setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  private static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  private static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  private static setUser(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  private static clearUser() {
    localStorage.removeItem(this.USER_KEY)
  }

  private static getUser(): any | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  private static checkRateLimit(identifier: string): boolean {
    const attempts = this.getLoginAttempts(identifier)
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    
    // Clean old attempts
    const validAttempts = attempts.filter(
      (attempt: any) => now - attempt.timestamp < windowMs
    )
    
    if (validAttempts.length >= 5) {
      return false
    }
    
    return true
  }

  private static recordLoginAttempt(identifier: string, success: boolean) {
    const attempts = this.getLoginAttempts(identifier)
    attempts.push({
      timestamp: Date.now(),
      success,
    })
    
    // Keep only last 10 attempts
    const recentAttempts = attempts.slice(-10)
    localStorage.setItem(`login_attempts_${identifier}`, JSON.stringify(recentAttempts))
  }

  private static getLoginAttempts(identifier: string): any[] {
    const attemptsStr = localStorage.getItem(`login_attempts_${identifier}`)
    return attemptsStr ? JSON.parse(attemptsStr) : []
  }

  private static handleAuthError(error: any): string {
    if (error.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password'
    }
    if (error.message?.includes('Email not confirmed')) {
      return 'Please confirm your email address'
    }
    if (error.message?.includes('Too many requests')) {
      return 'Too many attempts. Please try again later'
    }
    return 'Authentication failed. Please try again'
  }
}

// Session management
export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  static startSessionMonitoring() {
    setInterval(() => {
      this.checkSessionExpiry()
    }, 60000) // Check every minute
  }

  private static checkSessionExpiry() {
    const user = AuthService.getCurrentUser()
    if (user) {
      // Check if session is still valid
      AuthService.isAuthenticated().then(isValid => {
        if (!isValid) {
          this.handleSessionExpiry()
        }
      })
    }
  }

  private static handleSessionExpiry() {
    // Clear local storage
    localStorage.clear()
    
    // Redirect to login
    window.location.href = '/login'
  }
}

// Initialize session monitoring
SessionManager.startSessionMonitoring()
