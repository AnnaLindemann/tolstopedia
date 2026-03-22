"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type EditGreetingFormValues = {
  id: string;
  token: string;
  name: string;
  relation: string;
  message: string;
  externalVideoUrl: string;
  externalVideoPreviewImageUrl: string;
};

type EditGreetingResponse = {
  ok: boolean;
  message: string;
  greeting?: {
    id: string;
    name: string;
    relation: string;
    message: string;
    externalVideoUrl: string;
    externalVideoPreviewImageUrl: string;
  };
};

type DeleteGreetingResponse = {
  ok: boolean;
  message: string;
};

type EditGreetingFormProps = {
  initialValues: EditGreetingFormValues;
};

export function EditGreetingForm({
  initialValues,
}: EditGreetingFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [relation, setRelation] = useState(initialValues.relation);
  const [message, setMessage] = useState(initialValues.message);
  const [externalVideoUrl, setExternalVideoUrl] = useState(
    initialValues.externalVideoUrl,
  );
  const [
    externalVideoPreviewImageUrl,
    setExternalVideoPreviewImageUrl,
  ] = useState(initialValues.externalVideoPreviewImageUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSavedState, setShowSavedState] = useState(false);
  const [showDeletedState, setShowDeletedState] = useState(false);

  const trimmedMessage = useMemo(() => message.trim(), [message]);
  const trimmedExternalVideoUrl = useMemo(
    () => externalVideoUrl.trim(),
    [externalVideoUrl],
  );

  const canSubmit =
    !isSubmitting &&
    !isDeleting &&
    (trimmedMessage.length > 0 || trimmedExternalVideoUrl.length > 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!trimmedMessage && !trimmedExternalVideoUrl) {
      setErrorMessage(
        "Оставьте хотя бы текст поздравления или ссылку на внешнее видео.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/greetings/${initialValues.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: initialValues.token,
          name,
          relation,
          message,
          externalVideoUrl,
          externalVideoPreviewImageUrl,
        }),
      });

      const data = (await response.json()) as EditGreetingResponse;

      if (!response.ok || !data.ok) {
        setErrorMessage(
          data.message || "Не удалось сохранить изменения. Попробуйте ещё раз.",
        );
        return;
      }

      if (data.greeting) {
        setName(data.greeting.name);
        setRelation(data.greeting.relation);
        setMessage(data.greeting.message);
        setExternalVideoUrl(data.greeting.externalVideoUrl);
        setExternalVideoPreviewImageUrl(
          data.greeting.externalVideoPreviewImageUrl,
        );
      }

      setShowSavedState(true);
    } catch {
      setErrorMessage("Не удалось сохранить изменения. Проверьте соединение.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить поздравление? Это действие нельзя отменить.",
    );

    if (!isConfirmed) {
      return;
    }

    setErrorMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/greetings/${initialValues.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: initialValues.token,
        }),
      });

      const data = (await response.json()) as DeleteGreetingResponse;

      if (!response.ok || !data.ok) {
        setErrorMessage(
          data.message || "Не удалось удалить поздравление. Попробуйте ещё раз.",
        );
        return;
      }

      setShowDeletedState(true);
    } catch {
      setErrorMessage(
        "Не удалось удалить поздравление. Проверьте соединение.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleContinueEditing() {
    setErrorMessage("");
    setShowSavedState(false);
  }

  if (showDeletedState) {
    return (
      <section className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
        <p className="text-sm text-neutral-500">Редактирование поздравления</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
          Поздравление удалено
        </h2>
        <p className="mt-3 text-base leading-7 text-neutral-700">
          Ваше поздравление было удалено. Оно больше не будет показываться на
          сайте.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            На главную
          </Link>
        </div>
      </section>
    );
  }

  if (showSavedState) {
    return (
      <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm text-emerald-700">Редактирование поздравления</p>
        <h2 className="mt-2 text-2xl font-semibold text-emerald-900">
          Изменения сохранены
        </h2>
        <p className="mt-3 text-base leading-7 text-emerald-800">
          Ваше поздравление успешно обновлено. Если нужно, вы можете ещё раз
          открыть форму и внести дополнительные правки.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleContinueEditing}
            className="inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Редактировать ещё
          </button>

          <Link
            href="/"
            className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Закрыть
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-neutral-900"
        >
          Ваше имя
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Например, Анна"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="relation"
          className="text-sm font-medium text-neutral-900"
        >
          Кем вы приходитесь
        </label>
        <input
          id="relation"
          name="relation"
          type="text"
          value={relation}
          onChange={(event) => setRelation(event.target.value)}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Например, дочь, подруга, коллега"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-sm font-medium text-neutral-900"
        >
          Текст поздравления
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={6}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Напишите поздравление"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="externalVideoUrl"
          className="text-sm font-medium text-neutral-900"
        >
          Ссылка на видео
        </label>
        <input
          id="externalVideoUrl"
          name="externalVideoUrl"
          type="url"
          value={externalVideoUrl}
          onChange={(event) => setExternalVideoUrl(event.target.value)}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="externalVideoPreviewImageUrl"
          className="text-sm font-medium text-neutral-900"
        >
          Ссылка на превью видео
        </label>
        <input
          id="externalVideoPreviewImageUrl"
          name="externalVideoPreviewImageUrl"
          type="url"
          value={externalVideoPreviewImageUrl}
          onChange={(event) =>
            setExternalVideoPreviewImageUrl(event.target.value)
          }
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="https://..."
        />
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
        Можно изменить имя, подпись, текст поздравления и ссылки на внешнее
        видео. Загруженные файлы пока не редактируются.
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting}
          className="inline-flex rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Удаляем..." : "Удалить поздравление"}
        </button>
      </div>
    </form>
  );
}