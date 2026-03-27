"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormValues = {
  name: string;
  relation: string;
  message: string;
  externalVideoUrl: string;
};

type FormErrors = Partial<
  Record<keyof FormValues | "photo" | "uploadedVideo", string>
>;

type SubmitSuccessData = {
  greetingId: string;
  editToken: string;
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

type CreateGreetingResponse = {
  error?: string;
  greetingId?: string;
  editToken?: string;
};

const EDIT_LINKS_STORAGE_KEY = "mom-site:greeting-edit-links";

type SavedEditLinks = Record<string, string>;

function saveEditLinkForGreeting(greetingId: string, token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const rawValue = window.localStorage.getItem(EDIT_LINKS_STORAGE_KEY);
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : {};
    const currentLinks =
      typeof parsedValue === "object" && parsedValue !== null
        ? (parsedValue as SavedEditLinks)
        : {};

    const nextLinks: SavedEditLinks = {
      ...currentLinks,
      [greetingId]: token,
    };

    window.localStorage.setItem(
      EDIT_LINKS_STORAGE_KEY,
      JSON.stringify(nextLinks),
    );
  } catch {
    // Ignore localStorage errors in MVP flow
  }
}

const initialValues: FormValues = {
  name: "",
  relation: "",
  message: "",
  externalVideoUrl: "",
};

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateForm(params: {
  values: FormValues;
  photoFile: File | null;
  uploadedVideoFile: File | null;
}): FormErrors {
  const { values, photoFile, uploadedVideoFile } = params;

  const errors: FormErrors = {};

  const trimmedName = values.name.trim();
  const trimmedRelation = values.relation.trim();
  const trimmedMessage = values.message.trim();
  const trimmedExternalVideoUrl = values.externalVideoUrl.trim();

  if (!trimmedName) {
    errors.name = "Введите имя";
  } else if (trimmedName.length > 80) {
    errors.name = "Имя слишком длинное";
  }

  if (trimmedRelation.length > 80) {
    errors.relation = "Слишком длинное значение";
  }

  if (trimmedMessage.length > 3000) {
    errors.message = "Сообщение слишком длинное";
  }

  if (trimmedExternalVideoUrl && !isValidUrl(trimmedExternalVideoUrl)) {
    errors.externalVideoUrl = "Введите корректную ссылку";
  }

  const hasAtLeastOneContent =
    trimmedMessage.length > 0 ||
    photoFile !== null ||
    uploadedVideoFile !== null ||
    trimmedExternalVideoUrl.length > 0;

  if (!hasAtLeastOneContent) {
    errors.message =
      "Добавьте хотя бы что-то одно: текст, фото, видео или ссылку на внешнее видео";
  }

  return errors;
}

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

function isCreateGreetingResponse(value: unknown): value is CreateGreetingResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return true;
}

