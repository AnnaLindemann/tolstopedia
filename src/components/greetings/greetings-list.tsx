import type { Greeting } from "@/types/greeting";
import { GreetingCard } from "./greeting-card";

type Props = {
  greetings: Greeting[];
};

export function GreetingsList({ greetings }: Props) {
  if (greetings.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Пока нет поздравлений
      </p>
    );
  }

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {greetings.map((greeting) => (
        <GreetingCard key={greeting.id} greeting={greeting} />
      ))}
    </div>
  );
}