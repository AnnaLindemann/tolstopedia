import type { Greeting } from "@/types/greeting";
import type { GreetingDocument } from "@/models/greeting.model";

type GreetingDocumentWithMeta = GreetingDocument & {
  _id: { toString(): string };
  createdAt: Date;
};

export function mapGreetingToPublic(greeting: GreetingDocumentWithMeta): Greeting {
  return {
    id: greeting._id.toString(),
    name: greeting.name,
    relation: greeting.relation ?? null,
    message: greeting.message ?? null,
    photoUrl: greeting.photoUrl ?? null,
    uploadedVideoUrl: greeting.uploadedVideoUrl ?? null,
    externalVideoUrl: greeting.externalVideoUrl ?? null,
    externalVideoPreviewImageUrl: greeting.externalVideoPreviewImageUrl ?? null,
    createdAt: greeting.createdAt.toISOString(),
  };
}