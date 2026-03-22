import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export type UploadedAsset = {
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

function mapUploadResult(result: UploadApiResponse): UploadedAsset {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type as "image" | "video" | "raw",
    width: typeof result.width === "number" ? result.width : undefined,
    height: typeof result.height === "number" ? result.height : undefined,
    duration: typeof result.duration === "number" ? result.duration : undefined,
    bytes: result.bytes,
    format: result.format,
    originalFilename: result.original_filename,
  };
}

export async function uploadBufferToCloudinary(
  fileBuffer: Buffer,
  options: UploadApiOptions,
): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error("Cloudinary upload failed: no result returned"));
        return;
      }

      resolve(mapUploadResult(result));
    });

    stream.end(fileBuffer);
  });
}

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}