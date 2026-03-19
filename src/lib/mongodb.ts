import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = globalCache;

export async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (globalCache.conn) {
    console.log("[MongoDB] Using cached database connection");
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    console.log("[MongoDB] Connecting to database...");

    globalCache.promise = mongoose.connect(mongodbUri).then((mongooseInstance) => {
      console.log("[MongoDB] Database connected successfully");
      return mongooseInstance;
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}