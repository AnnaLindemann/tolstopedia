export type GreetingMediaKind = "photo" | "uploadedVideo" | "externalVideo";

export interface Greeting {
  id: string;
  name: string;
  relation: string | null;
  message: string | null;
  photoUrl: string | null;
  uploadedVideoUrl: string | null;
  externalVideoUrl: string | null;
  externalVideoPreviewImageUrl: string | null;
  createdAt: string;
}