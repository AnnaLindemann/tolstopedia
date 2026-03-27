import { Schema, model, models, type HydratedDocument, type Model } from "mongoose";

export interface MediaAsset {
  url: string;
  publicId: string;
}

export interface GalleryItem {
  title: string | null;
  image: MediaAsset;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type GalleryItemDocument = HydratedDocument<GalleryItem>;
type GalleryItemModelType = Model<GalleryItem>;

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

const galleryItemSchema = new Schema<GalleryItem, GalleryItemModelType>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    image: {
      type: mediaAssetSchema,
      required: true,
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
  }
);

export const GalleryItemModel =
  (models.GalleryItem as GalleryItemModelType | undefined) ??
  model<GalleryItem, GalleryItemModelType>("GalleryItem", galleryItemSchema);