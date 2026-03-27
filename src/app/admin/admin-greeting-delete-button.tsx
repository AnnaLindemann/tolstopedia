"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminGreetingDeleteButtonProps = {
  greetingId: string;
  greetingName: string;
};

type DeleteGreetingResponse =
  | {
      ok: true;
      data: {
        id: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

export default function AdminGreetingDeleteButton({
  greetingId,
  greetingName,
}: AdminGreetingDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const isConfirmed = window.confirm(
      `Удалить поздравление от "${greetingName}"?`
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/greetings/${greetingId}`, {
        method: "DELETE",
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response");
      }

      const data = (await response.json()) as DeleteGreetingResponse;

      if (!data.ok) {
        throw new Error(data.error);
      }

      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";

      window.alert(`Не удалось удалить поздравление: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "Удаление..." : "Удалить"}
    </button>
  );
}