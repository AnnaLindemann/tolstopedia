import { connectToDatabase } from "@/lib/db";
import {
  GalleryItemModel,
  type GalleryItemDocument,
  type MediaAsset,
} from "@/models/gallery-item.model";

export type GalleryItemListItem = {
  id: string;
  title: string | null;
  image: MediaAsset;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateGalleryItemInput = {
  title: string | null;
  image: MediaAsset;
  isPublished?: boolean;
};

function mapGalleryItem(document: GalleryItemDocument): GalleryItemListItem {
  return {
    id: document._id.toString(),
    title: document.title,
    image: {
      url: document.image.url,
      publicId: document.image.publicId,
    },
    order: document.order,
    isPublished: document.isPublished,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

async function getNextGalleryOrder(): Promise<number> {
  const lastItem = await GalleryItemModel.findOne({}, { order: 1 })
    .sort({ order: -1, createdAt: -1 })
    .exec();

  if (!lastItem) {
    return 0;
  }

  return lastItem.order + 1;
}

export async function getAdminGalleryItems(): Promise<GalleryItemListItem[]> {
  await connectToDatabase();

  const items = await GalleryItemModel.find({})
    .sort({ order: 1, createdAt: -1 })
    .exec();

  return items.map(mapGalleryItem);
}

export async function getPublishedGalleryItems(): Promise<GalleryItemListItem[]> {
  await connectToDatabase();

  const items = await GalleryItemModel.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 })
    .exec();

  return items.map(mapGalleryItem);
}

export async function createGalleryItem(
  input: CreateGalleryItemInput,
): Promise<GalleryItemListItem> {
  await connectToDatabase();

  const nextOrder = await getNextGalleryOrder();

  const createdItem = await GalleryItemModel.create({
    title: input.title,
    image: {
      url: input.image.url,
      publicId: input.image.publicId,
    },
    order: nextOrder,
    isPublished: input.isPublished ?? true,
  });

  return mapGalleryItem(createdItem);
}