"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useFormStatus } from "react-dom";

import {
  uploadFile,
  type UploadedAsset,
} from "@/components/greetings/upload-file";
import type { CreateVideoItemFormState } from "./page";

type AdminVideosFormProps = {
  action: (
    state: CreateVideoItemFormState,
    formData: FormData,
  ) => Promise<CreateVideoItemFormState>;
};

type VideoType = "uploaded" | "external";

const initialState: CreateVideoItemFormState = {
  error: null,
  success: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-w-[180px] items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Сохраняем..." : "Сохранить видео"}
    </button>
  );
}

export default function AdminVideosForm({ action }: AdminVideosFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [videoType, setVideoType] = useState<VideoType>("uploaded");
  const [title, setTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const successTimeoutRef = useRef<number | null>(null);

  const titleLength = useMemo(() => title.trim().length, [title]);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setTitle("");
    setExternalUrl("");
    setUploadedVideo(null);
    setUploadError(null);
    setVideoType("uploaded");
    setShowSuccessBadge(true);

    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current);
    }

    successTimeoutRef.current = window.setTimeout(() => {
      setShowSuccessBadge(false);
    }, 3000);

    return () => {
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, [state.success]);

  async function handleVideoChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const uploadedAsset = await uploadFile({
        file,
        folder: "mom-site/videos",
      });

      setUploadedVideo(uploadedAsset);
    } catch {
      setUploadedVideo(null);
      setUploadError("Не удалось загрузить видео.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  function handleSwitchType(nextType: VideoType): void {
    setVideoType(nextType);
    setUploadError(null);

    if (nextType === "uploaded") {
      setExternalUrl("");
      return;
    }

    setUploadedVideo(null);
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-neutral-900">
          Новый элемент видео
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Можно добавить либо загруженный ролик, либо ссылку на большой фильм.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <p className="block text-sm font-medium text-neutral-800">
            Тип видео
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSwitchType("uploaded")}
              className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition ${
                videoType === "uploaded"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              Ролик
            </button>

            <button
              type="button"
              onClick={() => handleSwitchType("external")}
              className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition ${
                videoType === "external"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              Фильм
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="video-title"
            className="block text-sm font-medium text-neutral-800"
          >
            Title
          </label>
          <input
            id="video-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="Например: Любимое семейное видео"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
          <p className="text-xs text-neutral-500">{titleLength}/120</p>
        </div>

        {videoType === "uploaded" ? (
          <div className="space-y-3">
            <div>
              <p className="block text-sm font-medium text-neutral-800">
                Видео
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Загрузите короткий ролик. Сначала файл отправляется в Cloudinary,
                потом сохраняется запись.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                disabled={isUploading}
                className="sr-only"
              />
              {isUploading ? "Загрузка..." : "Загрузить видео"}
            </label>

            {uploadError ? (
              <p className="text-sm text-red-600">{uploadError}</p>
            ) : null}

            {uploadedVideo ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <div className="aspect-video bg-black">
                  <video
                    src={uploadedVideo.url}
                    controls
                    className="h-full w-full"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-neutral-500">Видео загружено</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="external-video-url"
              className="block text-sm font-medium text-neutral-800"
            >
              Ссылка на фильм
            </label>
            <input
              id="external-video-url"
              name="externalVideoUrl"
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />
            <p className="text-xs text-neutral-500">
              Подойдёт ссылка на YouTube, Vimeo или другое внешнее видео.
            </p>
          </div>
        )}

        <input type="hidden" name="videoType" value={videoType} />
        <input
          type="hidden"
          name="uploadedVideoUrl"
          value={videoType === "uploaded" ? uploadedVideo?.url ?? "" : ""}
        />
        <input
          type="hidden"
          name="uploadedVideoPublicId"
          value={videoType === "uploaded" ? uploadedVideo?.publicId ?? "" : ""}
        />
        <input
          type="hidden"
          name="uploadedVideoDuration"
          value={
            videoType === "uploaded" && uploadedVideo?.duration !== undefined
              ? String(uploadedVideo.duration)
              : ""
          }
        />

        {state.error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <SubmitButton />

          {showSuccessBadge && state.success ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {state.success}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}