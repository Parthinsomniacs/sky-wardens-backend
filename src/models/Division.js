const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Division name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    badgeColor: {
      type: String,
      default: "bg-indigo-600",
    },
    sector: {
      type: String,
      default: "",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "",
      trim: true,
    },
    imageSrc: {
      type: String,
      default: "",
      trim: true,
    },
    imageAlt: {
      type: String,
      default: "",
      trim: true,
    },
    logoSrc: {
      type: String,
      default: "",
      trim: true,
    },
    logoAlt: {
      type: String,
      default: "",
      trim: true,
    },
    href: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug and defaults before saving if not provided
divisionSchema.pre("save", function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  if (!this.href && this.slug) {
    this.href = `/products/${this.slug}`;
  }
  if (!this.buttonText && this.name) {
    this.buttonText = `Explore ${this.name}`;
  }
});

module.exports = mongoose.model("Division", divisionSchema);
