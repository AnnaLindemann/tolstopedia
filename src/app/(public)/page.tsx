import { HomeIntroCard } from "@/components/home/home-intro-card";
import { GreetingsList } from "@/components/greetings/greetings-list";
import { AddGreetingDialog } from "@/components/greetings/add-greeting-dialog";
import { getLatestGreetings } from "@/lib/greetings/get-latest-greetings";

export default async function HomePage() {
  const greetings = await getLatestGreetings();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <div className="flex w-full flex-col items-center gap-8">
        <div className="w-full">
          <HomeIntroCard />
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