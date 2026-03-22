import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const greetingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 80,
    },
    relation: {
      type: String,
      trim: true,
      maxlength: 80,
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: null,
    },
    photoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    uploadedVideoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    externalVideoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    externalVideoPreviewImageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    editTokenHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

greetingSchema.pre("validate", function normalizeEmptyStrings() {
  const fields: Array<
    | "relation"
    | "message"
    | "photoUrl"
    | "uploadedVideoUrl"
    | "externalVideoUrl"
    | "externalVideoPreviewImageUrl"
  > = [
    "relation",
    "message",
    "photoUrl",
    "uploadedVideoUrl",
    "externalVideoUrl",
    "externalVideoPreviewImageUrl",
  ];

  for (const field of fields) {
    const value = this.get(field);

    if (typeof value === "string" && value.trim() === "") {
      this.set(field, null);
    }
  }
});

greetingSchema.pre("validate", function validateGreetingContent() {
  const hasMessage = typeof this.message === "string" && this.message.trim().length > 0;
  const hasPhoto = typeof this.photoUrl === "string" && this.photoUrl.trim().length > 0;
  const hasUploadedVideo =
    typeof this.uploadedVideoUrl === "string" && this.uploadedVideoUrl.trim().length > 0;
  const hasExternalVideo =
    typeof this.externalVideoUrl === "string" && this.externalVideoUrl.trim().length > 0;

  if (!hasMessage && !hasPhoto && !hasUploadedVideo && !hasExternalVideo) {
    this.invalidate(
      "message",
      "Greeting must contain at least one of: message, photo, uploaded video, or external video link",
    );
  }

  if (this.externalVideoPreviewImageUrl && !this.externalVideoUrl) {
    this.invalidate(
      "externalVideoPreviewImageUrl",
      "Preview image is allowed only together with external video link",
    );
  }
});
export type GreetingDocument = InferSchemaType<typeof greetingSchema>;

const GreetingModel =
  (models.Greeting as Model<GreetingDocument>) ||
  model<GreetingDocument>("Greeting", greetingSchema);

export default GreetingModel;