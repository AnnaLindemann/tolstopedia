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
import type { CreateGalleryItemFormState } from "./page";

type AdminGalleryFormProps = {
  action: (
    state: CreateGalleryItemFormState,
    formData: FormData,
  ) => Promise<CreateGalleryItemFormState>;
};

const initialState: CreateGalleryItemFormState = {
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
      {pending ? "Сохраняем..." : "Сохранить элемент"}
    </button>
  );
}

export default function AdminGalleryForm({
  action,
}: AdminGalleryFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [title, setTitle] = useState("");
  const [uploadedImage, setUploadedImage] = useState<UploadedAsset | null>(null);
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
    setUploadedImage(null);
    setUploadError(null);
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

  async function handleImageChange(
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
        folder: "mom-site/gallery",
      });

      setUploadedImage(uploadedAsset);
    } catch {
      setUploadedImage(null);
      setUploadError("Не удалось загрузить изображение.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-neutral-900">
          Новый элемент галереи
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Загрузите фото, добавьте title и сохраните элемент.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="gallery-title"
            className="block text-sm font-medium text-neutral-800"
          >
            Title
          </label>
          <input
            id="gallery-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="Например: Семейный вечер"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
          <p className="text-xs text-neutral-500">{titleLength}/120</p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="block text-sm font-medium text-neutral-800">Фото</p>
            <p className="mt-1 text-xs text-neutral-500">
              Сначала изображение загружается в Cloudinary, потом сохраняется
              gallery item.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
              className="sr-only"
            />
            {isUploading ? "Загрузка..." : "Загрузить фото"}
          </label>

          {uploadError ? (
            <p className="text-sm text-red-600">{uploadError}</p>
          ) : null}

          {uploadedImage ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              <div className="aspect-[4/3] bg-neutral-100">
                <img
                  src={uploadedImage.url}
                  alt="Uploaded preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-neutral-500">Изображение загружено</p>
              </div>
            </div>
          ) : null}
        </div>

        <input
          type="hidden"
          name="imageUrl"
          value={uploadedImage?.url ?? ""}
        />
        <input
          type="hidden"
          name="imagePublicId"
          value={uploadedImage?.publicId ?? ""}
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