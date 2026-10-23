const mongoose = require("mongoose");
require("dotenv").config();
const Division = require("../models/Division");

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URI_LOCAL);
  await Division.updateOne(
    { slug: "aerospace" },
    {
      $set: {
        sector: "Sector 1",
        buttonText: "Explore Aerospace",
        imageSrc: "/images/business-aerospace.jpg",
        imageAlt: "Stealth aerospace defence aircraft in high-tech hangar",
        logoSrc: "/images/aerospace.png",
        logoAlt: "Aerospace Logo",
        href: "/products/aerospace",
        order: 1,
      },
    }
  );
  await Division.updateOne(
    { slug: "defence" },
    {
      $set: {
        sector: "Sector 2",
        buttonText: "Explore Defence",
        imageSrc: "/images/business-systems.jpg",
        imageAlt: "Specialist engineer operating tactical command workstation in red lighting",
        logoSrc: "/images/defence.png",
        logoAlt: "Defence Logo",
        href: "/products/defence",
        order: 2,
      },
    }
  );
  const divs = await Division.find().sort({ order: 1 });
  console.log("Updated Divisions successfully:", divs.length);
  process.exit(0);
}
run();
