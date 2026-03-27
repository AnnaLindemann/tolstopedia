import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export interface UploadedVideo {
  url: string;
  publicId: string;
  duration: number | null;
}

export interface ExternalVideo {
  url: string;
}

export interface VideoItem {
  title: string | null;
  uploadedVideo: UploadedVideo | null;
  externalVideo: ExternalVideo | null;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoItemDocument = HydratedDocument<VideoItem>;
type VideoItemModelType = Model<VideoItem>;

const uploadedVideoSchema = new Schema<UploadedVideo>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const externalVideoSchema = new Schema<ExternalVideo>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const videoItemSchema = new Schema<VideoItem, VideoItemModelType>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    uploadedVideo: {
      type: uploadedVideoSchema,
      default: null,
    },
    externalVideo: {
      type: externalVideoSchema,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

videoItemSchema.pre("validate", function normalizeEmptyValues() {
  if (typeof this.title === "string" && this.title.trim() === "") {
    this.set("title", null);
  }

  const uploadedVideo = this.uploadedVideo;
  if (uploadedVideo && typeof uploadedVideo.url === "string" && uploadedVideo.url.trim() === "") {
    this.set("uploadedVideo", null);
  }

  const externalVideo = this.externalVideo;
  if (externalVideo && typeof externalVideo.url === "string" && externalVideo.url.trim() === "") {
    this.set("externalVideo", null);
  }
});

videoItemSchema.pre("validate", function validateVideoType() {
  const hasUploaded =
    typeof this.uploadedVideo?.url === "string" &&
    this.uploadedVideo.url.trim().length > 0;

  const hasExternal =
    typeof this.externalVideo?.url === "string" &&
    this.externalVideo.url.trim().length > 0;

  if (!hasUploaded && !hasExternal) {
    this.invalidate(
      "uploadedVideo",
      "Нужно указать либо загруженное видео, либо внешнюю ссылку на видео",
    );
  }

  if (hasUploaded && hasExternal) {
    this.invalidate(
      "uploadedVideo",
      "Нельзя одновременно указать загруженное видео и внешнюю ссылку на видео",
    );
  }
});

export const VideoItemModel =
  (models.VideoItem as VideoItemModelType | undefined) ??
  model<VideoItem, VideoItemModelType>("VideoItem", videoItemSchema);