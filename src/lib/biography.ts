import { connectToDatabase } from "@/lib/db";
import {
  BiographyPageModel,
  type BiographyPageDocument,
} from "@/models/biography-page.model";

const DEFAULT_BIOGRAPHY_PAGE = {
  title: "Биография",
  content:
    "Здесь скоро появится биография мамы: важные этапы жизни, воспоминания, значимые события и тёплые истории, которые хочется сохранить для всей семьи.",
  mainImage: {
    url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1200&q=80",
    publicId: "default/biography-main-image",
  },
};

export async function getOrCreateBiographyPage(): Promise<BiographyPageDocument> {
  await connectToDatabase();

  const existingBiographyPage = await BiographyPageModel.findOne().exec();

  if (existingBiographyPage) {
    return existingBiographyPage;
  }

  const createdBiographyPage = await BiographyPageModel.create(
    DEFAULT_BIOGRAPHY_PAGE,
  );

  return createdBiographyPage;
}