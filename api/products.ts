import { ObjectId } from "mongodb";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDB } from "./mongo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const db = await getDB();
    const collection = db.collection("products");

    // 1️⃣ GET - LẤY DANH SÁCH
    if (req.method === "GET") {
      const products = await collection.find().toArray();
      return res.status(200).json(products);
    }

    // 2️⃣ POST - THÊM
    if (req.method === "POST") {
      const { name, price, stock } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: "Missing name" });
      }

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

    // 3️⃣ PUT - CẬP NHẬT
    if (req.method === "PUT") {
      const { id, name, price, stock } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: "Missing id" });
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name,
            price: Number(price),
            stock: Number(stock),
          },
        }
      );

      return res.status(200).json({ success: true });
    }

    // 4️⃣ DELETE - XOÁ
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ success: false, error: "Missing id" });
      }

      await collection.deleteOne({ _id: new ObjectId(id) });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
