"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminGreetingEditFormProps = {
  greeting: {
    id: string;
    name: string;
    relation: string | null;
    message: string | null;
    isHidden: boolean;
  };
};

type UpdateGreetingResponse =
  | {
      ok: true;
      data: {
        id: string;
        name: string;
        relation: string | null;
        message: string | null;
        isHidden: boolean;
        updatedAt: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

export default function AdminGreetingEditForm({
  greeting,
}: AdminGreetingEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(greeting.name);
  const [relation, setRelation] = useState(greeting.relation ?? "");
  const [message, setMessage] = useState(greeting.message ?? "");
  const [isHidden, setIsHidden] = useState(greeting.isHidden);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/greetings/${greeting.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          relation,
          message,
          isHidden,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response");
      }

      const data = (await response.json()) as UpdateGreetingResponse;

      if (!data.ok) {
        setError(data.error);
        return;
      }

      router.push("/admin/greetings");
      router.refresh();
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Save request failed";

      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-neutral-800"
        >
          Имя
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
          maxLength={80}
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="relation"
          className="block text-sm font-medium text-neutral-800"
        >
          Кем приходится
        </label>
        <input
          id="relation"
          type="text"
          value={relation}
          onChange={(event) => setRelation(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
          maxLength={80}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-neutral-800"
        >
          Текст поздравления
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-[180px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500"
          maxLength={3000}
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={isHidden}
          onChange={(event) => setIsHidden(event.target.checked)}
          className="h-4 w-4"
        />
        Скрыть это поздравление на публичном сайте
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/greetings")}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}