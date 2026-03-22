import GreetingModel from "@/models/greeting.model";
import { mapGreetingToPublic } from "@/lib/greetings/map-greeting";
import type { Greeting } from "@/types/greeting";
import { connectToDatabase } from "../db";

const DEFAULT_LIMIT = 10;

export async function getLatestGreetings(limit = DEFAULT_LIMIT): Promise<Greeting[]> {
  await connectToDatabase();

  const greetings = await GreetingModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<GreetingLeanDocument[]>();

  return greetings.map(mapGreetingLeanToPublic);
}

type GreetingLeanDocument = {
  _id: { toString(): string };
  name: string;
  relation: string | null;
  message: string | null;
  photoUrl: string | null;
  uploadedVideoUrl: string | null;
  externalVideoUrl: string | null;
  externalVideoPreviewImageUrl: string | null;
  createdAt: Date;
};

function mapGreetingLeanToPublic(greeting: GreetingLeanDocument): Greeting {
  return {
    id: greeting._id.toString(),
    name: greeting.name,
    relation: greeting.relation,
    message: greeting.message,
    photoUrl: greeting.photoUrl,
    uploadedVideoUrl: greeting.uploadedVideoUrl,
    externalVideoUrl: greeting.externalVideoUrl,
    externalVideoPreviewImageUrl: greeting.externalVideoPreviewImageUrl,
    createdAt: greeting.createdAt.toISOString(),
  };
}