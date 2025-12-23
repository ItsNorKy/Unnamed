const mongoose = require("mongoose");
const GachaPull = require("../../gacha/pull_schema");
const { banners } = require("../../gacha/data");
require("dotenv").config();
const mongopassword = process.env.MONGODB_PASSWORD;
const mongousername = process.env.MONGODB_USERNAME;
const uri = `mongodb+srv://${mongousername}:${mongopassword}@kanou.ixlik.mongodb.net/Kanou?retryWrites=true&w=majority&appName=Kanou`;

async function main() {
  await mongoose.connect(uri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              serverSelectionTimeoutMS: 15000, 
          });

  console.log("Connected to MongoDB.");

  // Define your old banner history (the order you had before)
  const oldBanners = {
    galbrena: banners.galbrena.featured5Star,
    lupa: banners.lupa.featured5Star,
  };

  let updated = 0;

  // Find all old 5★ pulls missing featured data
  const pulls = await GachaPull.find({
    rarity: 5,
    featured5Star: { $exists: false },
  });

  for (const p of pulls) {
    // If the pulled name matches an old featured 5★, patch it
    for (const [banner, featuredName] of Object.entries(oldBanners)) {
      if (p.name === featuredName) {
        p.banner = banner;
        p.featured5Star = featuredName;
        await p.save();
        updated++;
      }
    }
  }

  console.log(`✅ Patched ${updated} old pulls with featured info.`);
  await mongoose.disconnect();
  console.log("Disconnected.");
}

main().catch(console.error);

