import type { Greeting, GreetingLeanDocument } from "@/types/greeting";

export function mapGreetingLeanToPublic(greeting: GreetingLeanDocument): Greeting {
  const photo = greeting.photo ?? null;
  const uploadedVideo = greeting.uploadedVideo ?? null;
  const externalVideo = greeting.externalVideo ?? null;

  return {
    id: greeting._id.toString(),
    name: greeting.name,
    relation: greeting.relation ?? null,
    message: greeting.message ?? null,

    photo,
    uploadedVideo,
    externalVideo,

    createdAt: greeting.createdAt.toISOString(),

    // Temporary flat compatibility fields
    photoUrl: photo?.url ?? null,
    uploadedVideoUrl: uploadedVideo?.url ?? null,
    externalVideoUrl: externalVideo?.url ?? null,
  };
}
