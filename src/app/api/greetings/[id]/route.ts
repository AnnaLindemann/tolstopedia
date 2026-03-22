import { NextResponse } from "next/server";

import { verifyGreetingEditAccess } from "@/features/greetings/server/verify-greeting-edit-access";
import GreetingModel from "@/models/greeting.model";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UploadedMediaInput = {
  url?: string;
  publicId?: string;
};

type UpdateGreetingBody = {
  token?: string;
  name?: string;
  relation?: string;
  message?: string;
  externalVideoUrl?: string;
  externalVideoPreviewImageUrl?: string;
  clearPhoto?: boolean;
  clearUploadedVideo?: boolean;
  photo?: UploadedMediaInput | null;
  uploadedVideo?: UploadedMediaInput | null;
};

type DeleteGreetingBody = {
  token?: string;
};

type GreetingDocumentShape = {
  _id: unknown;
  name?: string | null;
  relation?: string | null;
  message?: string | null;
  photo?: {
    url?: string | null;
    publicId?: string | null;
  } | null;
  uploadedVideo?: {
    url?: string | null;
    publicId?: string | null;
  } | null;
  externalVideo?: {
    url?: string | null;
    previewImageUrl?: string | null;
    previewImagePublicId?: string | null;
  } | null;
};

function normalizeOptionalString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeUploadedMedia(
  value: unknown,
): { url: string; publicId: string } | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const url = normalizeOptionalString(candidate.url);
  const publicId = normalizeOptionalString(candidate.publicId);

  if (!url && !publicId) {
    return null;
  }

  return {
    url,
    publicId,
  };
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

  const token = typeof body.token === "string" ? body.token : "";

  const accessResult = await verifyGreetingEditAccess({
    greetingId: id,
    token,
  });

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

  const clearPhoto = normalizeBoolean(body.clearPhoto);
  const clearUploadedVideo = normalizeBoolean(body.clearUploadedVideo);

  const nextPhotoInput = normalizeUploadedMedia(body.photo);
  const nextUploadedVideoInput = normalizeUploadedMedia(body.uploadedVideo);

  if (!name) {
    return NextResponse.json(
      {
        ok: false,
        message: "Имя обязательно.",
      },
      { status: 400 },
    );
  }

  if (name.length > 80) {
    return NextResponse.json(
      {
        ok: false,
        message: "Имя слишком длинное.",
      },
      { status: 400 },
    );
  }

  if (relation.length > 80) {
    return NextResponse.json(
      {
        ok: false,
        message: "Подпись слишком длинная.",
      },
      { status: 400 },
    );
  }

  if (message.length > 3000) {
    return NextResponse.json(
      {
        ok: false,
        message: "Текст поздравления слишком длинный.",
      },
      { status: 400 },
    );
  }

  if (externalVideoUrl && !isValidUrl(externalVideoUrl)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Ссылка на внешнее видео некорректна.",
      },
      { status: 400 },
    );
  }

  if (externalVideoPreviewImageUrl && !externalVideoUrl) {
    return NextResponse.json(
      {
        ok: false,
        message: "Ссылка на превью возможна только вместе со ссылкой на внешнее видео.",
      },
      { status: 400 },
    );
  }

  if (externalVideoPreviewImageUrl && !isValidUrl(externalVideoPreviewImageUrl)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Ссылка на превью видео некорректна.",
      },
      { status: 400 },
    );
  }

  if (nextPhotoInput) {
    if (!nextPhotoInput.url || !nextPhotoInput.publicId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Новое фото должно содержать url и publicId.",
        },
        { status: 400 },
      );
    }

    if (!isValidUrl(nextPhotoInput.url)) {
      return NextResponse.json(
        {
          ok: false,
          message: "URL нового фото некорректен.",
        },
        { status: 400 },
      );
    }
  }

  if (nextUploadedVideoInput) {
    if (!nextUploadedVideoInput.url || !nextUploadedVideoInput.publicId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Новое видео должно содержать url и publicId.",
        },
        { status: 400 },
      );
    }

    if (!isValidUrl(nextUploadedVideoInput.url)) {
      return NextResponse.json(
        {
          ok: false,
          message: "URL нового видео некорректен.",
        },
        { status: 400 },
      );
    }
  }

  const currentGreeting = await GreetingModel.findById(id).lean<GreetingDocumentShape | null>();

  if (!currentGreeting) {
    return NextResponse.json(
      {
        ok: false,
        message: "Поздравление не найдено.",
      },
      { status: 404 },
    );
  }

  const nextPhoto =
    clearPhoto
      ? null
      : nextPhotoInput
        ? {
            url: nextPhotoInput.url,
            publicId: nextPhotoInput.publicId,
          }
        : (currentGreeting.photo ?? null);

  const nextUploadedVideo =
    clearUploadedVideo
      ? null
      : nextUploadedVideoInput
        ? {
            url: nextUploadedVideoInput.url,
            publicId: nextUploadedVideoInput.publicId,
          }
        : (currentGreeting.uploadedVideo ?? null);

  const nextExternalVideo = externalVideoUrl
    ? {
        url: externalVideoUrl,
        previewImageUrl: externalVideoPreviewImageUrl || null,
        previewImagePublicId:
          currentGreeting.externalVideo?.previewImagePublicId ?? null,
      }
    : null;

  const hasAnyAllowedContent =
    message.length > 0 ||
    Boolean(nextPhoto?.url) ||
    Boolean(nextUploadedVideo?.url) ||
    Boolean(nextExternalVideo?.url);

  if (!hasAnyAllowedContent) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Нужно оставить хотя бы один формат поздравления: текст, фото, загруженное видео или внешнюю ссылку.",
      },
      { status: 400 },
    );
  }

  const updatedGreeting = await GreetingModel.findByIdAndUpdate(
    id,
    {
      $set: {
        name,
        relation: relation || null,
        message: message || null,
        photo: nextPhoto,
        uploadedVideo: nextUploadedVideo,
        externalVideo: nextExternalVideo,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean<GreetingDocumentShape | null>();

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
      photoUrl: updatedGreeting.photo?.url ?? "",
      uploadedVideoUrl: updatedGreeting.uploadedVideo?.url ?? "",
      externalVideoUrl: updatedGreeting.externalVideo?.url ?? "",
      externalVideoPreviewImageUrl:
        updatedGreeting.externalVideo?.previewImageUrl ?? "",
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

  const token = typeof body.token === "string" ? body.token : "";

  const accessResult = await verifyGreetingEditAccess({
    greetingId: id,
    token,
  });

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