import GreetingModel from "@/models/greeting.model";
import { connectToDatabase } from "@/lib/db";
import { mapGreetingLeanToPublic } from "./map-greeting";
import type { Greeting, GreetingLeanDocument } from "@/types/greeting";

const DEFAULT_LIMIT = 10;

export async function getLatestGreetings(limit = DEFAULT_LIMIT): Promise<Greeting[]> {
  await connectToDatabase();

  const greetings = await GreetingModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<GreetingLeanDocument[]>();

  return greetings.map(mapGreetingLeanToPublic);
}