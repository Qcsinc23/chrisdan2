import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'

// CORS configuration
export const corsOptions = {
  origin: process.env.VITE_ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
}

// Rate limiting configuration
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
      })
    },
  })
}

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://yddnvrvlgzoqjuazryht.supabase.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
})

// Input validation middleware
export const validateInput = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      })
    }
  }
}

// Error handling middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    })
  }
  
  // Handle rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: err.retryAfter,
    })
  }
  
  // Handle other errors
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
}

// Authentication middleware
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  // Verify JWT token here
  next()
}

// File upload validation
export const validateFileUpload = (req: any, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'File size exceeds 5MB limit' })
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' })
  }
  
  next()
}

// Request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
  })
  
  next()
}

// Security utilities
export const generateSecureId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export const hashSensitiveData = (data: string): string => {
  // Implement proper hashing with bcrypt or similar
  return Buffer.from(data).toString('base64')
}

export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars) return '*'.repeat(data.length)
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars)
}

// CSRF token generation
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// IP address validation
export const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}
