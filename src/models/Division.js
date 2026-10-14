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
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving if not provided
divisionSchema.pre("save", function () {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
});

module.exports = mongoose.model("Division", divisionSchema);
