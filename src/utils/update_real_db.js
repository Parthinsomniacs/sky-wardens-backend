const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

async function updateActualDb() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;
  await mongoose.connect(uri);
  const collection = mongoose.connection.collection("divisions");

  await collection.updateOne(
    { slug: "aerospace" },
    {
      $set: {
        sector: "Sector 1",
        description: "UAV platforms and aerial surveillance systems.",
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

  await collection.updateOne(
    { slug: "defence" },
    {
      $set: {
        sector: "Sector 2",
        description: "Precision weapon platforms and sovereign tactical equipment.",
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

  const all = await collection.find({}).toArray();
  console.log("Successfully updated sky_wardens_db:", JSON.stringify(all, null, 2));
  process.exit(0);
}

updateActualDb();
