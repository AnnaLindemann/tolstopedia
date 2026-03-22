import { NextResponse } from "next/server";

import { verifyGreetingEditAccess } from "@/features/greetings/server/verify-greeting-edit-access";
import GreetingModel from "@/models/greeting.model";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateGreetingBody = {
  token?: string;
  name?: string;
  relation?: string;
  message?: string;
  externalVideoUrl?: string;
  externalVideoPreviewImageUrl?: string;
};

type DeleteGreetingBody = {
  token?: string;
};

function normalizeOptionalString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function hasNonEmptyStringField(
  source: Record<string, unknown>,
  fieldNames: string[],
): boolean {
  return fieldNames.some((fieldName) => {
    const value = source[fieldName];

    return typeof value === "string" && value.trim().length > 0;
  });
}

function getAccessErrorStatus(code: string): number {
  if (code === "INVALID_ID" || code === "MISSING_TOKEN") {
    return 400;
  }

  if (code === "NOT_FOUND") {
    return 404;
  }

  return 403;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: UpdateGreetingBody;

  try {
    body = (await request.json()) as UpdateGreetingBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Некорректное тело запроса.",
      },
      { status: 400 },
    );
  }

  const token = typeof body.token === "string" ? body.token : null;

  const accessResult = await verifyGreetingEditAccess(id, token);

  if (!accessResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: accessResult.message,
      },
      { status: getAccessErrorStatus(accessResult.code) },
    );
  }

  const name = normalizeOptionalString(body.name);
  const relation = normalizeOptionalString(body.relation);
  const message = normalizeOptionalString(body.message);
  const externalVideoUrl = normalizeOptionalString(body.externalVideoUrl);
  const externalVideoPreviewImageUrl = normalizeOptionalString(
    body.externalVideoPreviewImageUrl,
  );

  const currentGreeting = await GreetingModel.findById(id).lean();

  if (!currentGreeting) {
    return NextResponse.json(
      {
        ok: false,
        message: "Поздравление не найдено.",
      },
      { status: 404 },
    );
  }

  const currentGreetingRecord = currentGreeting as Record<string, unknown>;

  const nextHasMessage = message.length > 0;
  const nextHasExternalVideoUrl = externalVideoUrl.length > 0;

  const currentHasPhoto = hasNonEmptyStringField(currentGreetingRecord, [
    "photoUrl",
    "imageUrl",
    "photo",
  ]);

  const currentHasUploadedVideo = hasNonEmptyStringField(currentGreetingRecord, [
    "videoUrl",
    "uploadedVideoUrl",
    "video",
  ]);

  const hasAnyAllowedContent =
    nextHasMessage ||
    nextHasExternalVideoUrl ||
    currentHasPhoto ||
    currentHasUploadedVideo;

  if (!hasAnyAllowedContent) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Нужно оставить хотя бы один формат поздравления: текст, фото или видео.",
      },
      { status: 400 },
    );
  }

  const updatedGreeting = await GreetingModel.findByIdAndUpdate(
    id,
    {
      $set: {
        name,
        relation,
        message,
        externalVideoUrl,
        externalVideoPreviewImageUrl,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updatedGreeting) {
    return NextResponse.json(
      {
        ok: false,
        message: "Поздравление не найдено.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Поздравление обновлено.",
    greeting: {
      id: String(updatedGreeting._id),
      name: updatedGreeting.name ?? "",
      relation: updatedGreeting.relation ?? "",
      message: updatedGreeting.message ?? "",
      externalVideoUrl: updatedGreeting.externalVideoUrl ?? "",
      externalVideoPreviewImageUrl:
        updatedGreeting.externalVideoPreviewImageUrl ?? "",
    },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: DeleteGreetingBody;

  try {
    body = (await request.json()) as DeleteGreetingBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Некорректное тело запроса.",
      },
      { status: 400 },
    );
  }

  const token = typeof body.token === "string" ? body.token : null;

  const accessResult = await verifyGreetingEditAccess(id, token);

  if (!accessResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: accessResult.message,
      },
      { status: getAccessErrorStatus(accessResult.code) },
    );
  }

  const deletedGreeting = await GreetingModel.findByIdAndDelete(id).lean();

  if (!deletedGreeting) {
    return NextResponse.json(
      {
        ok: false,
        message: "Поздравление не найдено.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Поздравление удалено.",
  });
}