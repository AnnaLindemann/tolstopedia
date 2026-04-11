import { revalidatePath } from "next/cache";

import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { createVideoItem, getAdminVideoItems } from "@/lib/videos";
import { VideoItemModel } from "@/models/video-item.model";
import AdminVideosForm from "./admin-videos-form";
import VideosAdminList from "./videos-admin-list";

export const dynamic = "force-dynamic";

export type CreateVideoItemFormState = {
  error: string | null;
  success: string | null;
};

async function createVideoItemAction(
  _: CreateVideoItemFormState,
  formData: FormData,
): Promise<CreateVideoItemFormState> {
  "use server";

  const titleValue = formData.get("title");
  const videoTypeValue = formData.get("videoType");
  const uploadedVideoUrlValue = formData.get("uploadedVideoUrl");
  const uploadedVideoPublicIdValue = formData.get("uploadedVideoPublicId");
  const uploadedVideoDurationValue = formData.get("uploadedVideoDuration");
  const externalVideoUrlValue = formData.get("externalVideoUrl");

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

  if (
    videoTypeValue !== "uploaded" &&
    videoTypeValue !== "external"
  ) {
    return {
      error: "Некорректный тип видео.",
      success: null,
    };
  }

  if (videoTypeValue === "uploaded") {
    if (
      typeof uploadedVideoUrlValue !== "string" ||
      uploadedVideoUrlValue.trim().length === 0
    ) {
      return {
        error: "Нужно загрузить видео.",
        success: null,
      };
    }

    if (
      typeof uploadedVideoPublicIdValue !== "string" ||
      uploadedVideoPublicIdValue.trim().length === 0
    ) {
      return {
        error: "Не удалось получить publicId видео.",
        success: null,
      };
    }

    const duration =
      typeof uploadedVideoDurationValue === "string" &&
      uploadedVideoDurationValue.trim().length > 0
        ? Number(uploadedVideoDurationValue)
        : null;

    await createVideoItem({
      title: normalizedTitle,
      uploadedVideo: {
        url: uploadedVideoUrlValue.trim(),
        publicId: uploadedVideoPublicIdValue.trim(),
        duration: Number.isFinite(duration) ? duration : null,
      },
      externalVideo: null,
    });
  }

  if (videoTypeValue === "external") {
    if (
      typeof externalVideoUrlValue !== "string" ||
      externalVideoUrlValue.trim().length === 0
    ) {
      return {
        error: "Нужно указать ссылку на видео.",
        success: null,
      };
    }

    try {
      new URL(externalVideoUrlValue.trim());
    } catch {
      return {
        error: "Ссылка на видео некорректна.",
        success: null,
      };
    }

    await createVideoItem({
      title: normalizedTitle,
      uploadedVideo: null,
      externalVideo: {
        url: externalVideoUrlValue.trim(),
      },
    });
  }

  revalidatePath("/videos");
  revalidatePath("/admin/videos");

  return {
    error: null,
    success: "Видео добавлено.",
  };
}

async function updateVideoItemTitleAction(
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

  await VideoItemModel.updateOne(
    { _id: normalizedId },
    {
      title: normalizedTitle.length > 0 ? normalizedTitle : null,
    },
  ).exec();

  revalidatePath("/videos");
  revalidatePath("/admin/videos");
}

async function deleteVideoItemAction(id: string): Promise<void> {
  "use server";

  const normalizedId = id.trim();

  if (!normalizedId) {
    return;
  }

  await connectToDatabase();

  const item = await VideoItemModel.findById(normalizedId).exec();

  if (!item) {
    return;
  }

  if (item.uploadedVideo?.publicId) {
    await deleteCloudinaryAsset(item.uploadedVideo.publicId, "video");
  }

  await VideoItemModel.deleteOne({ _id: normalizedId }).exec();

  revalidatePath("/videos");
  revalidatePath("/admin/videos");
}

export default async function AdminVideosPage() {
  const items = await getAdminVideoItems();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-neutral-900">Видео</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Здесь можно добавить короткие ролики или ссылки на большие фильмы,
          изменить title и удалить элемент.
        </p>
      </section>

      <AdminVideosForm action={createVideoItemAction} />

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-neutral-900">
            Добавленные элементы
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Сейчас в видеогалерее: {items.length}
          </p>
        </div>

        <VideosAdminList
          items={items}
          onDelete={deleteVideoItemAction}
          onUpdateTitle={updateVideoItemTitleAction}
        />
      </section>
    </div>
  );
}