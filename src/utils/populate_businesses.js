const mongoose = require("mongoose");
require("dotenv").config();
const Division = require("../models/Division");

async function populate() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sky_wardens");
  
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

  const list = await Division.find().sort({ order: 1 });
  console.log("Populated divisions:", JSON.stringify(list, null, 2));
  process.exit(0);
}

populate();