export function AddGreetingDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<SubmitSuccessData | null>(null);
  const [copyState, setCopyState] = useState<"" | "error">("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [showExternalVideoInput, setShowExternalVideoInput] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function resetForm(): void {
    setValues(initialValues);
    setErrors({});
    setSubmitError("");
    setIsSubmitting(false);
    setSuccessData(null);
    setCopyState("");
    setPhotoFile(null);
    setUploadedVideoFile(null);
    setShowExternalVideoInput(false);
  }

  function closeDialog(): void {
    setOpen(false);
    resetForm();
  }

  function openDialog(): void {
    setOpen(true);
  }

  function handleValueChange<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ): void {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });

    if (submitError) {
      setSubmitError("");
    }
  }

  function handleInputChange(
    field: keyof FormValues,
  ): (event: ChangeEvent<HTMLInputElement>) => void {
    return (event) => {
      handleValueChange(field, event.target.value);
    };
  }

  function handleTextareaChange(
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void {
    handleValueChange("message", event.target.value);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);

    setErrors((prev) => {
      if (!prev.photo) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors.photo;
      return nextErrors;
    });

    if (submitError) {
      setSubmitError("");
    }
  }

  function handleUploadedVideoChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const file = event.target.files?.[0] ?? null;
    setUploadedVideoFile(file);

    setErrors((prev) => {
      if (!prev.uploadedVideo) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors.uploadedVideo;
      return nextErrors;
    });

    if (submitError) {
      setSubmitError("");
    }
  }

  function handleOverlayClick(): void {
    closeDialog();
  }

  function handleDialogCardClick(event: MouseEvent<HTMLDivElement>): void {
    event.stopPropagation();
  }

  async function handleCopyEditLink(): Promise<void> {
    if (!successData) {
      return;
    }

    try {
      await navigator.clipboard.writeText(editLink);
      closeDialog();
    } catch {
      setCopyState("error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const nextErrors = validateForm({
      values,
      photoFile,
      uploadedVideoFile,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const trimmedName = values.name.trim();
      const trimmedRelation = values.relation.trim();
      const trimmedMessage = values.message.trim();
      const trimmedExternalVideoUrl = values.externalVideoUrl.trim();

      const uploadedPhoto = photoFile
        ? await uploadFile({
            file: photoFile,
            folder: "mom-site/greetings/photos",
          })
        : null;

      const uploadedVideo = uploadedVideoFile
        ? await uploadFile({
            file: uploadedVideoFile,
            folder: "mom-site/greetings/videos",
          })
        : null;

      const body = {
        name: trimmedName,
        relation: trimmedRelation || undefined,
        message: trimmedMessage || undefined,
        photo: uploadedPhoto,
        uploadedVideo,
        externalVideo: trimmedExternalVideoUrl
          ? { url: trimmedExternalVideoUrl }
          : null,
      };

      const response = await fetch("/api/greetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!isCreateGreetingResponse(data)) {
        setSubmitError("Сервер вернул некорректный ответ");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        setSubmitError(data.error ?? "Не удалось сохранить поздравление");
        setIsSubmitting(false);
        return;
      }

      if (!data.greetingId || !data.editToken) {
        setSubmitError("Сервер не вернул ссылку для редактирования");
        setIsSubmitting(false);
        return;
      }

      saveEditLinkForGreeting(data.greetingId, data.editToken);

      setSuccessData({
        greetingId: data.greetingId,
        editToken: data.editToken,
      });

      setIsSubmitting(false);
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Не удалось сохранить поздравление");
      }

      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        closeDialog();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const editLink =
    successData && typeof window !== "undefined"
      ? `${window.location.origin}/greetings/edit/${successData.greetingId}?token=${successData.editToken}`
      : "";

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-rose-500 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
      >
        Добавить поздравление
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-greeting-title"
          onClick={handleOverlayClick}
        >
          <div
            className="relative z-[60] isolate max-h-[90vh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-[32px] bg-[linear-gradient(180deg,#fffaf7_0%,#fff5ef_100%)] p-6 shadow-2xl sm:p-8"
            onClick={handleDialogCardClick}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-greeting-title"
                  className="text-xl font-semibold text-fg"
                >
                  {successData ? "Поздравление сохранено" : "Добавить поздравление"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {successData
                    ? "Сохраните ссылку в надёжное место. По ней вы сможете позже изменить своё поздравление."
                    : "Оставьте тёплые слова, добавьте фото, видео или ссылку на внешнее видео."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white/90 text-lg text-rose-500 shadow-sm transition hover:bg-rose-50"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            {successData ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  Ваше поздравление уже сохранено и появилось на странице.
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editLink">Ссылка для редактирования</Label>
                  <Input
                    id="editLink"
                    value={editLink}
                    readOnly
                    className="h-12 rounded-2xl border-rose-200 bg-white"
                  />
                </div>

                <div className="rounded-2xl border border-rose-100 bg-white/80 p-4 text-sm leading-6 text-muted-foreground">
                  <p>
                    Сохраните эту ссылку в заметках, мессенджере или другом
                    надёжном месте.
                  </p>
                  <p>
                    Если захотите изменить поздравление, вставьте ссылку в
                    адресную строку браузера.
                  </p>
                  <p>
                    Если вы потеряете ссылку, свяжитесь с Сергеем, Антоном или
                    Анной.
                  </p>
                </div>

                {copyState === "error" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Не удалось скопировать ссылку автоматически. Скопируйте
                    ссылку из поля выше вручную, потом нажмите «Закрыть».
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-fg transition hover:bg-rose-50"
                  >
                    Закрыть
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyEditLink}
                    className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                  >
                    Скопировать ссылку и закрыть
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2.5">
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    placeholder="Например, Анна"
                    value={values.name}
                    onChange={handleInputChange("name")}
                    className="h-12 rounded-2xl border-rose-200 bg-white px-4 shadow-sm transition focus-visible:ring-2 focus-visible:ring-rose-200"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="relation">Ваша связь с Натальей</Label>
                  <Input
                    id="relation"
                    placeholder="Например, подруга, коллега, дочь"
                    value={values.relation}
                    onChange={handleInputChange("relation")}
                    className="h-12 rounded-2xl border-rose-200 bg-white px-4 shadow-sm transition focus-visible:ring-2 focus-visible:ring-rose-200"
                  />
                  {errors.relation && (
                    <p className="text-sm text-red-600">{errors.relation}</p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="message">Текст поздравления</Label>
                  <textarea
                    id="message"
                    placeholder="Напишите тёплые слова или воспоминание"
                    className="min-h-[140px] w-full rounded-[28px] border border-rose-200 bg-white px-4 py-3 text-sm text-fg shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-rose-200"
                    value={values.message}
                    onChange={handleTextareaChange}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="photo">Фото</Label>

                  <label
                    htmlFor="photo"
                    className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border bg-[#ffe8df] text-[#7a4b3a] border-rose-200 hover:bg-[#ffd6c8] px-5 py-3 text-sm font-semibold  shadow-sm transition  hover:shadow-md"
                  >
                    Загрузить фото
                  </label>

                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {photoFile && (
                    <p className="text-sm text-muted-foreground">
                      Выбран файл: {photoFile.name}
                    </p>
                  )}

                  {errors.photo && (
                    <p className="text-sm text-red-600">{errors.photo}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="uploadedVideo">Короткое видео</Label>

                  <label
                    htmlFor="uploadedVideo"
                   className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border bg-[#ffe8df] text-[#7a4b3a] border-rose-200 hover:bg-[#ffd6c8] px-5 py-3 text-sm font-semibold  shadow-sm transition  hover:shadow-md"
                  >
                    Загрузить видео
                  </label>

                  <input
                    id="uploadedVideo"
                    type="file"
                    accept="video/*"
                    onChange={handleUploadedVideoChange}
                    className="hidden"
                  />

                  {uploadedVideoFile && (
                    <p className="text-sm text-muted-foreground">
                      Выбран файл: {uploadedVideoFile.name}
                    </p>
                  )}

                  {errors.uploadedVideo && (
                    <p className="text-sm text-red-600">{errors.uploadedVideo}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Видео по ссылке</Label>

                  {!showExternalVideoInput ? (
                    <button
                      type="button"
                      onClick={() => setShowExternalVideoInput(true)}
                      className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border bg-[#ffe8df] text-[#7a4b3a] border-rose-200 hover:bg-[#ffd6c8] px-5 py-3 text-sm font-semibold  shadow-sm transition  hover:shadow-md"
                    >
                      Добавить ссылку
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        id="externalVideoUrl"
                        placeholder="Вставьте ссылку на видео"
                        value={values.externalVideoUrl}
                        onChange={handleInputChange("externalVideoUrl")}
                        className="h-12 rounded-2xl border-rose-200 bg-white px-4 shadow-sm transition focus-visible:ring-2 focus-visible:ring-rose-200"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setShowExternalVideoInput(false);
                          handleValueChange("externalVideoUrl", "");
                        }}
                        className="text-sm font-medium text-rose-600 underline-offset-4 transition hover:underline"
                      >
                        Убрать ссылку
                      </button>
                    </div>
                  )}

                  {errors.externalVideoUrl && (
                    <p className="text-sm text-red-600">
                      {errors.externalVideoUrl}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-rose-100 bg-white/80 p-4 text-sm leading-6 text-muted-foreground">
                  Можно оставить только текст. Фото, видео и внешняя ссылка —
                  необязательны.
                </div>

                {hasErrors && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Проверьте форму: есть ошибки в заполнении.
                  </div>
                )}

                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}