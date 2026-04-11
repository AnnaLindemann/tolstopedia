import Link from "next/link";
import { revalidatePath } from "next/cache";

import GreetingModel from "@/models/greeting.model";
import { connectToDatabase } from "@/lib/db";
import AdminGreetingDeleteButton from "../../admin-greeting-delete-button";

export const dynamic = "force-dynamic";

type AdminGreetingItem = {
  id: string;
  name: string;
  relation: string | null;
  message: string | null;
  hasPhoto: boolean;
  hasUploadedVideo: boolean;
  hasExternalVideo: boolean;
  isHidden: boolean;
  createdAt: string;
};

type GreetingLeanDocument = {
  _id: { toString(): string };
  name: string;
  relation: string | null;
  message: string | null;
  photo?: { url: string } | null;
  uploadedVideo?: { url: string } | null;
  externalVideo?: { url: string } | null;
  isHidden: boolean;
  createdAt: Date;
};

function formatGreetingDate(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

async function getGreetings(): Promise<AdminGreetingItem[]> {
  await connectToDatabase();

  const greetings = await GreetingModel.find()
    .sort({ createdAt: -1 })
    .select({
      name: 1,
      relation: 1,
      message: 1,
      photo: 1,
      uploadedVideo: 1,
      externalVideo: 1,
      isHidden: 1,
      createdAt: 1,
    })
    .lean<GreetingLeanDocument[]>();

  return greetings.map((greeting) => ({
    id: greeting._id.toString(),
    name: greeting.name,
    relation: greeting.relation ?? null,
    message: greeting.message ?? null,
    hasPhoto: Boolean(greeting.photo?.url),
    hasUploadedVideo: Boolean(greeting.uploadedVideo?.url),
    hasExternalVideo: Boolean(greeting.externalVideo?.url),
    isHidden: greeting.isHidden,
    createdAt: greeting.createdAt.toISOString(),
  }));
}

async function toggleGreetingVisibility(formData: FormData): Promise<void> {
  "use server";

  const greetingId = formData.get("greetingId");
  const nextHiddenValue = formData.get("nextHiddenValue");

  if (typeof greetingId !== "string" || greetingId.trim().length === 0) {
    throw new Error("Greeting id is required");
  }

  if (
    typeof nextHiddenValue !== "string" ||
    (nextHiddenValue !== "true" && nextHiddenValue !== "false")
  ) {
    throw new Error("Invalid hidden value");
  }

  await connectToDatabase();

  await GreetingModel.findByIdAndUpdate(greetingId, {
    isHidden: nextHiddenValue === "true",
  });

  revalidatePath("/admin/greetings");
}

function getMediaBadgeText(
  label: string,
  value: boolean,
  positiveText = "есть",
  negativeText = "нет",
): string {
  return `${label}: ${value ? positiveText : negativeText}`;
}

export default async function AdminGreetingsPage() {
  const greetings = await getGreetings();

  const totalCount = greetings.length;
  const hiddenCount = greetings.filter((greeting) => greeting.isHidden).length;
  const visibleCount = totalCount - hiddenCount;

  return (
    <div className="space-y-6">
 <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div className="space-y-5">
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Поздравления
      </h1>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Здесь отображаются все поздравления из базы данных. Админ может
        открыть или скрыть поздравление без удаления записи.
      </p>
    </div>

    <div className="flex flex-wrap gap-3">
      <div className="flex min-w-[180px] items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-600">Всего</span>
        <span className="text-lg font-semibold text-neutral-900">{totalCount}</span>
      </div>

      <div className="flex min-w-[180px] items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-600">Опубликованные</span>
        <span className="text-lg font-semibold text-neutral-900">{visibleCount}</span>
      </div>

      <div className="flex min-w-[180px] items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-600">Скрытые</span>
        <span className="text-lg font-semibold text-neutral-900">{hiddenCount}</span>
      </div>
    </div>
  </div>
</section>

      {greetings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-neutral-600">Поздравлений пока нет.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {greetings.map((greeting) => {
            const nextHiddenValue = (!greeting.isHidden).toString();

            return (
              <article
                key={greeting.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-neutral-900">
                          {greeting.name}
                        </h2>

                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            greeting.isHidden
                              ? "border border-amber-200 bg-amber-50 text-amber-800"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {greeting.isHidden ? "Скрыто" : "Опубликовано"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <span>{formatGreetingDate(greeting.createdAt)}</span>

                        {greeting.relation ? (
                          <>
                            <span>•</span>
                            <span>{greeting.relation}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                        {getMediaBadgeText("Фото", greeting.hasPhoto, "да", "нет")}
                      </span>

                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                        {getMediaBadgeText(
                          "Видео",
                          greeting.hasUploadedVideo,
                          "загружено",
                          "нет",
                        )}
                      </span>

                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                        {getMediaBadgeText("Ссылка", greeting.hasExternalVideo, "да", "нет")}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                      {greeting.message ?? "Текст поздравления отсутствует."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/greetings/${greeting.id}/edit`}
                      className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Редактировать
                    </Link>

                    <form action={toggleGreetingVisibility}>
                      <input type="hidden" name="greetingId" value={greeting.id} />
                      <input
                        type="hidden"
                        name="nextHiddenValue"
                        value={nextHiddenValue}
                      />
                      <button
                        type="submit"
                        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${
                          greeting.isHidden
                            ? "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                            : "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                        }`}
                      >
                        {greeting.isHidden ? "Открыть" : "Скрыть"}
                      </button>
                    </form>

                    <AdminGreetingDeleteButton
                      greetingId={greeting.id}
                      greetingName={greeting.name}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}