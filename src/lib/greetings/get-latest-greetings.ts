import { Types } from "mongoose";

import GreetingModel from "@/models/greeting.model";
import { connectToDatabase } from "@/lib/db";
import { mapGreetingLeanToPublic } from "./map-greeting";
import type {
  GetLatestGreetingsResult,
  GreetingLeanDocument,
  GreetingsCursor,
} from "@/types/greeting";

const DEFAULT_LIMIT = 10;

type GetLatestGreetingsOptions = {
  limit?: number;
  cursor?: GreetingsCursor;
};

type ParsedCursor = {
  createdAt: Date;
  id: Types.ObjectId;
};

function parseCursor(cursor: GreetingsCursor): ParsedCursor | null {
  if (!cursor) {
    return null;
  }

  const [createdAtValue, idValue] = cursor.split("__");

  if (!createdAtValue || !idValue) {
    return null;
  }

  const createdAt = new Date(createdAtValue);

  if (Number.isNaN(createdAt.getTime()) || !Types.ObjectId.isValid(idValue)) {
    return null;
  }

  return {
    createdAt,
    id: new Types.ObjectId(idValue),
  };
}

function buildCursor(greeting: GreetingLeanDocument): string {
  return `${greeting.createdAt.toISOString()}__${greeting._id.toString()}`;
}

export async function getLatestGreetings(
  options: GetLatestGreetingsOptions = {},
): Promise<GetLatestGreetingsResult> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const parsedCursor = parseCursor(options.cursor ?? null);

  await connectToDatabase();

  const filter = parsedCursor
    ? {
        $or: [
          { createdAt: { $lt: parsedCursor.createdAt } },
          {
            createdAt: parsedCursor.createdAt,
            _id: { $lt: parsedCursor.id },
          },
        ],
      }
    : {};

  const greetings = await GreetingModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean<GreetingLeanDocument[]>();

  const hasMore = greetings.length > limit;
  const itemsToReturn = hasMore ? greetings.slice(0, limit) : greetings;
  const lastGreeting =
    itemsToReturn.length > 0 ? itemsToReturn[itemsToReturn.length - 1] : null;

  return {
    items: itemsToReturn.map(mapGreetingLeanToPublic),
    nextCursor: hasMore && lastGreeting ? buildCursor(lastGreeting) : null,
    hasMore,
  };
}