import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/db";
import { getOrCreateMomPage } from "@/lib/mom-page";
import { MomPageModel } from "@/models/mom-page.model";
import AdminMomPageForm from "./admin-mom-page-form";

export type UpdateMomPageFormState = {
  error: string | null;
  success: string | null;
  successId: number | null;
};

async function updateMomPageAction(
  _: UpdateMomPageFormState,
  formData: FormData,
): Promise<UpdateMomPageFormState> {
  "use server";

  const title = formData.get("title");
  const introText = formData.get("introText");
  const shortBiography = formData.get("shortBiography");
  const heroImageUrl = formData.get("heroImageUrl");
  const heroImagePublicId = formData.get("heroImagePublicId");

  if (typeof title !== "string" || title.trim().length < 2) {
    return {
      error: "Заголовок должен содержать минимум 2 символа.",
      success: null,
      successId: null,
    };
  }

  if (typeof introText !== "string" || introText.trim().length < 10) {
    return {
      error: "Вводный текст должен содержать минимум 10 символов.",
      success: null,
      successId: null,
    };
  }

  if (
    typeof shortBiography !== "string" ||
    shortBiography.trim().length < 10
  ) {
    return {
      error: "Биография должна содержать минимум 10 символов.",
      success: null,
      successId: null,
    };
  }

  if (typeof heroImageUrl !== "string" || heroImageUrl.trim().length === 0) {
    return {
      error: "Нужно загрузить или сохранить главное изображение.",
      success: null,
      successId: null,
    };
  }

  if (
    typeof heroImagePublicId !== "string" ||
    heroImagePublicId.trim().length === 0
  ) {
    return {
      error: "Не найден publicId изображения.",
      success: null,
      successId: null,
    };
  }

  await connectToDatabase();

  await MomPageModel.findOneAndUpdate(
    {},
    {
      title: title.trim(),
      introText: introText.trim(),
      shortBiography: shortBiography.trim(),
      heroImage: {
        url: heroImageUrl.trim(),
        publicId: heroImagePublicId.trim(),
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  revalidatePath("/");

  return {
    error: null,
    success: "Изменения сохранены.",
    successId: Date.now(),
  };
}

export default async function AdminMomPagePage() {
  const momPage = await getOrCreateMomPage();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Страница мамы
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Здесь можно редактировать главный контент страницы мамы: заголовок,
            вводный текст, краткую биографию и главное изображение.
          </p>
        </div>
      </section>

      <AdminMomPageForm
        action={updateMomPageAction}
        initialValues={{
          title: momPage.title,
          introText: momPage.introText,
          shortBiography: momPage.shortBiography,
          heroImageUrl: momPage.heroImage.url,
          heroImagePublicId: momPage.heroImage.publicId,
        }}
      />
    </div>
  );
}