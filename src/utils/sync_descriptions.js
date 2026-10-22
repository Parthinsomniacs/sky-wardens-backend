const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const sync = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sky_wardens_db";
  await mongoose.connect(uri);
  console.log("Connected to", uri);

  await mongoose.connection.collection("divisions").updateOne(
    { slug: "aerospace" },
    {
      $set: {
        description: "Aeronautical systems, tactical UAVs, ISR reconnaissance, and flight avionics.",
        sector: "Sector 1",
        buttonText: "Explore Aerospace",
        imageSrc: "/images/business-aerospace.jpg",
        imageAlt: "Stealth aerospace defence aircraft in high-tech hangar",
        logoSrc: "/images/aerospace.png",
        logoAlt: "Aerospace Logo",
        status: "Active",
        order: 1,
      },
    }
  );

  await mongoose.connection.collection("divisions").updateOne(
    { slug: "defence" },
    {
      $set: {
        description: "Frontline ballistic protection, tactical helmets, combat body armor, and riot gear.",
        sector: "Sector 2",
        buttonText: "Explore Defence",
        imageSrc: "/images/business-systems.jpg",
        imageAlt: "Specialist engineer operating tactical command workstation in red lighting",
        logoSrc: "/images/defence.png",
        logoAlt: "Defence Logo",
        status: "Active",
        order: 2,
      },
    }
  );

  const divs = await mongoose.connection.collection("divisions").find({}).toArray();
  console.log("Updated divisions:", divs.map(d => ({ name: d.name, status: d.status, sector: d.sector, desc: d.description })));
  process.exit(0);
};

sync();
