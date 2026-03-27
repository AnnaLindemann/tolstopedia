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
  photoUrl?: string;
  uploadedVideoUrl?: string;
};

type UploadedAsset = {
  url: string;
  publicId: string;
};

type UploadResponse = {
  success: true;
  asset: UploadedAsset & {
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
    resourceType?: string;
    originalFilename?: string;
  };
};

type EditGreetingResponse = {
  ok: boolean;
  message: string;
  greeting?: {
    id: string;
    name: string;
    relation: string;
    message: string;
    photoUrl?: string;
    uploadedVideoUrl?: string;
    externalVideoUrl: string;
  };
};

type DeleteGreetingResponse = {
  ok: boolean;
  message: string;
};

type EditGreetingFormProps = {
  initialValues: EditGreetingFormValues;
};

function isUploadResponse(value: unknown): value is UploadResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.success !== true) {
    return false;
  }

  if (typeof candidate.asset !== "object" || candidate.asset === null) {
    return false;
  }

  const asset = candidate.asset as Record<string, unknown>;

  return (
    typeof asset.url === "string" &&
    asset.url.length > 0 &&
    typeof asset.publicId === "string" &&
    asset.publicId.length > 0
  );
}

async function uploadFile(params: {
  file: File;
  folder: string;
}): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("folder", params.folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Не удалось загрузить файл");
  }

  if (!isUploadResponse(data)) {
    throw new Error("Сервер вернул некорректный ответ при загрузке файла");
  }

  return {
    url: data.asset.url,
    publicId: data.asset.publicId,
  };
}

