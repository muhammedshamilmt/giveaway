import { z } from "zod";

/** Participant — name + phone are required */
export const participantSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  phone: z
    .string()
    .trim()
    .min(5, "Phone number is too short")
    .max(20, "Phone number is too long"),
});

/** Razorpay order */
export const orderSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100_000, "Amount exceeds maximum"),
  currency: z.string().length(3).default("INR"),
});

/** Razorpay verify */
export const verifySchema = z.object({
  razorpay_order_id:   z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature:  z.string().min(1),
  full_name: z.string().trim().min(2, "Full name is required").max(100),
  phone:     z.string().trim().min(5, "Phone is required").max(20),
  amount:    z.number().positive().max(100_000),
});

/** Admin login */
export const adminLoginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

/** Admin OTP */
export const adminOtpSchema = z.object({
  otp: z.string().length(5, "OTP must be 5 digits").regex(/^\d+$/, "OTP must be numeric"),
});

/** Helper — first error message from a ZodError (works for both v3 and v4) */
export function firstZodError(err: z.ZodError): string {
  // v4 uses .issues, v3 uses .errors (aliased to .issues in v4)
  const issues = err.issues ?? (err as unknown as { errors: z.ZodIssue[] }).errors;
  return issues?.[0]?.message ?? "Invalid input";
}
