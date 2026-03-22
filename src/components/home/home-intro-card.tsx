type HomeIntroCardProps = {
  title: string;
  introText: string;
  shortBiography: string;
  heroImageUrl: string;
};

export function HomeIntroCard({
  title,
  introText,
  shortBiography,
  heroImageUrl,
}: HomeIntroCardProps) {
  return (
    <section className="w-full rounded-3xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="grid w-full items-center gap-6 md:grid-cols-[320px_1fr]">
        <div className="w-full">
          <img
            src={heroImageUrl}
            alt={title}
            className="block h-[320px] w-full rounded-2xl object-cover"
          />
        </div>

        <div className="w-full space-y-4 text-left">
          <h2 className="text-3xl font-bold text-fg">{title}</h2>

          <p className="text-base text-fg">{introText}</p>

          <p className="text-sm leading-6 text-muted-foreground">
            {shortBiography}
          </p>
        </div>
      </div>
    </section>
  );
}