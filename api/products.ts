import { ObjectId } from "mongodb";
import { getDB } from "../src/services/dbService";
export default async function handler(req, res) {
  const db = await getDB();
  const collection = db.collection("products");

  try {
    // 1️⃣ LẤY DANH SÁCH
    if (req.method === "GET") {
      const products = await collection.find().toArray();
      return res.json(products);
    }

    // 2️⃣ THÊM SẢN PHẨM
    if (req.method === "POST") {
      const { name, price, stock } = req.body;

      const result = await collection.insertOne({
        name,
        price: Number(price),
        stock: Number(stock),
        createdAt: new Date(),
      });

      return res.json({ success: true, insertedId: result.insertedId });
    }

    // 3️⃣ CẬP NHẬT
    if (req.method === "PUT") {
      const { id, name, price, stock } = req.body;

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, price: Number(price), stock: Number(stock) } }
      );

      return res.json({ success: true });
    }

    // 4️⃣ XOÁ
    if (req.method === "DELETE") {
      const { id } = req.body;

      await collection.deleteOne({ _id: new ObjectId(id) });

      return res.json({ success: true });
    }

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
