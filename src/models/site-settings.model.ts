import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export interface SiteSettings {
  sharedPasswordHash: string;
  passwordVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SiteSettingsDocument = HydratedDocument<SiteSettings>;
type SiteSettingsModelType = Model<SiteSettings>;

const siteSettingsSchema = new Schema<SiteSettings, SiteSettingsModelType>(
  {
    sharedPasswordHash: {
      type: String,
      required: true,
      trim: true,
    },
    passwordVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SiteSettingsModel =
  (models.SiteSettings as SiteSettingsModelType | undefined) ??
  model<SiteSettings, SiteSettingsModelType>("SiteSettings", siteSettingsSchema);