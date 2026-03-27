import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const photoSchema = new Schema(
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
    width: {
      type: Number,
      min: 1,
      default: null,
    },
    height: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const uploadedVideoSchema = new Schema(
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
    width: {
      type: Number,
      min: 1,
      default: null,
    },
    height: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const externalVideoSchema = new Schema(
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
    photo: {
      type: photoSchema,
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
    isHidden: {
      type: Boolean,
      default: false,
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
  if (typeof this.relation === "string" && this.relation.trim() === "") {
    this.set("relation", null);
  }

  if (typeof this.message === "string" && this.message.trim() === "") {
    this.set("message", null);
  }

  const photo = this.photo;
  if (photo && typeof photo.url === "string" && photo.url.trim() === "") {
    this.set("photo", null);
  }

  const uploadedVideo = this.uploadedVideo;
  if (
    uploadedVideo &&
    typeof uploadedVideo.url === "string" &&
    uploadedVideo.url.trim() === ""
  ) {
    this.set("uploadedVideo", null);
  }

  const externalVideo = this.externalVideo;
  if (externalVideo && typeof externalVideo.url === "string" && externalVideo.url.trim() === "") {
    this.set("externalVideo", null);
  }
});

greetingSchema.pre("validate", function validateGreetingContent() {
  const message = this.message;
  const photo = this.photo;
  const uploadedVideo = this.uploadedVideo;
  const externalVideo = this.externalVideo;

  const hasMessage = typeof message === "string" && message.trim().length > 0;
  const hasPhoto = typeof photo?.url === "string" && photo.url.trim().length > 0;
  const hasUploadedVideo =
    typeof uploadedVideo?.url === "string" && uploadedVideo.url.trim().length > 0;
  const hasExternalVideo =
    typeof externalVideo?.url === "string" && externalVideo.url.trim().length > 0;

  if (!hasMessage && !hasPhoto && !hasUploadedVideo && !hasExternalVideo) {
    this.invalidate(
      "message",
      "Поздравление должно содержать: текст, фото, загруженное видео или ссылку на видео",
    );
  }
});

export type GreetingDocument = InferSchemaType<typeof greetingSchema>;

const GreetingModel =
  (models.Greeting as Model<GreetingDocument>) ||
  model<GreetingDocument>("Greeting", greetingSchema);

export default GreetingModel;