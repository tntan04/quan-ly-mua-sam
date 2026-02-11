import { ObjectId } from "mongodb";
import { getDB } from "../lib/mongo.js";

export default async function handler(req, res) {
  const db = await getDB();
  const collection = db.collection("products");

  try {
    // parse body thủ công nếu là POST/PUT/DELETE
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // 1️⃣ GET
    if (req.method === "GET") {
      const products = await collection.find().toArray();
      return res.status(200).json(products);
    }

    // 2️⃣ POST
    if (req.method === "POST") {
      const { name, price, stock } = body;

      const result = await collection.insertOne({
        name,
        price: Number(price),
        stock: Number(stock),
        createdAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        insertedId: result.insertedId,
      });
    }

    // 3️⃣ PUT
    if (req.method === "PUT") {
      const { id, name, price, stock } = body;

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, price: Number(price), stock: Number(stock) } }
      );

      return res.status(200).json({ success: true });
    }

    // 4️⃣ DELETE
    if (req.method === "DELETE") {
      const { id } = body;

      await collection.deleteOne({ _id: new ObjectId(id) });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
