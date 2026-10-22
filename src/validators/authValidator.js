const { z } = require("zod");

const loginSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Please provide a valid email address")
      .max(100, "Email must not exceed 100 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must not exceed 128 characters"),
  })
  .strict(); // Rejects unexpected / unknown fields!

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(100, "Email must not exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  avatar: z
    .string()
    .max(10000000, "Avatar image payload too large")
    .optional(),
});

const changePasswordSchema = z.object({
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(6, "New password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters")
    .optional(),
});

module.exports = {
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
