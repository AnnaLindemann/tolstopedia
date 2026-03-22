import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export interface MediaAsset {
  url: string;
  publicId: string;
}

export interface MomPage {
  title: string;
  introText: string;
  shortBiography: string;
  heroImage: MediaAsset;
  createdAt: Date;
  updatedAt: Date;
}

export type MomPageDocument = HydratedDocument<MomPage>;
type MomPageModelType = Model<MomPage>;

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
  {
    _id: false,
  },
);

const momPageSchema = new Schema<MomPage, MomPageModelType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    introText: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    shortBiography: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1500,
    },
    heroImage: {
      type: mediaAssetSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const MomPageModel =
  (models.MomPage as MomPageModelType | undefined) ??
  model<MomPage, MomPageModelType>("MomPage", momPageSchema);