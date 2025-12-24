/**
 * PrismSplit Validation Schemas
 * 
 * Zod schemas for input validation before database operations.
 * All user inputs should be validated and sanitized before being sent to Supabase.
 * 
 * Security Note: Supabase uses parameterized queries which prevent SQL injection.
 * This layer adds defense-in-depth by sanitizing inputs before they reach the API.
 */

import { z } from 'zod';

// === Sanitization Utilities ===

/**
 * Sanitize text input by removing potentially dangerous patterns.
 * Defense-in-depth against XSS and injection attacks.
 */
function sanitizeText(input: string): string {
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Escape HTML entities to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Light sanitization for names - allows common name characters only.
 * Strips anything that isn't letters, spaces, hyphens, or apostrophes.
 */
function sanitizeName(input: string): string {
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Only allow letters, spaces, hyphens, apostrophes
    .replace(/[^a-zA-Z\s'-]/g, '');
}

/**
 * Sanitize general text but allow more characters for titles/descriptions.
 * Removes dangerous control characters and script patterns.
 */
function sanitizeGeneralText(input: string): string {
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags (case insensitive)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (prevents data URI attacks)
    .replace(/data:/gi, '');
}

// === Safe String Schema (base for all text inputs) ===

const safeStringSchema = (options: {
  min?: number;
  max: number;
  sanitizer?: (val: string) => string;
}) => {
  const { min = 0, max, sanitizer = sanitizeGeneralText } = options;
  return z
    .string()
    .min(min, min > 0 ? `Must be at least ${min} characters` : undefined)
    .max(max, `Must be at most ${max} characters`)
    .transform(sanitizer);
};

// === Auth Schemas ===

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email too short')
  .max(255, 'Email too long')
  .transform(val => val.toLowerCase().trim())
  // Additional validation: must not contain suspicious patterns
  .refine(val => !val.includes('<') && !val.includes('>'), 'Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const signupInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .transform(sanitizeName)
    .refine(val => val.length >= 2, 'Name must be at least 2 characters after sanitization'),
});

// === Group Schemas ===

export const groupNameSchema = z
  .string()
  .min(1, 'Group name is required')
  .max(50, 'Group name too long')
  .transform(sanitizeGeneralText)
  .refine(val => val.length >= 1, 'Group name is required after sanitization');

export const currencySchema = z.enum([
  'USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY'
]);

export const createGroupInputSchema = z.object({
  name: groupNameSchema,
  emoji: z.string().max(10).optional().default(''),
  currency: currencySchema.default('USD'),
});

export const updateGroupInputSchema = z.object({
  name: groupNameSchema.optional(),
  emoji: z.string().max(10).optional(),
  currency: currencySchema.optional(),
});

// === Bill Schemas ===

export const billTitleSchema = z
  .string()
  .min(1, 'Bill title is required')
  .max(100, 'Title too long')
  .transform(sanitizeGeneralText)
  .refine(val => val.length >= 1, 'Bill title is required after sanitization');

export const categorySchema = z.enum([
  'groceries', 'dining', 'transport', 'utilities',
  'entertainment', 'travel', 'shopping', 'transfer', 'other'
]);

export const amountSchema = z
  .number()
  .min(0, 'Amount cannot be negative')
  .max(1000000, 'Amount too large')
  .transform(val => Math.round(val * 100) / 100); // Round to 2 decimals

// Item name sanitization
export const itemNameSchema = z
  .string()
  .min(1, 'Item name is required')
  .max(100, 'Item name too long')
  .transform(sanitizeGeneralText)
  .refine(val => val.length >= 1, 'Item name is required after sanitization');

export const billItemSchema = z.object({
  name: itemNameSchema,
  price: amountSchema,
  quantity: z.number().int().min(1).max(999).default(1),
  discount: amountSchema.optional().default(0),
  category: categorySchema.optional(),
});

export const splitModeSchema = z.enum(['equal', 'proportional']);

export const createBillInputSchema = z.object({
  title: billTitleSchema,
  groupId: z.string().uuid('Invalid group ID'),
  category: categorySchema.default('other'),
  items: z.array(billItemSchema).min(0).max(100),
  tax: amountSchema.default(0),
  tip: amountSchema.default(0),
  discount: amountSchema.optional().default(0),
  taxSplitMode: splitModeSchema.optional().default('proportional'),
  tipSplitMode: splitModeSchema.optional().default('proportional'),
  participantIds: z.array(z.string().uuid()).optional(),
});

export const updateBillInputSchema = z.object({
  title: billTitleSchema.optional(),
  category: categorySchema.optional(),
  totalAmount: amountSchema.optional(),
  taxAmount: amountSchema.optional(),
  tipAmount: amountSchema.optional(),
  discountAmount: amountSchema.optional(),
  taxSplitMode: splitModeSchema.optional(),
  tipSplitMode: splitModeSchema.optional(),
});

// === Settlement Schemas ===

export const settlementInputSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  payerId: z.string().uuid('Invalid payer ID'),
  receiverId: z.string().uuid('Invalid receiver ID'),
  amount: amountSchema.refine(val => val > 0, 'Amount must be positive'),
  notes: z.string().max(255).optional().transform(val => val ? sanitizeGeneralText(val) : val),
});

// === Utility Functions ===

/**
 * Safely parse and validate input, returning result or error
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Get first error message
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || 'Validation failed' };
}

/**
 * Parse input and throw on validation error (use in stores)
 */
export function parseInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// === Type Exports (inferred from schemas) ===

export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignupInput = z.infer<typeof signupInputSchema>;
export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupInputSchema>;
export type BillItem = z.infer<typeof billItemSchema>;
export type CreateBillInput = z.infer<typeof createBillInputSchema>;
export type UpdateBillInput = z.infer<typeof updateBillInputSchema>;
export type SettlementInput = z.infer<typeof settlementInputSchema>;
