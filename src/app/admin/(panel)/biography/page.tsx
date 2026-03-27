import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/db";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { getOrCreateBiographyPage } from "@/lib/biography";
import { BiographyPageModel } from "@/models/biography-page.model";
import AdminBiographyForm from "./admin-biography-form";

export type UpdateBiographyPageFormState = {
  error: string | null;
  success: string | null;
  successId: number | null;
};

async function updateBiographyPageAction(
  _: UpdateBiographyPageFormState,
  formData: FormData,
): Promise<UpdateBiographyPageFormState> {
  "use server";

  const title = formData.get("title");
  const content = formData.get("content");
  const mainImageUrl = formData.get("mainImageUrl");
  const mainImagePublicId = formData.get("mainImagePublicId");

  if (typeof title !== "string" || title.trim().length < 2) {
    return {
      error: "Заголовок должен содержать минимум 2 символа.",
      success: null,
      successId: null,
    };
  }

  if (typeof content !== "string" || content.trim().length < 10) {
    return {
      error: "Текст биографии должен содержать минимум 10 символов.",
      success: null,
      successId: null,
    };
  }

  if (
    typeof mainImageUrl !== "string" ||
    mainImageUrl.trim().length === 0
  ) {
    return {
      error: "Нужно загрузить или сохранить главное изображение.",
      success: null,
      successId: null,
    };
  }

  if (
    typeof mainImagePublicId !== "string" ||
    mainImagePublicId.trim().length === 0
  ) {
    return {
      error: "Не найден publicId изображения.",
      success: null,
      successId: null,
    };
  }

  await connectToDatabase();

  const existingBiographyPage = await BiographyPageModel.findOne().exec();
  const previousImagePublicId = existingBiographyPage?.mainImage?.publicId ?? null;

  await BiographyPageModel.findOneAndUpdate(
    {},
    {
      title: title.trim(),
      content: content.trim(),
      mainImage: {
        url: mainImageUrl.trim(),
        publicId: mainImagePublicId.trim(),
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  const nextImagePublicId = mainImagePublicId.trim();

  if (
    previousImagePublicId &&
    previousImagePublicId !== nextImagePublicId &&
    !previousImagePublicId.startsWith("default/")
  ) {
    await deleteCloudinaryAsset(previousImagePublicId, "image");
  }

  revalidatePath("/biography");

  return {
    error: null,
    success: "Изменения сохранены.",
    successId: Date.now(),
  };
}

export default async function AdminBiographyPage() {
  const biographyPage = await getOrCreateBiographyPage();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Биография
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Здесь можно редактировать страницу биографии: заголовок, основной
            текст и главное изображение.
          </p>
        </div>
      </section>

      <AdminBiographyForm
        action={updateBiographyPageAction}
        initialValues={{
          title: biographyPage.title,
          content: biographyPage.content,
          mainImageUrl: biographyPage.mainImage?.url ?? "",
          mainImagePublicId: biographyPage.mainImage?.publicId ?? "",
        }}
      />
    </div>
  );
}