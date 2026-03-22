"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    setEditToken(readSavedEditToken(greeting.id));
  }, [greeting.id]);

  const hasPhoto = Boolean(greeting.photoUrl);
  const hasUploadedVideo = Boolean(greeting.uploadedVideoUrl);
  const hasExternalVideo = Boolean(greeting.externalVideoUrl);
  const hasExternalPreview = Boolean(greeting.externalVideoPreviewImageUrl);

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

  return (
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
              className="mt-2 text-sm font-medium text-rose-600 underline-offset-4 hover:underline"
            >
              {isExpanded ? "Свернуть" : "Читать полностью"}
            </button>
          ) : null}
        </div>
      ) : null}

      {hasPhoto ? (
        <div className="mt-3">
          <img
            src={greeting.photoUrl ?? ""}
            alt="Greeting photo"
            className="h-48 w-full rounded-lg object-cover"
          />
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
        <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3">
          {hasExternalPreview ? (
            <a
              href={greeting.externalVideoUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={greeting.externalVideoPreviewImageUrl ?? ""}
                alt="External video preview"
                className="h-40 w-full rounded-lg object-cover"
              />
            </a>
          ) : null}

          <a
            href={greeting.externalVideoUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-sm font-medium text-rose-600 underline-offset-4 hover:underline"
          >
            Открыть внешнее видео
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
  );
}