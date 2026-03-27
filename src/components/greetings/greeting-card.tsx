"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

import type { Greeting } from "@/types/greeting";

type Props = {
  greeting: Greeting;
};

const EDIT_LINKS_STORAGE_KEY = "mom-site:greeting-edit-links";
const TEXT_PREVIEW_LIMIT = 220;

type SavedEditLinks = Record<string, string>;

function readSavedEditToken(greetingId: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const rawValue = window.localStorage.getItem(EDIT_LINKS_STORAGE_KEY);

    if (!rawValue) {
      return "";
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (typeof parsedValue !== "object" || parsedValue === null) {
      return "";
    }

    const links = parsedValue as SavedEditLinks;
    const token = links[greetingId];

    return typeof token === "string" ? token : "";
  } catch {
    return "";
  }
}

export function GreetingCard({ greeting }: Props) {
  const [editToken, setEditToken] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  useEffect(() => {
    setEditToken(readSavedEditToken(greeting.id));
  }, [greeting.id]);

  useEffect(() => {
    if (!isPhotoOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsPhotoOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPhotoOpen]);

  const hasPhoto = Boolean(greeting.photoUrl);
  const hasUploadedVideo = Boolean(greeting.uploadedVideoUrl);
  const hasExternalVideo = Boolean(greeting.externalVideoUrl);

  const fullMessage = greeting.message ?? "";
  const shouldClampText = fullMessage.length > TEXT_PREVIEW_LIMIT;
  const displayedMessage =
    !isExpanded && shouldClampText
      ? `${fullMessage.slice(0, TEXT_PREVIEW_LIMIT).trimEnd()}…`
      : fullMessage;

  const editHref = useMemo(() => {
    if (!editToken) {
      return "";
    }

    return `/greetings/edit/${greeting.id}?token=${encodeURIComponent(editToken)}`;
  }, [editToken, greeting.id]);

  function handleOpenPhoto(): void {
    setIsPhotoOpen(true);
  }

  function handleClosePhoto(): void {
    setIsPhotoOpen(false);
  }

  function handlePhotoDialogCardClick(event: MouseEvent<HTMLDivElement>): void {
    event.stopPropagation();
  }

  return (
    <>
      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-2">
          <p className="break-words font-semibold text-fg">{greeting.name}</p>

          {greeting.relation ? (
            <p className="break-words text-sm text-muted-foreground">
              {greeting.relation}
            </p>
          ) : null}
        </div>

        {fullMessage ? (
          <div className="mt-1">
            <p className="break-words whitespace-pre-line text-sm text-fg">
              {displayedMessage}
            </p>

            {shouldClampText ? (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-2 text-sm font-medium text-rose-600 underline-offset-4 transition hover:underline"
              >
                {isExpanded ? "Свернуть" : "Читать полностью"}
              </button>
            ) : null}
          </div>
        ) : null}

        {hasPhoto ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleOpenPhoto}
              className="block w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              aria-label="Открыть фото полностью"
            >
              <img
                src={greeting.photoUrl ?? ""}
                alt={`Фото в поздравлении от ${greeting.name}`}
                className="h-48 w-full rounded-lg object-cover transition hover:opacity-95"
              />
            </button>
          </div>
        ) : null}

        {hasUploadedVideo ? (
          <div className="mt-3">
            <video
              src={greeting.uploadedVideoUrl ?? ""}
              controls
              preload="metadata"
              className="h-48 w-full rounded-lg bg-black object-cover"
            >
              Ваш браузер не поддерживает видео.
            </video>
          </div>
        ) : null}

        {hasExternalVideo ? (
          <div className="mt-3 flex justify-center rounded-xl border border-border bg-muted/30 p-4">
            <a
              href={greeting.externalVideoUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Открыть видео
            </a>
          </div>
        ) : null}

        <div className="mt-auto pt-4">
          {editHref ? (
            <Link
              href={editHref}
              className="inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Редактировать моё поздравление
            </Link>
          ) : null}
        </div>
      </div>

      {isPhotoOpen && hasPhoto ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Полноразмерное фото"
          onClick={handleClosePhoto}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={handlePhotoDialogCardClick}
          >
            <button
              type="button"
              onClick={handleClosePhoto}
              className="absolute right-2 top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-fg shadow-md transition hover:bg-white"
              aria-label="Закрыть фото"
            >
              ×
            </button>

            <div className="flex max-h-[90vh] items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-2">
              <img
                src={greeting.photoUrl ?? ""}
                alt={`Фото в поздравлении от ${greeting.name}`}
                className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}