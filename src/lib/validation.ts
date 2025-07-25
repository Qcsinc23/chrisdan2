import { z } from 'zod'

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits'),
})

// Address validation schema
export const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string()
    .regex(/^[A-Za-z0-9\s\-]+$/, 'Invalid postal code format')
    .min(4, 'Postal code must be at least 4 characters'),
  country: z.string().min(2, 'Country is required'),
})

// Shipment validation schema
export const shipmentSchema = z.object({
  trackingNumber: z.string()
    .min(8, 'Tracking number must be at least 8 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Tracking number can only contain letters and numbers'),
  description: z.string().min(3, 'Description is required'),
  weight: z.number().positive('Weight must be positive'),
  dimensions: z.object({
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
  }),
  value: z.number().nonnegative('Value must be non-negative'),
})

// File upload validation schema
export const fileUploadSchema = z.object({
  file: z.any()
    .refine((file) => file?.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file?.type),
      'Only JPEG, PNG, and PDF files are allowed'
    ),
})

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}

// Input sanitization helper
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

// Email validation regex
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation regex
export const phoneRegex = /^\+?[\d\s\-\(\)]+$/

// URL validation regex
export const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
