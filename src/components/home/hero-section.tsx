export function HeroSection() {
  return (
    <section className="grid gap-6 md:grid-cols-2 items-center">
      <div>
        <img
          src="/mom.jpg"
          alt="Mom"
          className="w-full max-w-md rounded-2xl object-cover"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-fg mb-4">
          Поздравляем нашу маму ❤️
        </h1>

        <p className="text-muted-foreground mb-6">
          Здесь вы можете оставить тёплые слова, воспоминания и поздравления.
        </p>

        <button className="btn">
          Добавить поздравление
        </button>
      </div>
    </section>
  );
}