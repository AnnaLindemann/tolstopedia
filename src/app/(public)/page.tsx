import { HomeIntroCard } from "@/components/home/home-intro-card";
import { GreetingsList } from "@/components/greetings/greetings-list";
import { AddGreetingDialog } from "@/components/greetings/add-greeting-dialog";
import { getLatestGreetings } from "@/lib/greetings/get-latest-greetings";
import { getMomPage } from "@/features/mom-page/server/get-mom-page";

export default async function HomePage() {
  const [greetings, momPage] = await Promise.all([
    getLatestGreetings(),
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

        <section className="flex w-full flex-col items-center gap-6">
          <div className="w-full">
            <GreetingsList greetings={greetings} />
          </div>

          <div className="flex w-full justify-center">
            <button
              type="button"
              className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-fg shadow-sm transition hover:bg-muted"
            >
              Показать ещё
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}