import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import GreetingModel from "@/models/greeting.model";

type CreateGreetingRequestBody = {
  name?: string;
  relation?: string;
  message?: string;
  externalVideoUrl?: string;
  externalVideoPreviewImageUrl?: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateGreetingRequestBody;

    const name = body.name?.trim() ?? "";
    const relation = body.relation?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const externalVideoUrl = body.externalVideoUrl?.trim() ?? "";
    const externalVideoPreviewImageUrl =
      body.externalVideoPreviewImageUrl?.trim() ?? "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    if (name.length > 80) {
      return NextResponse.json(
        { error: "Name is too long" },
        { status: 400 },
      );
    }

    if (relation.length > 80) {
      return NextResponse.json(
        { error: "Relation is too long" },
        { status: 400 },
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { error: "Message is too long" },
        { status: 400 },
      );
    }

    if (externalVideoUrl && !isValidUrl(externalVideoUrl)) {
      return NextResponse.json(
        { error: "External video URL is invalid" },
        { status: 400 },
      );
    }

    if (
      externalVideoPreviewImageUrl &&
      !isValidUrl(externalVideoPreviewImageUrl)
    ) {
      return NextResponse.json(
        { error: "External video preview image URL is invalid" },
        { status: 400 },
      );
    }

    if (!message && !externalVideoUrl) {
      return NextResponse.json(
        { error: "Greeting must contain message or external video URL" },
        { status: 400 },
      );
    }

    if (externalVideoPreviewImageUrl && !externalVideoUrl) {
      return NextResponse.json(
        {
          error:
            "External video preview image URL is allowed only with external video URL",
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
      photoUrl: null,
      uploadedVideoUrl: null,
      externalVideoUrl: externalVideoUrl || null,
      externalVideoPreviewImageUrl: externalVideoPreviewImageUrl || null,
      editTokenHash,
    });

    return NextResponse.json(
      {
        success: true,
        greetingId: greeting._id.toString(),
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