export type UploadedAsset = {
  url: string;
  publicId: string;
};

type UploadFileParams = {
  file: File;
  folder?: string;
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

  if (!isUploadedAssetResponse(data)) {
    throw new Error("Invalid upload response");
  }

  return {
    url: data.url,
    publicId: data.publicId,
  };
}

function isUploadedAssetResponse(value: unknown): value is UploadedAsset {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.url === "string" && typeof candidate.publicId === "string";
}