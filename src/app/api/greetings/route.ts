import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { getLatestGreetings } from "@/lib/greetings/get-latest-greetings";
import GreetingModel from "@/models/greeting.model";

const DEFAULT_LIMIT = 10;

type UploadedImageInput = {
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
};

type UploadedVideoInput = {
  url?: string;
  publicId?: string;
  duration?: number;
  width?: number;
  height?: number;
};

type ExternalVideoInput = {
  url?: string;
};

type CreateGreetingRequestBody = {
  name?: string;
  relation?: string;
  message?: string;
  photo?: UploadedImageInput;
  uploadedVideo?: UploadedVideoInput;
  externalVideo?: ExternalVideoInput;
};

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function createEditToken(): string {
  return crypto.randomUUID();
}

async function createEditTokenHash(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizePhoto(
  photo: UploadedImageInput | undefined,
): UploadedImageInput | null {
  if (!photo?.url && !photo?.publicId) {
    return null;
  }

  return {
    url: photo.url?.trim() ?? "",
    publicId: photo.publicId?.trim() ?? "",
    width: photo.width,
    height: photo.height,
  };
}

function normalizeUploadedVideo(
  uploadedVideo: UploadedVideoInput | undefined,
): UploadedVideoInput | null {
  if (!uploadedVideo?.url && !uploadedVideo?.publicId) {
    return null;
  }

  return {
    url: uploadedVideo.url?.trim() ?? "",
    publicId: uploadedVideo.publicId?.trim() ?? "",
    duration: uploadedVideo.duration,
    width: uploadedVideo.width,
    height: uploadedVideo.height,
  };
}

function normalizeExternalVideo(
  externalVideo: ExternalVideoInput | undefined,
): ExternalVideoInput | null {
  if (!externalVideo?.url) {
    return null;
  }

  return {
    url: externalVideo.url.trim(),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");

  const parsedLimit = limitParam ? Number(limitParam) : DEFAULT_LIMIT;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : DEFAULT_LIMIT;

  try {
    const result = await getLatestGreetings({
      limit,
      cursor,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load greetings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateGreetingRequestBody;

    const name = body.name?.trim() ?? "";
    const relation = body.relation?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    const photo = normalizePhoto(body.photo);
    const uploadedVideo = normalizeUploadedVideo(body.uploadedVideo);
    const externalVideo = normalizeExternalVideo(body.externalVideo);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (name.length > 80) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }

    if (relation.length > 80) {
      return NextResponse.json({ error: "Relation is too long" }, { status: 400 });
    }

    if (message.length > 3000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    if (photo) {
      if (!photo.url) {
        return NextResponse.json(
          { error: "Photo URL is required when photo is provided" },
          { status: 400 },
        );
      }

      if (!photo.publicId) {
        return NextResponse.json(
          { error: "Photo publicId is required when photo is provided" },
          { status: 400 },
        );
      }

      if (!isValidUrl(photo.url)) {
        return NextResponse.json({ error: "Photo URL is invalid" }, { status: 400 });
      }

      if (photo.width !== undefined && (!Number.isFinite(photo.width) || photo.width <= 0)) {
        return NextResponse.json({ error: "Photo width is invalid" }, { status: 400 });
      }

      if (
        photo.height !== undefined &&
        (!Number.isFinite(photo.height) || photo.height <= 0)
      ) {
        return NextResponse.json({ error: "Photo height is invalid" }, { status: 400 });
      }
    }

    if (uploadedVideo) {
      if (!uploadedVideo.url) {
        return NextResponse.json(
          { error: "Uploaded video URL is required when uploaded video is provided" },
          { status: 400 },
        );
      }

      if (!uploadedVideo.publicId) {
        return NextResponse.json(
          {
            error: "Uploaded video publicId is required when uploaded video is provided",
          },
          { status: 400 },
        );
      }

      if (!isValidUrl(uploadedVideo.url)) {
        return NextResponse.json(
          { error: "Uploaded video URL is invalid" },
          { status: 400 },
        );
      }

      if (
        uploadedVideo.duration !== undefined &&
        (!Number.isFinite(uploadedVideo.duration) || uploadedVideo.duration < 0)
      ) {
        return NextResponse.json(
          { error: "Uploaded video duration is invalid" },
          { status: 400 },
        );
      }

      if (
        uploadedVideo.width !== undefined &&
        (!Number.isFinite(uploadedVideo.width) || uploadedVideo.width <= 0)
      ) {
        return NextResponse.json(
          { error: "Uploaded video width is invalid" },
          { status: 400 },
        );
      }

      if (
        uploadedVideo.height !== undefined &&
        (!Number.isFinite(uploadedVideo.height) || uploadedVideo.height <= 0)
      ) {
        return NextResponse.json(
          { error: "Uploaded video height is invalid" },
          { status: 400 },
        );
      }
    }

    if (externalVideo) {
      if (externalVideo.url && !isValidUrl(externalVideo.url)) {
        return NextResponse.json(
          { error: "External video URL is invalid" },
          { status: 400 },
        );
      }
    }

    const hasMessage = Boolean(message);
    const hasPhoto = Boolean(photo);
    const hasUploadedVideo = Boolean(uploadedVideo);
    const hasExternalVideo = Boolean(externalVideo?.url);

    if (!hasMessage && !hasPhoto && !hasUploadedVideo && !hasExternalVideo) {
      return NextResponse.json(
        {
          error:
            "Greeting must contain at least one of: message, photo, uploaded video, or external video URL",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const editToken = createEditToken();
    const editTokenHash = await createEditTokenHash(editToken);

    const greeting = await GreetingModel.create({
      name,
      relation: relation || null,
      message: message || null,
      photo: photo
        ? {
            url: photo.url,
            publicId: photo.publicId,
            width: photo.width,
            height: photo.height,
          }
        : null,
      uploadedVideo: uploadedVideo
        ? {
            url: uploadedVideo.url,
            publicId: uploadedVideo.publicId,
            duration: uploadedVideo.duration,
            width: uploadedVideo.width,
            height: uploadedVideo.height,
          }
        : null,
      externalVideo: externalVideo?.url
        ? {
            url: externalVideo.url,
          }
        : null,
      editTokenHash,
    });

    return NextResponse.json(
      {
        success: true,
        greetingId: String(greeting.id),
        editToken,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create greeting" },
      { status: 500 },
    );
  }
}