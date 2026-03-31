import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  const { connectToDatabase } = await import("@/lib/db");
  const { GalleryItemModel } = await import("@/models/gallery-item.model");

  await connectToDatabase();

  const items = await GalleryItemModel.find({})
    .sort({ createdAt: 1, _id: 1 })
    .exec();

  console.log(`Found ${items.length} gallery items. Assigning order values...`);

  for (let i = 0; i < items.length; i++) {
    await GalleryItemModel.updateOne({ _id: items[i]._id }, { $set: { order: i } });
    console.log(`  [${i}] ${items[i]._id}`);
  }

  console.log("Done. All gallery items have been assigned order values.");
}

run().catch((error: unknown) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
