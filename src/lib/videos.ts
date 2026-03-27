import { connectToDatabase } from "@/lib/db";
import {
  VideoItemModel,
  type VideoItemDocument,
} from "@/models/video-item.model";

export type VideoListItem = {
  id: string;
  title: string | null;
  uploadedVideo: {
    url: string;
    publicId: string;
    duration: number | null;
  } | null;
  externalVideo: {
    url: string;
  } | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateVideoItemInput = {
  title: string | null;
  uploadedVideo?:
    | {
        url: string;
        publicId: string;
        duration: number | null;
      }
    | null;
  externalVideo?:
    | {
        url: string;
      }
    | null;
  isPublished?: boolean;
};

function mapVideoItem(document: VideoItemDocument): VideoListItem {
  return {
    id: document._id.toString(),
    title: document.title,
    uploadedVideo: document.uploadedVideo
      ? {
          url: document.uploadedVideo.url,
          publicId: document.uploadedVideo.publicId,
          duration: document.uploadedVideo.duration ?? null,
        }
      : null,
    externalVideo: document.externalVideo
      ? {
          url: document.externalVideo.url,
        }
      : null,
    order: document.order,
    isPublished: document.isPublished,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

async function getNextVideoOrder(): Promise<number> {
  const lastItem = await VideoItemModel.findOne({}, { order: 1 })
    .sort({ order: -1, createdAt: -1 })
    .exec();

  if (!lastItem) {
    return 0;
  }

  return lastItem.order + 1;
}

export async function getAdminVideoItems(): Promise<VideoListItem[]> {
  await connectToDatabase();

  const items = await VideoItemModel.find({})
    .sort({ order: 1, createdAt: -1 })
    .exec();

  return items.map(mapVideoItem);
}

export async function getPublishedVideoItems(): Promise<VideoListItem[]> {
  await connectToDatabase();

  const items = await VideoItemModel.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 })
    .exec();

  return items.map(mapVideoItem);
}

export async function createVideoItem(
  input: CreateVideoItemInput,
): Promise<VideoListItem> {
  await connectToDatabase();

  const nextOrder = await getNextVideoOrder();

  const createdItem = await VideoItemModel.create({
    title: input.title,
    uploadedVideo: input.uploadedVideo ?? null,
    externalVideo: input.externalVideo ?? null,
    order: nextOrder,
    isPublished: input.isPublished ?? true,
  });

  return mapVideoItem(createdItem);
}