export function EditGreetingForm({
  initialValues,
}: EditGreetingFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [relation, setRelation] = useState(initialValues.relation);
  const [message, setMessage] = useState(initialValues.message);
  const [externalVideoUrl, setExternalVideoUrl] = useState(
    initialValues.externalVideoUrl,
  );

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(initialValues.photoUrl ?? "");
  const [currentUploadedVideoUrl, setCurrentUploadedVideoUrl] = useState(
    initialValues.uploadedVideoUrl ?? "",
  );

  const [clearPhoto, setClearPhoto] = useState(false);
  const [clearUploadedVideo, setClearUploadedVideo] = useState(false);

  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newUploadedVideoFile, setNewUploadedVideoFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSavedState, setShowSavedState] = useState(false);
  const [showDeletedState, setShowDeletedState] = useState(false);

  const trimmedName = useMemo(() => name.trim(), [name]);
  const trimmedRelation = useMemo(() => relation.trim(), [relation]);
  const trimmedMessage = useMemo(() => message.trim(), [message]);
  const trimmedExternalVideoUrl = useMemo(
    () => externalVideoUrl.trim(),
    [externalVideoUrl],
  );

  const willHavePhoto = !clearPhoto && (Boolean(newPhotoFile) || Boolean(currentPhotoUrl));
  const willHaveUploadedVideo =
    !clearUploadedVideo &&
    (Boolean(newUploadedVideoFile) || Boolean(currentUploadedVideoUrl));

  const hasAtLeastOneContent =
    trimmedMessage.length > 0 ||
    trimmedExternalVideoUrl.length > 0 ||
    willHavePhoto ||
    willHaveUploadedVideo;

  const canSubmit =
    !isSubmitting &&
    !isDeleting &&
    trimmedName.length > 0 &&
    hasAtLeastOneContent;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!trimmedName) {
      setErrorMessage("Введите имя.");
      return;
    }

    if (!hasAtLeastOneContent) {
      setErrorMessage(
        "Должно остаться хотя бы одно содержимое: текст, фото, загруженное видео или ссылка на внешнее видео.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedPhoto = newPhotoFile
        ? await uploadFile({
            file: newPhotoFile,
            folder: "mom-site/greetings/photos",
          })
        : null;

      const uploadedVideo = newUploadedVideoFile
        ? await uploadFile({
            file: newUploadedVideoFile,
            folder: "mom-site/greetings/videos",
          })
        : null;

      const response = await fetch(`/api/greetings/${initialValues.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: initialValues.token,
          name: trimmedName,
          relation: trimmedRelation,
          message: trimmedMessage,
          externalVideoUrl: trimmedExternalVideoUrl,
          clearPhoto,
          clearUploadedVideo,
          photo: uploadedPhoto,
          uploadedVideo: uploadedVideo,
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
        setCurrentPhotoUrl(data.greeting.photoUrl ?? "");
        setCurrentUploadedVideoUrl(data.greeting.uploadedVideoUrl ?? "");
      } else {
        if (clearPhoto) {
          setCurrentPhotoUrl("");
        }

        if (clearUploadedVideo) {
          setCurrentUploadedVideoUrl("");
        }
      }

      setClearPhoto(false);
      setClearUploadedVideo(false);
      setNewPhotoFile(null);
      setNewUploadedVideoFile(null);
      setShowSavedState(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Не удалось сохранить изменения. Проверьте соединение.");
      }
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

  function handleRemovePhoto(): void {
    setClearPhoto(true);
    setNewPhotoFile(null);
  }

  function handleUndoRemovePhoto(): void {
    setClearPhoto(false);
  }

  function handleRemoveUploadedVideo(): void {
    setClearUploadedVideo(true);
    setNewUploadedVideoFile(null);
  }

  function handleUndoRemoveUploadedVideo(): void {
    setClearUploadedVideo(false);
  }

  function handleNewPhotoChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    setNewPhotoFile(file);

    if (file) {
      setClearPhoto(false);
    }
  }

  function handleNewUploadedVideoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const file = event.target.files?.[0] ?? null;
    setNewUploadedVideoFile(file);

    if (file) {
      setClearUploadedVideo(false);
    }
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
        <label htmlFor="name" className="text-sm font-medium text-neutral-900">
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

      {currentPhotoUrl && !clearPhoto ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-900">Текущее фото</p>
          <img
            src={currentPhotoUrl}
            alt="Greeting photo"
            className="h-56 w-full rounded-2xl border border-neutral-200 object-cover"
          />

          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={isSubmitting || isDeleting}
            className="inline-flex rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Удалить фото
          </button>
        </div>
      ) : null}

      {currentPhotoUrl && clearPhoto ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Фото будет удалено после сохранения.
          <div className="mt-3">
            <button
              type="button"
              onClick={handleUndoRemovePhoto}
              disabled={isSubmitting || isDeleting}
              className="inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отменить удаление фото
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="newPhoto"
          className="text-sm font-medium text-neutral-900"
        >
          Загрузить новое фото
        </label>
        <input
          id="newPhoto"
          type="file"
          accept="image/*"
          onChange={handleNewPhotoChange}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
        />
        {newPhotoFile ? (
          <p className="text-sm text-neutral-600">
            Выбран файл: {newPhotoFile.name}
          </p>
        ) : null}
      </div>

      {currentUploadedVideoUrl && !clearUploadedVideo ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-900">
            Текущее загруженное видео
          </p>
          <video
            src={currentUploadedVideoUrl}
            controls
            preload="metadata"
            className="h-56 w-full rounded-2xl border border-neutral-200 bg-black object-cover"
          >
            Ваш браузер не поддерживает видео.
          </video>

          <button
            type="button"
            onClick={handleRemoveUploadedVideo}
            disabled={isSubmitting || isDeleting}
            className="inline-flex rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Удалить видео
          </button>
        </div>
      ) : null}

      {currentUploadedVideoUrl && clearUploadedVideo ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Видео будет удалено после сохранения.
          <div className="mt-3">
            <button
              type="button"
              onClick={handleUndoRemoveUploadedVideo}
              disabled={isSubmitting || isDeleting}
              className="inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Отменить удаление видео
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="newUploadedVideo"
          className="text-sm font-medium text-neutral-900"
        >
          Загрузить новое видео
        </label>
        <input
          id="newUploadedVideo"
          type="file"
          accept="video/*"
          onChange={handleNewUploadedVideoChange}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
        />
        {newUploadedVideoFile ? (
          <p className="text-sm text-neutral-600">
            Выбран файл: {newUploadedVideoFile.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="externalVideoUrl"
          className="text-sm font-medium text-neutral-900"
        >
          Ссылка на внешнее видео
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

      {trimmedExternalVideoUrl ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          <a
            href={trimmedExternalVideoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-rose-600 underline-offset-4 hover:underline"
          >
            Открыть внешнее видео
          </a>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
        Можно изменить имя, подпись, текст поздравления, внешнюю ссылку на большое
        видео, удалить текущие загруженные файлы и загрузить новые.
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
