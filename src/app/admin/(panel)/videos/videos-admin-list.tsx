"use client";

import { useState, useTransition } from "react";

import type { VideoListItem } from "@/lib/videos";

type VideosAdminListProps = {
  items: VideoListItem[];
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
};

type VideoAdminCardProps = {
  item: VideoListItem;
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
};

function VideoAdminCard({
  item,
  onDelete,
  onUpdateTitle,
}: VideoAdminCardProps) {
  const [title, setTitle] = useState(item.title ?? "");
  const [isUpdating, startUpdatingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();

  const isUploadedVideo = item.uploadedVideo !== null;
  const isExternalVideo = item.externalVideo !== null;

  function handleSaveTitle(): void {
    const nextTitle = title.trim();
    const currentTitle = item.title ?? "";

    if (nextTitle === currentTitle) {
      return;
    }

    startUpdatingTransition(async () => {
      await onUpdateTitle(item.id, nextTitle);
    });
  }

  function handleDelete(): void {
    const shouldDelete = window.confirm(
      isUploadedVideo
        ? "Удалить это видео? Файл также будет удалён из Cloudinary."
        : "Удалить эту ссылку на фильм?",
    );

    if (!shouldDelete) {
      return;
    }

    startDeletingTransition(async () => {
      await onDelete(item.id);
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="aspect-video bg-neutral-100">
        {isUploadedVideo && item.uploadedVideo ? (
          <video
            src={item.uploadedVideo.url}
            controls
            className="h-full w-full bg-black"
          />
        ) : isExternalVideo && item.externalVideo ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-medium text-neutral-900">
              Внешняя ссылка на фильм
            </p>
            <a
              href={item.externalVideo.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Открыть ссылку
            </a>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
            {isUploadedVideo ? "Ролик" : "Фильм"}
          </span>
        </div>

        <div className="min-h-[52px] space-y-2">
          <label
            htmlFor={`video-item-title-${item.id}`}
            className="block text-xs font-medium text-neutral-600"
          >
            Title
          </label>
          <input
            id={`video-item-title-${item.id}`}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleSaveTitle}
            maxLength={120}
            placeholder="Без названия"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSaveTitle}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "Сохраняем..." : "Сохранить title"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isUpdating || isDeleting}
            className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Удаляем..." : "Удалить"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function VideosAdminList({
  items,
  onDelete,
  onUpdateTitle,
}: VideosAdminListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
        Пока нет ни одного видео.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <VideoAdminCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          onUpdateTitle={onUpdateTitle}
        />
      ))}
    </div>
  );
}