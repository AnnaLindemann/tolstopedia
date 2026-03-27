import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";

import GreetingModel from "@/models/greeting.model";
import { connectToDatabase } from "@/lib/db";
import AdminGreetingEditForm from "@/app/admin/admin-greeting-edit-form";

type EditGreetingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type GreetingEditData = {
  id: string;
  name: string;
  relation: string | null;
  message: string | null;
  isHidden: boolean;
  hasPhoto: boolean;
  hasUploadedVideo: boolean;
  hasExternalVideo: boolean;
};

async function getGreetingById(id: string): Promise<GreetingEditData | null> {
  if (!isValidObjectId(id)) {
    return null;
  }

  await connectToDatabase();

  const greeting = await GreetingModel.findById(id)
    .select({
      name: 1,
      relation: 1,
      message: 1,
      isHidden: 1,
      photo: 1,
      uploadedVideo: 1,
      externalVideo: 1,
    })
    .lean<{
      _id: { toString(): string };
      name: string;
      relation: string | null;
      message: string | null;
      isHidden: boolean;
      photo?: { url: string } | null;
      uploadedVideo?: { url: string } | null;
      externalVideo?: { url: string } | null;
    } | null>();

  if (!greeting) {
    return null;
  }

  return {
    id: greeting._id.toString(),
    name: greeting.name,
    relation: greeting.relation ?? null,
    message: greeting.message ?? null,
    isHidden: greeting.isHidden,
    hasPhoto: Boolean(greeting.photo?.url),
    hasUploadedVideo: Boolean(greeting.uploadedVideo?.url),
    hasExternalVideo: Boolean(greeting.externalVideo?.url),
  };
}

export default async function EditGreetingPage({
  params,
}: EditGreetingPageProps) {
  const { id } = await params;
  const greeting = await getGreetingById(id);

  if (!greeting) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-neutral-900">
          Редактирование поздравления
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Здесь можно изменить имя, подпись, текст и статус видимости.
        </p>
      </section>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900">
          Медиа в этом поздравлении
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
            Фото: {greeting.hasPhoto ? "да" : "нет"}
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
            Загруженное видео: {greeting.hasUploadedVideo ? "да" : "нет"}
          </span>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700">
            Внешняя ссылка: {greeting.hasExternalVideo ? "да" : "нет"}
          </span>
        </div>
      </div>

      <AdminGreetingEditForm
        greeting={{
          id: greeting.id,
          name: greeting.name,
          relation: greeting.relation,
          message: greeting.message,
          isHidden: greeting.isHidden,
        }}
      />
    </div>
  );
}