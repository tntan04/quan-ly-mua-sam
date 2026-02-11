import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add MONGODB_URI to Vercel Environment Variables");
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { client: null, promise: null };
}

export async function getDB() {
  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect();
  }

  const client = await cached.promise;
  return client.db();
}
