import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export interface MediaAsset {
  url: string;
  publicId: string;
}

export interface BiographyPage {
  title: string;
  content: string;
  mainImage: MediaAsset | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BiographyPageDocument = HydratedDocument<BiographyPage>;
type BiographyPageModelType = Model<BiographyPage>;

const mediaAssetSchema = new Schema<MediaAsset>(
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
  },
  { _id: false }
);

const biographyPageSchema = new Schema<BiographyPage, BiographyPageModelType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    mainImage: {
      type: mediaAssetSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const BiographyPageModel =
  (models.BiographyPage as BiographyPageModelType | undefined) ??
  model<BiographyPage, BiographyPageModelType>("BiographyPage", biographyPageSchema);