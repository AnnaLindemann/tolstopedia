import "server-only";

import { isValidObjectId } from "mongoose";

import  GreetingModel  from "@/models/greeting.model";

type VerifyGreetingEditAccessSuccess = {
  ok: true;
  greeting: {
    id: string;
    name: string;
    relation: string;
    message: string;
    externalVideoUrl: string;
    externalVideoPreviewImageUrl: string;
  };
};

type VerifyGreetingEditAccessErrorCode =
  | "INVALID_ID"
  | "MISSING_TOKEN"
  | "NOT_FOUND"
  | "FORBIDDEN";

type VerifyGreetingEditAccessError = {
  ok: false;
  code: VerifyGreetingEditAccessErrorCode;
  message: string;
};

export type VerifyGreetingEditAccessResult =
  | VerifyGreetingEditAccessSuccess
  | VerifyGreetingEditAccessError;

async function createEditTokenHash(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyGreetingEditAccess(
  greetingId: string,
  token: string | null,
): Promise<VerifyGreetingEditAccessResult> {
  if (!isValidObjectId(greetingId)) {
    return {
      ok: false,
      code: "INVALID_ID",
      message: "Некорректная ссылка для редактирования.",
    };
  }

  if (!token || token.trim().length === 0) {
    return {
      ok: false,
      code: "MISSING_TOKEN",
      message: "В ссылке отсутствует ключ редактирования.",
    };
  }

  const greeting = await GreetingModel.findById(greetingId).lean();

  if (!greeting) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Поздравление не найдено.",
    };
  }

  const tokenHash = await createEditTokenHash(token);

  if (!greeting.editTokenHash || greeting.editTokenHash !== tokenHash) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Ссылка для редактирования недействительна или устарела.",
    };
  }

  return {
    ok: true,
    greeting: {
      id: String(greeting._id),
      name: greeting.name ?? "",
      relation: greeting.relation ?? "",
      message: greeting.message ?? "",
      externalVideoUrl: greeting.externalVideoUrl ?? "",
      externalVideoPreviewImageUrl:
        greeting.externalVideoPreviewImageUrl ?? "",
    },
  };
}