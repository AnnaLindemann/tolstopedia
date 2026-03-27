import { HomeIntroCard } from "@/components/home/home-intro-card";
import { AddGreetingDialog } from "@/components/greetings/add-greeting-dialog";
import { GreetingsFeed } from "@/components/greetings/greetings-feed";
import { getLatestGreetings } from "@/lib/greetings/get-latest-greetings";
import { getMomPage } from "@/features/mom-page/server/get-mom-page";

export default async function HomePage() {
  const [greetingsResult, momPage] = await Promise.all([
    getLatestGreetings({ limit: 10 }),
    getMomPage(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex w-full flex-col items-center gap-8">
        <div className="w-full">
          {momPage ? (
            <HomeIntroCard
              title={momPage.title}
              introText={momPage.introText}
              shortBiography={momPage.shortBiography}
              heroImageUrl={momPage.heroImage.url}
            />
          ) : (
            <section className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-fg">
                Страница пока заполняется
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Данные для блока о маме ещё не добавлены в базу.
              </p>
            </section>
          )}
        </div>

        <div className="flex w-full justify-center">
          <AddGreetingDialog />
        </div>

        <GreetingsFeed
          initialGreetings={greetingsResult.items}
          initialCursor={greetingsResult.nextCursor}
          initialHasMore={greetingsResult.hasMore}
        />
      </div>
    </main>
  );
}