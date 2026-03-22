import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MOM_HERO_IMAGE_URL = process.env.MOM_HERO_IMAGE_URL;
const MOM_HERO_IMAGE_PUBLIC_ID = process.env.MOM_HERO_IMAGE_PUBLIC_ID;

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!MOM_HERO_IMAGE_URL) {
    throw new Error("MOM_HERO_IMAGE_URL is not defined");
  }

  if (!MOM_HERO_IMAGE_PUBLIC_ID) {
    throw new Error("MOM_HERO_IMAGE_PUBLIC_ID is not defined");
  }

  const { connectToDatabase } = await import("@/lib/db");
  const { MomPageModel } = await import("@/models/mom-page.model");

  await connectToDatabase();

  await MomPageModel.deleteMany({});

  await MomPageModel.create({
    title: "Наталья Владимировна Толстова — человек, рядом с которым становится теплее.",
    introText:
      "Мама, бабушка, жена, дочь. Актриса театра и кино, которая проживает каждую роль по-настоящему. Человек с тонким чувством слова — она пишет стихи, в которых много жизни и света.",
    shortBiography:
      "Добрая, заботливая, искренняя. Умеет поддержать, вдохновить и подарить ощущение, что всё обязательно будет хорошо. Эта страница — о любви, благодарности и тёплых воспоминаниях, которые хочется сохранить.",
    heroImage: {
      url: MOM_HERO_IMAGE_URL,
      publicId: MOM_HERO_IMAGE_PUBLIC_ID,
    },
  });

  console.log("Mom page seeded successfully");
}

run().catch((error: unknown) => {
  console.error("Failed to seed mom page", error);
  process.exit(1);
});