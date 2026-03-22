import Link from "next/link";

import { EditGreetingForm } from "@/components/greetings/edit-greeting-form";
import { verifyGreetingEditAccess } from "@/features/greetings/server/verify-greeting-edit-access";

type EditGreetingPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function EditGreetingPage({
  params,
  searchParams,
}: EditGreetingPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const result = await verifyGreetingEditAccess({
    greetingId: id,
    token: token ?? "",
  });

  if (!result.ok) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-10">
        <section className="w-full rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">Редактирование поздравления</p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
            Не удалось открыть страницу
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-700">
            {result.message}
          </p>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex rounded-full border px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Вернуться на главную
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-500">Редактирование поздравления</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          Вы можете отредактировать своё поздравление
        </h1>
        <p className="mt-3 text-base leading-7 text-neutral-700">
          Сейчас можно изменить имя, подпись, текст поздравления и ссылки на
          внешнее видео. Загруженные фото и видео пока доступны только для
          просмотра.
        </p>

        <EditGreetingForm
          initialValues={{
            id: result.greeting.id,
            token: token ?? "",
            name: result.greeting.name,
            relation: result.greeting.relation,
            message: result.greeting.message,
            photoUrl: result.greeting.photoUrl,
            uploadedVideoUrl: result.greeting.uploadedVideoUrl,
            externalVideoUrl: result.greeting.externalVideoUrl,
            externalVideoPreviewImageUrl:
              result.greeting.externalVideoPreviewImageUrl,
          }}
        />
      </section>
    </main>
  );
}