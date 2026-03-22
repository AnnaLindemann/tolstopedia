export type GreetingMediaKind = "image" | "video";

export type GreetingStoredMedia = {
  url: string;
  publicId: string;
};

export type GreetingExternalVideo = {
  url: string;
  previewImage: GreetingStoredMedia | null;
};

export type Greeting = {
  id: string;
  name: string;
  relation: string | null;
  message: string | null;

  photo: GreetingStoredMedia | null;
  uploadedVideo: GreetingStoredMedia | null;
  externalVideo: GreetingExternalVideo | null;

  createdAt: string;

  /**
   * Temporary backward-compatible flat fields for old UI consumers.
   * Remove after all consumers are migrated to nested media.
   */
  photoUrl: string | null;
  uploadedVideoUrl: string | null;
  externalVideoUrl: string | null;
  externalVideoPreviewImageUrl: string | null;
};

export type GreetingLeanDocument = {
  _id: { toString(): string };
  name: string;
  relation?: string | null;
  message?: string | null;

  photo?: GreetingStoredMedia | null;
  uploadedVideo?: GreetingStoredMedia | null;
  externalVideo?: GreetingExternalVideo | null;

  createdAt: Date;
};

export type CreateGreetingMediaInput = {
  url: string;
  publicId: string;
};

export type CreateGreetingExternalVideoInput = {
  url: string;
  previewImage?: CreateGreetingMediaInput | null;
};

export type CreateGreetingInput = {
  name: string;
  relation?: string;
  message?: string;
  photo?: CreateGreetingMediaInput | null;
  uploadedVideo?: CreateGreetingMediaInput | null;
  externalVideo?: CreateGreetingExternalVideoInput | null;
};