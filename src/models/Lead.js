const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    productInquired: {
      type: String,
      default: "General Aerospace/Defence Inquiry",
      trim: true,
    },
    category: {
      type: String,
      default: "Aerospace",
      trim: true,
    },
    type: {
      type: String,
      default: "Product(s) Inquiry",
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
    },
    status: {
      type: String,
      enum: ["New", "In Discussion", "Contacted", "Closed"],
      default: "New",
    },
    priority: {
      type: String,
      enum: ["Standard", "Medium", "High"],
      default: "Standard",
    },
    message: {
      type: String,
      required: [true, "Inquiry message is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign human-friendly ID if not present
leadSchema.pre("save", async function () {
  if (!this.id) {
    const count = await this.constructor.countDocuments();
    this.id = `INQ-${String(count + 1).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model("Lead", leadSchema);
