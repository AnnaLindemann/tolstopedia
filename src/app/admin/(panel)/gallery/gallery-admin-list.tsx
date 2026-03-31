"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { GalleryItemListItem } from "@/lib/gallery";

type GalleryAdminListProps = {
  items: GalleryItemListItem[];
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
};

type ReorderApiResponse =
  | {
      ok: true;
      data: {
        updatedCount: number;
      };
    }
  | {
      ok: false;
      error: string;
    };

type SortableGalleryAdminCardProps = {
  item: GalleryItemListItem;
  onDelete: (id: string) => Promise<void>;
  onUpdateTitle: (id: string, title: string) => Promise<void>;
  onOpen: (id: string) => void;
};

type StaticGalleryAdminCardProps = {
  item: GalleryItemListItem;
  onOpen: (id: string) => void;
};

function SortableGalleryAdminCard({
  item,
  onDelete,
  onUpdateTitle,
  onOpen,
}: SortableGalleryAdminCardProps) {
  const [title, setTitle] = useState(item.title ?? "");
  const [isUpdating, startUpdatingTransition] = useTransition();
  const [isDeleting, startDeletingTransition] = useTransition();

  useEffect(() => {
    setTitle(item.title ?? "");
  }, [item.title]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleSaveTitle(): void {
    const nextTitle = title.trim();
    const currentTitle = (item.title ?? "").trim();

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
    <article
      ref={setNodeRef}
      style={style}
      className={[
  "overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm",
  isDragging ? "opacity-60" : "",
]
  .filter(Boolean)
  .join(" ")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 active:cursor-grabbing"
        >
          Перетащить
        </button>

        <span className="text-xs text-neutral-500">order: {item.order}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/3] bg-neutral-100">
          <Image
            src={item.image.url}
            alt={item.title ?? "Gallery image"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
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

function StaticGalleryAdminCard({
  item,
  onOpen,
}: StaticGalleryAdminCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-400">
          Перетащить
        </div>

        <span className="text-xs text-neutral-500">order: {item.order}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/3] bg-neutral-100">
          <Image
            src={item.image.url}
            alt={item.title ?? "Gallery image"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </button>

      <div className="space-y-3 p-4">
        <div className="min-h-[52px] space-y-2">
          <label
            htmlFor={`gallery-item-title-static-${item.id}`}
            className="block text-xs font-medium text-neutral-600"
          >
            Title
          </label>
          <input
            id={`gallery-item-title-static-${item.id}`}
            type="text"
            value={item.title ?? ""}
            readOnly
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-400">
            Сохранить title
          </div>

          <div className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-300">
            Удалить
          </div>
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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<GalleryItemListItem[]>(items);
  const [savedOrderKey, setSavedOrderKey] = useState(
    items.map((item) => item.id).join("|"),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSavingOrder, startSavingOrderTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOrderedItems(items);
    setSavedOrderKey(items.map((item) => item.id).join("|"));
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const selectedItem = useMemo(() => {
    if (!selectedItemId) {
      return null;
    }

    return orderedItems.find((item) => item.id === selectedItemId) ?? null;
  }, [orderedItems, selectedItemId]);

  const currentOrderKey = useMemo(
    () => orderedItems.map((item) => item.id).join("|"),
    [orderedItems],
  );

  const isDirty = savedOrderKey !== currentOrderKey;

  function openModal(itemId: string): void {
    setSelectedItemId(itemId);
  }

  function closeModal(): void {
    setSelectedItemId(null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedItems((currentItems) => {
      const oldIndex = currentItems.findIndex(
        (item) => item.id === String(active.id),
      );
      const newIndex = currentItems.findIndex(
        (item) => item.id === String(over.id),
      );

      if (oldIndex === -1 || newIndex === -1) {
        return currentItems;
      }

      const nextItems = arrayMove(currentItems, oldIndex, newIndex);

      return nextItems.map((item, index) => ({
        ...item,
        order: index,
      }));
    });

    setError(null);
    setSuccess(null);
  }

  function handleResetOrder(): void {
    setOrderedItems(items);
    setError(null);
    setSuccess(null);
  }

  function handleSaveOrder(): void {
    setError(null);
    setSuccess(null);

    startSavingOrderTransition(async () => {
      try {
        const response = await fetch("/api/admin/gallery/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: orderedItems.map((item) => item.id),
          }),
        });

        const result = (await response.json()) as ReorderApiResponse;

        if (!response.ok || !result.ok) {
          throw new Error(
            "error" in result
              ? result.error
              : "Не удалось сохранить порядок галереи.",
          );
        }

        const nextSavedOrderKey = orderedItems.map((item) => item.id).join("|");

        setSavedOrderKey(nextSavedOrderKey);
        setSuccess("Новый порядок сохранён.");
        router.refresh();
      } catch (saveError: unknown) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Не удалось сохранить порядок галереи.",
        );
      }
    });
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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={!isDirty || isSavingOrder}
          className="rounded-xl border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingOrder ? "Сохраняем..." : "Сохранить порядок"}
        </button>

        <button
          type="button"
          onClick={handleResetOrder}
          disabled={!isDirty || isSavingOrder}
          className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Сбросить
        </button>

        <span className="text-sm text-neutral-500">
          {isDirty ? "Есть несохранённые изменения" : "Изменений нет"}
        </span>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mb-4 text-sm text-green-600">{success}</p> : null}

      {mounted ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedItems.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {orderedItems.map((item) => (
                <SortableGalleryAdminCard
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  onUpdateTitle={onUpdateTitle}
                  onOpen={openModal}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orderedItems.map((item) => (
            <StaticGalleryAdminCard
              key={item.id}
              item={item}
              onOpen={openModal}
            />
          ))}
        </div>
      )}

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
              <div className="relative max-h-[80vh] min-h-[320px] bg-neutral-950">
                <Image
                  src={selectedItem.image.url}
                  alt={selectedItem.title ?? "Gallery image"}
                  fill
                  sizes="100vw"
                  className="object-contain"
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