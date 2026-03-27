"use client";

import { useState } from "react";

import type { GetLatestGreetingsResult, Greeting, GreetingsCursor } from "@/types/greeting";
import { GreetingsList } from "./greetings-list";

type Props = {
  initialGreetings: Greeting[];
  initialCursor: GreetingsCursor;
  initialHasMore: boolean;
};

export function GreetingsFeed({
  initialGreetings,
  initialCursor,
  initialHasMore,
}: Props) {
  const [greetings, setGreetings] = useState<Greeting[]>(initialGreetings);
  const [nextCursor, setNextCursor] = useState<GreetingsCursor>(initialCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLoadMore() {
    if (!hasMore || !nextCursor || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/greetings?limit=10&cursor=${encodeURIComponent(nextCursor)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load more greetings");
      }

      const data = (await response.json()) as GetLatestGreetingsResult;

      setGreetings((currentGreetings) => [...currentGreetings, ...data.items]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setError("Не удалось загрузить ещё поздравления");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex w-full flex-col items-center gap-6">
      <div className="w-full">
        <GreetingsList greetings={greetings} />
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {hasMore ? (
        <div className="flex w-full justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-fg shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Загрузка..." : "Показать ещё"}
          </button>
        </div>
      ) : null}
    </section>
  );
}