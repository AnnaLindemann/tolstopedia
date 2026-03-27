export type UploadedAsset = {
  url: string;
  publicId: string;
};

type UploadFileParams = {
  file: File;
  folder?: string;
};

type UploadResponse = {
  success: true;
  asset: {
    url: string;
    publicId: string;
  };
};

export async function uploadFile({
  file,
  folder = "mom-site",
}: UploadFileParams): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  const data: unknown = await response.json();

  if (!isUploadResponse(data)) {
    throw new Error("Invalid upload response");
  }

  return {
    url: data.asset.url,
    publicId: data.asset.publicId,
  };
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

  return typeof asset.url === "string" && typeof asset.publicId === "string";
}