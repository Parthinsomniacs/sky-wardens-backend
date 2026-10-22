const { z } = require("zod");

const createDivisionSchema = z
  .object({
    name: z
      .string({ required_error: "Division name is required." })
      .trim()
      .min(2, "Division name must be at least 2 characters.")
      .max(60, "Division name must not exceed 60 characters."),
    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters.")
      .optional()
      .default(""),
    status: z.enum(["Active", "Inactive"]).optional().default("Active"),
    badgeColor: z
      .string()
      .trim()
      .max(50, "Badge color format must not exceed 50 characters.")
      .optional()
      .default("bg-indigo-600"),
    sector: z.string().trim().max(100).optional().default(""),
    buttonText: z.string().trim().max(100).optional().default(""),
    imageSrc: z.string().optional().default(""),
    imageAlt: z.string().trim().max(500).optional().default(""),
    logoSrc: z.string().optional().default(""),
    logoAlt: z.string().trim().max(500).optional().default(""),
    href: z.string().trim().max(500).optional().default(""),
    order: z.number().optional().default(0),
  })
  .passthrough();

const updateDivisionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Division name must be at least 2 characters.")
      .max(60, "Division name must not exceed 60 characters.")
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters.")
      .optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    badgeColor: z
      .string()
      .trim()
      .max(50, "Badge color format must not exceed 50 characters.")
      .optional(),
    sector: z.string().trim().max(100).optional(),
    buttonText: z.string().trim().max(100).optional(),
    imageSrc: z.string().optional(),
    imageAlt: z.string().trim().max(500).optional(),
    logoSrc: z.string().optional(),
    logoAlt: z.string().trim().max(500).optional(),
    href: z.string().trim().max(500).optional(),
    order: z.number().optional(),
  })
  .passthrough();

module.exports = {
  createDivisionSchema,
  updateDivisionSchema,
};
