"use client";

import Image from "next/image";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";

import type { UpdateBiographyPageFormState } from "./page";

type AdminBiographyFormProps = {
  action: (
    state: UpdateBiographyPageFormState,
    formData: FormData,
  ) => Promise<UpdateBiographyPageFormState>;
  initialValues: {
    title: string;
    content: string;
    mainImageUrl: string;
    mainImagePublicId: string;
  };
};

const initialState: UpdateBiographyPageFormState = {
  error: null,
  success: null,
  successId: null,
};

const SUCCESS_MESSAGE_TIMEOUT_MS = 5000;

export default function AdminBiographyForm({
  action,
  initialValues,
}: AdminBiographyFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isUploading, startUploadTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mainImageUrl, setMainImageUrl] = useState(initialValues.mainImageUrl);
  const [mainImagePublicId, setMainImagePublicId] = useState(
    initialValues.mainImagePublicId,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [visibleSuccess, setVisibleSuccess] = useState<string | null>(null);

  const previewUrl = useMemo(() => mainImageUrl.trim(), [mainImageUrl]);

  useEffect(() => {
    if (!state.success || state.error || !state.successId) {
      setVisibleSuccess(null);
      return;
    }

    setVisibleSuccess(state.success);

    const timeoutId = window.setTimeout(() => {
      setVisibleSuccess(null);
    }, SUCCESS_MESSAGE_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state.successId, state.success, state.error]);

  useEffect(() => {
    const formElement = document.getElementById("biography-page-form");

    if (!formElement) {
      return;
    }

    function handleAnyFieldChange(): void {
      setVisibleSuccess(null);
      setUploadSuccess(null);
    }

    formElement.addEventListener("input", handleAnyFieldChange);
    formElement.addEventListener("change", handleAnyFieldChange);

    return () => {
      formElement.removeEventListener("input", handleAnyFieldChange);
      formElement.removeEventListener("change", handleAnyFieldChange);
    };
  }, []);

  function openFileDialog(): void {
    fileInputRef.current?.click();
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    setVisibleSuccess(null);
    setUploadSuccess(null);
    setUploadError(null);

    if (!file) {
      setSelectedFileName("");
      return;
    }

    setSelectedFileName(file.name);

    startUploadTransition(async () => {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "mom-site/biography");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const payload: unknown = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Не удалось загрузить изображение.";

          setUploadError(errorMessage);
          return;
        }

        if (
          typeof payload !== "object" ||
          payload === null ||
          !("success" in payload) ||
          payload.success !== true ||
          !("asset" in payload) ||
          typeof payload.asset !== "object" ||
          payload.asset === null ||
          !("url" in payload.asset) ||
          !("publicId" in payload.asset) ||
          typeof payload.asset.url !== "string" ||
          typeof payload.asset.publicId !== "string"
        ) {
          setUploadError("Сервер вернул некорректный ответ при загрузке.");
          return;
        }

        setMainImageUrl(payload.asset.url);
        setMainImagePublicId(payload.asset.publicId);
        setUploadSuccess(
          "Новое изображение загружено. Не забудьте сохранить изменения.",
        );
      } catch {
        setUploadError("Произошла ошибка при загрузке изображения.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <form id="biography-page-form" action={formAction} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-neutral-800"
              >
                Заголовок
              </label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={initialValues.title}
                maxLength={120}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-neutral-800"
              >
                Текст биографии
              </label>
              <textarea
                id="content"
                name="content"
                defaultValue={initialValues.content}
                rows={18}
                maxLength={5000}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition focus:border-neutral-400"
              />
              <p className="text-sm text-neutral-500">
                Здесь можно вставить длинный связный текст. На публичной странице
                он будет идти справа от фото, а затем продолжаться на всю ширину.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-800">
                Главное изображение
              </p>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <div className="relative aspect-[4/5] w-full">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview of biography main image"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 400px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-sm text-neutral-500">
                      Изображение пока не загружено.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-800">
                  Загрузить новую картинку
                </p>

                <input
                  ref={fileInputRef}
                  id="mainImageUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? "Загрузка..." : "Выбрать изображение"}
                  </button>

                  <span className="text-sm font-medium text-neutral-600">
                    {selectedFileName || "Файл не выбран"}
                  </span>
                </div>
              </div>

              <p className="text-sm font-medium text-neutral-600">
                Можно выбрать jpg, png или webp.
              </p>

              {uploadSuccess ? (
                <div className="inline-flex max-w-full break-words rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {uploadSuccess}
                </div>
              ) : null}

              {uploadError ? (
                <div className="inline-flex max-w-full break-words rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {uploadError}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Текущие данные изображения
              </p>
              <p className="mt-3 break-all text-sm text-neutral-700">
                URL: {mainImageUrl || "не задан"}
              </p>
              <p className="mt-2 break-all text-sm text-neutral-700">
                publicId: {mainImagePublicId || "не задан"}
              </p>
            </div>
          </div>
        </div>

        <input type="hidden" name="mainImageUrl" value={mainImageUrl} />
        <input
          type="hidden"
          name="mainImagePublicId"
          value={mainImagePublicId}
        />

        {state.error && !isUploading ? (
          <div className="inline-flex max-w-full break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}

        {visibleSuccess && !state.error ? (
          <div className="inline-flex max-w-full break-words rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {visibleSuccess}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Сохранение..." : "Сохранить изменения"}
          </button>

          <p className="text-sm text-neutral-500">
            После сохранения обновится и публичная страница.
          </p>
        </div>
      </form>
    </section>
  );
}