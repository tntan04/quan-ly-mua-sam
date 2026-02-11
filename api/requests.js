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
    const db = client.db("quanly");
    const collection = db.collection("requests");

    if (req.method === "GET") {
      const data = await collection.find({}).toArray();
      res.status(200).json(data);
    }

    if (req.method === "POST") {
      const newRequest = req.body;
      const result = await collection.insertOne({
        ...newRequest,
        createdAt: new Date(),
      });

      res.status(200).json({ insertedId: result.insertedId });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
