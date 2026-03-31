import { NextResponse } from "next/server";

import { uploadBufferToCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderValue = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const folder =
      typeof folderValue === "string" && folderValue.trim().length > 0
        ? folderValue.trim()
        : "mom-site";

    const fileType = file.type;
    const fileSize = file.size;

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);

    if (!isImage) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    if (fileSize > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large (max 10MB)" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadBufferToCloudinary(buffer, {
      folder,
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      asset: uploadResult,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
