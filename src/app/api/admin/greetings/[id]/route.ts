import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import GreetingModel from "@/models/greeting.model";
import { connectToDatabase } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateGreetingBody = {
  name?: string;
  relation?: string | null;
  message?: string | null;
  isHidden?: boolean;
};

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function validateUpdateBody(body: UpdateGreetingBody): string | null {
  if (
    body.name === undefined &&
    body.relation === undefined &&
    body.message === undefined &&
    body.isHidden === undefined
  ) {
    return "No fields provided for update";
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string") {
      return "Name must be a string";
    }

    const trimmedName = body.name.trim();

    if (trimmedName.length === 0) {
      return "Name is required";
    }

    if (trimmedName.length > 80) {
      return "Name must be 80 characters or less";
    }
  }

  if (body.relation !== undefined && body.relation !== null) {
    if (typeof body.relation !== "string") {
      return "Relation must be a string";
    }

    if (body.relation.trim().length > 80) {
      return "Relation must be 80 characters or less";
    }
  }

  if (body.message !== undefined && body.message !== null) {
    if (typeof body.message !== "string") {
      return "Message must be a string";
    }

    if (body.message.trim().length > 3000) {
      return "Message must be 3000 characters or less";
    }
  }

  if (body.isHidden !== undefined && typeof body.isHidden !== "boolean") {
    return "isHidden must be a boolean";
  }

  return null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid greeting id" },
      { status: 400 }
    );
  }

  let body: UpdateGreetingBody;

  try {
    body = (await request.json()) as UpdateGreetingBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const validationError = validateUpdateBody(body);

  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const updateData: Partial<{
    name: string;
    relation: string | null;
    message: string | null;
    isHidden: boolean;
  }> = {};

  if (body.name !== undefined) {
    updateData.name = body.name.trim();
  }

  if (body.relation !== undefined) {
    updateData.relation = normalizeOptionalText(body.relation);
  }

  if (body.message !== undefined) {
    updateData.message = normalizeOptionalText(body.message);
  }

  if (body.isHidden !== undefined) {
    updateData.isHidden = body.isHidden;
  }

  const updatedGreeting = await GreetingModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select({
    _id: 1,
    name: 1,
    relation: 1,
    message: 1,
    isHidden: 1,
    updatedAt: 1,
  });

  if (!updatedGreeting) {
    return NextResponse.json(
      { ok: false, error: "Greeting not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      id: updatedGreeting._id.toString(),
      name: updatedGreeting.name,
      relation: updatedGreeting.relation,
      message: updatedGreeting.message,
      isHidden: updatedGreeting.isHidden,
      updatedAt: updatedGreeting.updatedAt,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid greeting id" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const deletedGreeting = await GreetingModel.findByIdAndDelete(id).select({
    _id: 1,
  });

  if (!deletedGreeting) {
    return NextResponse.json(
      { ok: false, error: "Greeting not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      id: deletedGreeting._id.toString(),
    },
  });
}