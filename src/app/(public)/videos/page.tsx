import { getPublishedVideoItems } from "@/lib/videos";

function formatDuration(duration: number | null): string | null {
  if (duration === null || duration <= 0) {
    return null;
  }

  const totalSeconds = Math.round(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default async function VideosPage() {
  const items = await getPublishedVideoItems();

  const clips = items.filter((item) => item.uploadedVideo !== null);
  const films = items.filter((item) => item.externalVideo !== null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-semibold text-neutral-900">Видео</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Здесь собраны короткие ролики и ссылки на большие фильмы.
        </p>
      </section>

      <section className="mb-12">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-neutral-900">Ролики</h2>
                </div>

        {clips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
            Пока нет роликов.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clips.map((item) => {
              const duration = formatDuration(
                item.uploadedVideo?.duration ?? null,
              );

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                >
                  <div className="aspect-video bg-black">
                    <video
                      src={item.uploadedVideo?.url}
                      controls
                      preload="metadata"
                      className="h-full w-full"
                    />
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="text-sm font-medium text-neutral-900">
                      {item.title ?? "Без названия"}
                    </p>

                    {duration ? (
                      <p className="text-xs text-neutral-500">
                        Длительность: {duration}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-neutral-900">Фильмы</h2>         
        </div>

        {films.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
            Пока нет фильмов.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {films.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <p className="mb-3 text-base font-medium text-neutral-900">
                    {item.title ?? "Видео"}
                  </p>
                 
                </div>

                <div className="mt-5">
                  <a
                    href={item.externalVideo?.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-neutral-300 bg-rose-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Смотреть видео
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}