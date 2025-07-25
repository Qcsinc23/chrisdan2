// Security utilities for Supabase Edge Functions

// CORS headers for secure cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:5173'],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://yddnvrvlgzoqjuazryht.supabase.co",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}

// Input validation helper
export const validateInput = (schema: any, data: any) => {
  try {
    return schema.parse(data)
  } catch (error: any) {
    throw new Error(`Validation failed: ${error.errors.map((e: any) => e.message).join(', ')}`)
  }
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Validate password strength
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
}

// Generate secure random ID
export const generateSecureId = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Hash sensitive data
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Mask sensitive data
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) return '*'.repeat(data.length)
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars)
}

// Validate file upload
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed' }
  }
  
  return { valid: true }
}

// IP address validation
export const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

// Audit logging
export const auditLog = (action: string, userId: string, details: any) => {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    ip: 'unknown', // Will be populated from request
  }
  
  console.log('AUDIT:', JSON.stringify(log))
}

// Error response helper
export const errorResponse = (message: string, status: number = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

// Success response helper
export const successResponse = (data: any, status: number = 200) => {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}
