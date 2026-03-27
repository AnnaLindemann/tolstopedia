import { connectToDatabase } from "@/lib/db";
import { MomPageModel, type MomPageDocument } from "@/models/mom-page.model";

const DEFAULT_MOM_PAGE = {
  title: "Для нашей любимой мамы",
  introText:
    "Этот сайт мы создаём с любовью, чтобы собрать здесь тёплые слова, фотографии, видео и воспоминания о самых важных моментах.",
  shortBiography:
    "Здесь скоро появится короткая история о маме: важные этапы жизни, любимые воспоминания, фотографии и поздравления от близких. Пока это стартовая версия страницы, но уже на следующем шаге мы сможем наполнять её настоящим содержанием.",
  heroImage: {
    url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1400&q=80",
    publicId: "default/mom-page-hero",
  },
};

export async function getOrCreateMomPage(): Promise<MomPageDocument> {
  await connectToDatabase();

  const existingMomPage = await MomPageModel.findOne().exec();

  if (existingMomPage) {
    return existingMomPage;
  }

  const createdMomPage = await MomPageModel.create(DEFAULT_MOM_PAGE);

  return createdMomPage;
}