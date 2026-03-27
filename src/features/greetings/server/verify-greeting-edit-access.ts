import { connectToDatabase } from "@/lib/db";
import GreetingModel from "@/models/greeting.model";

type VerifyGreetingEditAccessParams = {
  greetingId: string;
  token: string;
};

type VerifyGreetingEditAccessResult =
  | {
      ok: true;
      greeting: {
        id: string;
        name: string;
        relation: string;
        message: string;
        photoUrl: string;
        uploadedVideoUrl: string;
        externalVideoUrl: string;
      };
    }
  | {
      ok: false;
      code: "NOT_FOUND" | "FORBIDDEN";
      message: string;
    };

type GreetingLeanDocument = {
  _id: unknown;
  name?: string | null;
  relation?: string | null;
  message?: string | null;
  editTokenHash?: string | null;
  photo?: {
    url?: string | null;
  } | null;
  uploadedVideo?: {
    url?: string | null;
  } | null;
  externalVideo?: {
    url?: string | null;
  } | null;
};

function isValidObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function createEditTokenHash(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyGreetingEditAccess({
  greetingId,
  token,
}: VerifyGreetingEditAccessParams): Promise<VerifyGreetingEditAccessResult> {
  if (!isValidObjectId(greetingId)) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Поздравление не найдено.",
    };
  }

  await connectToDatabase();

  const greeting = await GreetingModel.findById(greetingId).lean<GreetingLeanDocument | null>();

  if (!greeting) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "Поздравление не найдено.",
    };
  }

  const tokenHash = await createEditTokenHash(token);

  if (greeting.editTokenHash !== tokenHash) {
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
      name: normalizeString(greeting.name),
      relation: normalizeString(greeting.relation),
      message: normalizeString(greeting.message),
      photoUrl: normalizeString(greeting.photo?.url),
      uploadedVideoUrl: normalizeString(greeting.uploadedVideo?.url),
      externalVideoUrl: normalizeString(greeting.externalVideo?.url),
    },
  };
}
