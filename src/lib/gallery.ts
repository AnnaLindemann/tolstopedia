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
    .sort({ order: 1, _id: 1 })
    .exec();

  return items.map(mapGalleryItem);
}

export async function getPublishedGalleryItems(): Promise<GalleryItemListItem[]> {
  await connectToDatabase();

  const items = await GalleryItemModel.find({ isPublished: true })
    .sort({ order: 1, _id: 1 })
    .exec();

  return items.map(mapGalleryItem);
}

export async function reorderGalleryItems(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;

  await connectToDatabase();

  const totalCount = await GalleryItemModel.countDocuments();

  if (orderedIds.length !== totalCount) {
    throw new Error(
      `items length (${orderedIds.length}) does not match total gallery count (${totalCount})`,
    );
  }

  const existingItems = await GalleryItemModel.find(
    { _id: { $in: orderedIds } },
    { _id: 1 },
  ).exec();

  if (existingItems.length !== orderedIds.length) {
    throw new Error("Some gallery item IDs were not found");
  }

  const ops = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await GalleryItemModel.bulkWrite(ops);
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