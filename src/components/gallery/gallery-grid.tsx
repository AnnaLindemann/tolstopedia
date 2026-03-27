"use client";

import { useEffect, useMemo, useState } from "react";

export type GalleryGridItem = {
  id: string;
  title: string | null;
  image: {
    url: string;
    publicId: string;
  };
};

type GalleryGridProps = {
  items: GalleryGridItem[];
  emptyText: string;
};

export default function GalleryGrid({
  items,
  emptyText,
}: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedItem = useMemo(() => {
    if (selectedIndex === null) {
      return null;
    }

    return items[selectedIndex] ?? null;
  }, [items, selectedIndex]);

  function openItem(index: number): void {
    setSelectedIndex(index);
  }

  function closeModal(): void {
    setSelectedIndex(null);
  }

  function showPrevious(): void {
    if (selectedIndex === null || items.length === 0) {
      return;
    }

    const previousIndex =
      selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;

    setSelectedIndex(previousIndex);
  }

  function showNext(): void {
    if (selectedIndex === null || items.length === 0) {
      return;
    }

    const nextIndex = selectedIndex === items.length - 1 ? 0 : selectedIndex + 1;

    setSelectedIndex(nextIndex);
  }

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, items.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openItem(index)}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-neutral-100">
              <img
                src={item.image.url}
                alt={item.title ?? "Gallery image"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex min-h-[56px] items-center p-4">
              <p className="line-clamp-2 text-sm font-medium text-neutral-900">
                {item.title ?? ""}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 bg-black/55 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full items-center justify-center">
            <div
              className="relative flex items-center justify-center gap-3"
              onClick={(event) => event.stopPropagation()}
            >
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={showPrevious}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-xl font-medium text-neutral-900 shadow transition hover:bg-white"
                  aria-label="Previous image"
                >
                  ←
                </button>
              ) : null}

              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex h-[min(72vh,720px)] w-[min(88vw,720px)] items-center justify-center p-3">
                  <img
                    src={selectedItem.image.url}
                    alt={selectedItem.title ?? "Gallery image"}
                    className="block max-h-full max-w-full rounded-xl object-contain"
                  />
                </div>

                <div className="flex min-h-[56px] items-center border-t border-neutral-200 px-4 py-3">
                  <p className="text-sm font-medium text-neutral-900">
                    {selectedItem.title ?? ""}
                  </p>
                </div>
              </div>

              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={showNext}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-xl font-medium text-neutral-900 shadow transition hover:bg-white"
                  aria-label="Next image"
                >
                  →
                </button>
              ) : null}

              <button
                type="button"
                onClick={closeModal}
                className="absolute right-0 top-0 inline-flex h-9 min-w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-black/45 px-3 text-sm font-medium text-white transition hover:bg-black/80"
                aria-label="Close gallery"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}