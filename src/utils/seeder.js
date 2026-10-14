const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Role = require("../models/Role");
const User = require("../models/User");
const Division = require("../models/Division");
const Product = require("../models/Product");
const Lead = require("../models/Lead");

dotenv.config();

const INITIAL_DIVISIONS = [
  {
    name: "Aerospace",
    slug: "aerospace",
    description: "Aeronautical systems, tactical UAVs, ISR reconnaissance, and flight avionics.",
    status: "Active",
    badgeColor: "bg-sky-600",
  },
  {
    name: "Defence",
    slug: "defence",
    description: "Frontline ballistic protection, tactical helmets, combat body armor, and riot gear.",
    status: "Active",
    badgeColor: "bg-emerald-600",
  },
  {
    name: "Advanced Systems",
    slug: "advanced-systems",
    description: "Next-gen autonomous drone swarms, tactical electronic warfare, and counter-UAS grids.",
    status: "Active",
    badgeColor: "bg-purple-600",
  },
  {
    name: "Petrochemicals",
    slug: "petrochemicals",
    description: "MIL-SPEC aviation fuels, high-impact ballistic polymers, and aerospace lubricants.",
    status: "Active",
    badgeColor: "bg-amber-600",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[MongoDB Connected for Seeding]");

    // 1. Clear existing collections
    await User.deleteMany();
    await Role.deleteMany();
    await Division.deleteMany();
    await Product.deleteMany();
    await Lead.deleteMany();

    console.log("[Old records cleared]");

    // 2. Seed Single Role: "Super Admin"
    const superAdminRole = await Role.create({
      name: "Super Admin",
      slug: "super-admin",
      description: "Full System Operational & Defense Clearance Access",
      permissions: ["*"],
      isActive: true,
    });
    console.log(`[Role Seeded]: 1 Role created -> '${superAdminRole.name}' (${superAdminRole._id})`);

    // 3. Seed Single User: "Super Admin" referencing the Role collection
    const superAdminUser = await User.create({
      id: "USR-001",
      name: "Super Admin",
      email: "admin@skywardens.com",
      password: "SuperAdmin@Sky2026#",
      role: superAdminRole._id,
      avatar: "SA",
      status: "Active",
      lastLogin: "Active Now",
    });
    console.log(`[User Seeded]: 1 User created -> '${superAdminUser.email}' as Super Admin`);

    // 4. Seed Divisions
    await Division.insertMany(INITIAL_DIVISIONS);
    console.log(`[Divisions Seeded]: ${INITIAL_DIVISIONS.length} divisions`);

    console.log("==================================================");
    console.log(" DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log(" Active Role       : Super Admin");
    console.log(" Super Admin Email : admin@skywardens.com");
    console.log(" Super Admin Pass  : SuperAdmin@Sky2026#");
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
