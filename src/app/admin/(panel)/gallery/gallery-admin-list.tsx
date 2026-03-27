"use client";

import { useMemo, useState, useTransition } from "react";

import type { GalleryItemListItem } from "@/lib/gallery";

type GalleryAdminListProps = {
  items: GalleryItemListItem[];
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
};

type GalleryAdminCardProps = {
  item: GalleryItemListItem;
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onOpen: (id: string) => void;
};

function GalleryAdminCard({
  item,
  onDelete,
  onUpdateTitle,
  onOpen,
}: GalleryAdminCardProps) {
  const [title, setTitle] = useState(item.title ?? "");
  const [isUpdating, startUpdatingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();

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
      "Удалить этот элемент галереи? Это также удалит изображение из Cloudinary.",
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
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="block w-full text-left"
      >
        <div className="aspect-[4/3] bg-neutral-100">
          <img
            src={item.image.url}
            alt={item.title ?? "Gallery image"}
            className="h-full w-full object-cover"
          />
        </div>
      </button>

      <div className="space-y-3 p-4">
        <div className="min-h-[52px] space-y-2">
          <label
            htmlFor={`gallery-item-title-${item.id}`}
            className="block text-xs font-medium text-neutral-600"
          >
            Title
          </label>
          <input
            id={`gallery-item-title-${item.id}`}
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

export default function GalleryAdminList({
  items,
  onDelete,
  onUpdateTitle,
}: GalleryAdminListProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) {
      return null;
    }

    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  function openModal(itemId: string): void {
    setSelectedItemId(itemId);
  }

  function closeModal(): void {
    setSelectedItemId(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
        Пока нет ни одного элемента галереи.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <GalleryAdminCard
            key={item.id}
            item={item}
            onDelete={onDelete}
            onUpdateTitle={onUpdateTitle}
            onOpen={openModal}
          />
        ))}
      </div>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Закрыть
            </button>

            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="max-h-[80vh] bg-neutral-950">
                <img
                  src={selectedItem.image.url}
                  alt={selectedItem.title ?? "Gallery image"}
                  className="max-h-[80vh] w-full object-contain"
                />
              </div>

              <div className="min-h-[56px] border-t border-neutral-200 bg-white p-4">
                <p className="text-sm font-medium text-neutral-900">
                  {selectedItem.title ?? ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}