import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export interface MomPage {
  title: string;
  introText: string;
  shortBiography: string;
  heroImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MomPageDocument = HydratedDocument<MomPage>;
type MomPageModelType = Model<MomPage>;

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
    heroImageUrl: {
      type: String,
      required: true,
      trim: true,
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