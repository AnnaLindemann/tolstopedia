import { NextResponse } from "next/server";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const fileType = file.type;
    const fileSize = file.size;

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    if (isImage && fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large (max 10MB)" },
        { status: 400 }
      );
    }

    if (isVideo && fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Video too large (max 100MB)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadBufferToCloudinary(buffer, {
      folder: "mom-site",
      resource_type: isImage ? "image" : "video",
    });

    return NextResponse.json({
      success: true,
      asset: uploadResult,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}