/**
 * Comprehensive input validation schemas using Zod
 * Prevents injection attacks and ensures data integrity
 */

import { z } from "zod";

// Base schemas for common validations
export const emailSchema = z.string().email("Invalid email address").max(254);
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { 
    message: "Password must contain uppercase, lowercase, number and special character" 
  });

export const textSchema = z.string().max(1000).trim();
export const nameSchema = z.string().min(1).max(100).trim();
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/, { message: "Invalid phone number" });

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// User profile schemas
export const profileSchema = z.object({
  full_name: nameSchema,
  phone_number: phoneSchema.optional(),
  company: textSchema.optional(),
  job_title: textSchema.optional(),
  bio: z.string().max(500).trim().optional()
});

// Tax calculation schemas
export const taxCalculationSchema = z.object({
  income: z.number().min(0).max(1000000000),
  tax_type: z.enum(['income', 'vat', 'corporate', 'capital_gains', 'withholding']),
  additional_data: z.record(z.string(), z.any()).optional()
});

// Calendar event schemas
export const calendarEventSchema = z.object({
  title: nameSchema,
  description: textSchema.optional(),
  date: z.string().datetime(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  is_all_day: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['meeting', 'deadline', 'reminder', 'other']).default('meeting')
});

// Compliance item schemas
export const complianceItemSchema = z.object({
  title: nameSchema,
  description: textSchema.optional(),
  requirement_type: textSchema,
  country: nameSchema,
  frequency: z.enum(['annual', 'quarterly', 'monthly', 'weekly']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  next_due_date: z.string().datetime().optional()
});

// Document upload schemas
export const documentUploadSchema = z.object({
  filename: z.string().max(255).regex(/^[^<>:"/\\|?*]+$/), // Prevent path traversal
  content_type: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/),
  size: z.number().min(1).max(50 * 1024 * 1024), // Max 50MB
  tax_year: z.number().min(2000).max(2030).optional()
});

// Message schemas
export const messageSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
  team_id: z.number().optional()
});

// Transfer pricing schemas
export const transferPricingDocumentSchema = z.object({
  title: nameSchema,
  description: textSchema.optional(),
  document_type: z.enum(['local_file', 'master_file', 'country_report', 'benchmarking']),
  status: z.enum(['draft', 'in_review', 'approved', 'archived']).default('draft')
});

// Payment schemas
export const paymentSchema = z.object({
  amount: z.number().min(0.01).max(10000000),
  currency: z.string().length(3).toUpperCase().default('NGN'),
  provider: z.enum(['paystack', 'flutterwave']),
  reference: z.string().max(100).optional()
});

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true as const, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => e.message).join(', ');
      return { success: false as const, error: errorMessage };
    }
    return { success: false as const, error: 'Validation failed' };
  }
};

export const sanitizeHtmlInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Rate limiting schemas
export const rateLimitSchema = z.object({
  endpoint: z.string(),
  limit: z.number().min(1).max(1000),
  window: z.number().min(60).max(3600) // 1 minute to 1 hour
});