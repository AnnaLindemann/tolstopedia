import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { reorderGalleryItems } from "@/lib/gallery";

type ReorderBody = {
  items: string[];
};

export async function POST(request: Request) {
  let body: ReorderBody;

  try {
    body = (await request.json()) as ReorderBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.items)) {
    return NextResponse.json(
      { ok: false, error: "items must be an array" },
      { status: 400 }
    );
  }

  if (body.items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "items must not be empty" },
      { status: 400 }
    );
  }

  for (const id of body.items) {
    if (typeof id !== "string" || !isValidObjectId(id)) {
      return NextResponse.json(
        { ok: false, error: `Invalid item id: ${id}` },
        { status: 400 }
      );
    }
  }

  const unique = new Set(body.items);
  if (unique.size !== body.items.length) {
    return NextResponse.json(
      { ok: false, error: "items must not contain duplicates" },
      { status: 400 }
    );
  }

  try {
    await reorderGalleryItems(body.items);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("does not match total gallery count")) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 404 }
        );
      }
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
