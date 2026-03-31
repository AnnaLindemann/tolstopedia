"use client";

import { useRef, useState, type ChangeEvent } from "react";

type UploadedAsset = {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  format?: string;
  originalFilename?: string;
};

type UploadResponse =
  | {
      success: true;
      asset: UploadedAsset;
    }
  | {
      error: string;
    };

export default function UploadTestPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadedAsset | null>(null);
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setResult(null);
    setError("");

    console.log("Selected file:", selectedFile);
  }

  async function handleUpload(): Promise<void> {
    if (!file) {
      setError("Сначала выберите файл.");
      return;
    }

    setIsUploading(true);
    setResult(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      console.log("Upload response status:", response.status);
      console.log("Upload response data:", data);

      if (!response.ok) {
        setError("error" in data ? data.error : "Ошибка загрузки.");
        return;
      }

      if ("success" in data && data.success) {
        setResult(data.asset);
        return;
      }

      setError("Не удалось загрузить файл.");
    } catch (uploadError) {
      console.error("Unexpected upload error:", uploadError);
      setError("Непредвиденная ошибка при загрузке.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleChooseFile(): void {
    inputRef.current?.click();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Проверка загрузки файла</h1>
        <p className="text-sm text-neutral-600">
          Временная страница для проверки загрузки фото и видео в Cloudinary.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleChooseFile}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Выбрать файл
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Загружаем..." : "Загрузить файл"}
          </button>
        </div>

        <div className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
          {file ? (
            <div className="space-y-1">
              <p>
                <strong>Файл:</strong> {file.name}
              </p>
              <p>
                <strong>Тип:</strong> {file.type || "Неизвестно"}
              </p>
              <p>
                <strong>Размер:</strong> {file.size} bytes
              </p>
            </div>
          ) : (
            <p>Файл пока не выбран.</p>
          )}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <section className="space-y-4 rounded-2xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-800">
            Файл успешно загружен
          </h2>

          <div className="space-y-2 text-sm text-green-900">
            <p>
              <strong>URL:</strong> {result.url}
            </p>
            <p>
              <strong>Public ID:</strong> {result.publicId}
            </p>
            <p>
              <strong>Тип ресурса:</strong> {result.resourceType}
            </p>
            <p>
              <strong>Формат:</strong> {result.format ?? "—"}
            </p>
            <p>
              <strong>Размер:</strong> {result.bytes}
            </p>
            <p>
              <strong>Ширина:</strong> {result.width ?? "—"}
            </p>
            <p>
              <strong>Высота:</strong> {result.height ?? "—"}
            </p>
            <p>
              <strong>Длительность:</strong> {result.duration ?? "—"}
            </p>
          </div>

          {result.resourceType === "image" ? (
            <img
              src={result.url}
              alt="Загруженное изображение"
              className="max-h-96 rounded-xl border border-neutral-200 object-cover"
            />
          ) : null}

          {result.resourceType === "video" ? (
            <video
              src={result.url}
              controls
              className="max-h-96 rounded-xl border border-neutral-200"
            />
          ) : null}
        </section>
      ) : null}
    </main>
  );
}