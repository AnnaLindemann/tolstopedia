export function HomeIntroCard() {
  return (
    <section className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="grid w-full items-center gap-6 md:grid-cols-[320px_1fr]">
        <div className="w-full">
          <img
            src="/mom.jpg"
            alt="Mom"
            className="block h-[320px] w-full rounded-2xl object-cover"
          />
        </div>

        <div className="w-full space-y-4 text-left">
          <h1 className="text-3xl font-bold text-fg">
            Поздравляем нашу маму ❤️
          </h1>

          <p className="text-base text-fg">
            Здесь можно оставить тёплые слова, поздравления, воспоминания,
            фотографии и видео для нашей мамы.
          </p>

          <p className="text-sm leading-6 text-muted-foreground">
            Этот сайт создан как семейная страница с поздравлениями, добрыми
            словами и памятными моментами от близких и друзей.
          </p>
        </div>
      </div>
    </section>
  );
}