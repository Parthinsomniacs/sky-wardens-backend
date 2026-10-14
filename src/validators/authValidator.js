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

module.exports = {
  loginSchema,
};
