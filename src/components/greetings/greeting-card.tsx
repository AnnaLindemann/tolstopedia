import type { Greeting } from "@/types/greeting";

type Props = {
  greeting: Greeting;
};

export function GreetingCard({ greeting }: Props) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border p-4 bg-card shadow-sm">
      <div className="mb-2">
        <p className="break-words font-semibold text-fg">{greeting.name}</p>
        {greeting.relation && (
          <p className="break-words text-sm text-muted-foreground">{greeting.relation}</p>
        )}
      </div>

      {greeting.message && (
        <p className="break-words text-sm text-fg line-clamp-4 whitespace-pre-line">
          {greeting.message}
        </p>
      )}

      {greeting.photoUrl && (
        <div className="mt-3">
          <img
            src={greeting.photoUrl}
            alt="greeting photo"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* MVP: video later */}
    </div>
  );
}