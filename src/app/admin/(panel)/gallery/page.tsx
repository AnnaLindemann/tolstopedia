import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/db";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { createGalleryItem, getAdminGalleryItems } from "@/lib/gallery";
import { GalleryItemModel } from "@/models/gallery-item.model";
import AdminGalleryForm from "./admin-gallery-form";
import GalleryAdminList from "./gallery-admin-list";

export const dynamic = "force-dynamic";

export type CreateGalleryItemFormState = {
  error: string | null;
  success: string | null;
};

async function createGalleryItemAction(
  _: CreateGalleryItemFormState,
  formData: FormData,
): Promise<CreateGalleryItemFormState> {
  "use server";

  const titleValue = formData.get("title");
  const imageUrlValue = formData.get("imageUrl");
  const imagePublicIdValue = formData.get("imagePublicId");

  if (typeof imageUrlValue !== "string" || imageUrlValue.trim().length === 0) {
    return {
      error: "Нужно загрузить изображение.",
      success: null,
    };
  }

  if (
    typeof imagePublicIdValue !== "string" ||
    imagePublicIdValue.trim().length === 0
  ) {
    return {
      error: "Не удалось получить publicId изображения.",
      success: null,
    };
  }

  if (titleValue !== null && typeof titleValue !== "string") {
    return {
      error: "Некорректный title.",
      success: null,
    };
  }

  const normalizedTitle =
    typeof titleValue === "string" && titleValue.trim().length > 0
      ? titleValue.trim()
      : null;

  if (normalizedTitle !== null && normalizedTitle.length > 120) {
    return {
      error: "Title не должен быть длиннее 120 символов.",
      success: null,
    };
  }

  await createGalleryItem({
    title: normalizedTitle,
    image: {
      url: imageUrlValue.trim(),
      publicId: imagePublicIdValue.trim(),
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return {
    error: null,
    success: "Элемент галереи добавлен.",
  };
}

async function updateGalleryItemTitleAction(
  id: string,
  title: string,
): Promise<void> {
  "use server";

  const normalizedId = id.trim();
  const normalizedTitle = title.trim();

  if (!normalizedId) {
    return;
  }

  if (normalizedTitle.length > 120) {
    return;
  }

  await connectToDatabase();

  await GalleryItemModel.updateOne(
    { _id: normalizedId },
    {
      title: normalizedTitle.length > 0 ? normalizedTitle : null,
    },
  ).exec();

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

async function deleteGalleryItemAction(id: string): Promise<void> {
  "use server";

  const normalizedId = id.trim();

  if (!normalizedId) {
    return;
  }

  await connectToDatabase();

  const item = await GalleryItemModel.findById(normalizedId).exec();

  if (!item) {
    return;
  }

  await deleteCloudinaryAsset(item.image.publicId, "image");
  await GalleryItemModel.deleteOne({ _id: normalizedId }).exec();

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export default async function AdminGalleryPage() {
  const items = await getAdminGalleryItems();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-neutral-900">Галерея</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Здесь можно загрузить фото, менять порядок, редактировать title,
          удалять элемент и проверять, как он выглядит.
        </p>
      </section>

      <AdminGalleryForm action={createGalleryItemAction} />

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-neutral-900">
            Добавленные элементы
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Сейчас в галерее: {items.length}
          </p>
        </div>

        <GalleryAdminList
          items={items}
          onDelete={deleteGalleryItemAction}
          onUpdateTitle={updateGalleryItemTitleAction}
        />
      </section>
    </div>
  );
}