import { MongoClient } from "mongodb";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;

  return client;
}

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db("test"); // bạn có thể đổi tên database sau

    const collections = await db.listCollections().toArray();

    res.status(200).json({
      success: true,
      collections: collections.map(c => c.name),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
