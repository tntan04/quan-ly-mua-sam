import { MongoClient } from "mongodb";

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;

  return client;
}

export default async function handler(req, res) {
  try {
    const client = await connectToDatabase();
    const db = client.db("quanly"); // tên database bạn muốn

    const collection = db.collection("testCollection");

    // Tạo dữ liệu mẫu
    const sampleData = {
      name: "Test User",
      role: "Admin",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(sampleData);

    res.status(200).json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
