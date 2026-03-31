type CloudinaryVideoResponse = {
  secure_url?: string;
  public_id?: string;
  duration?: number;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  error?: { message: string };
};

export type DirectVideoUploadResult = {
  url: string;
  publicId: string;
  duration?: number;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export async function uploadVideoToCloudinary(
  file: File,
  folder: string,
): Promise<DirectVideoUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary не настроен для загрузки видео");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json().catch(() => null)) as CloudinaryVideoResponse | null;

  if (!response.ok || !data) {
    const message = data?.error?.message ?? "Не удалось загрузить видео";
    throw new Error(message);
  }

  if (typeof data.secure_url !== "string" || typeof data.public_id !== "string") {
    throw new Error("Cloudinary вернул некорректный ответ");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    duration: typeof data.duration === "number" ? data.duration : undefined,
    width: typeof data.width === "number" ? data.width : undefined,
    height: typeof data.height === "number" ? data.height : undefined,
    bytes: typeof data.bytes === "number" ? data.bytes : undefined,
    format: data.format,
  };
}
